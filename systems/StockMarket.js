class StockMarket {
    constructor(database) {
        this.db = database;
        this.volatility = 0.05; // 5% 기본 변동성
    }

    async updatePrices() {
        try {
            const stocks = await this.db.all('SELECT * FROM stocks');
            
            for (const stock of stocks) {
                const newPrice = this.calculateNewPrice(stock.current_price, stock.sector);
                const changePercent = ((newPrice - stock.current_price) / stock.current_price) * 100;

                await this.db.run(`
                    UPDATE stocks 
                    SET current_price = ?, change_percent = ?, last_updated = CURRENT_TIMESTAMP
                    WHERE symbol = ?
                `, [newPrice, changePercent, stock.symbol]);

                // 주요 변동 시 뉴스 생성
                if (Math.abs(changePercent) > 10) {
                    await this.generateNews(stock, changePercent);
                }
            }

            console.log(`${stocks.length}개 주식 가격 업데이트 완료`);
        } catch (error) {
            console.error('주식 가격 업데이트 오류:', error);
        }
    }

    calculateNewPrice(currentPrice, sector) {
        // 섹터별 변동성 조정
        let sectorVolatility = this.volatility;
        switch (sector) {
            case 'technology':
                sectorVolatility = 0.08; // 기술주는 높은 변동성
                break;
            case 'finance':
                sectorVolatility = 0.04; // 금융주는 낮은 변동성
                break;
            case 'entertainment':
                sectorVolatility = 0.12; // 엔터테인먼트는 매우 높은 변동성
                break;
        }

        // 랜덤 변동 (-변동성 ~ +변동성)
        const change = (Math.random() - 0.5) * 2 * sectorVolatility;
        
        // 추세 요소 (약간의 상승 편향)
        const trend = 0.001; 
        
        // 새 가격 계산
        const newPrice = currentPrice * (1 + change + trend);
        
        // 최소 가격 1원 보장
        return Math.max(1, Math.round(newPrice));
    }

    async generateNews(stock, changePercent) {
        const newsTemplates = {
            positive: [
                `${stock.name}, 신제품 출시로 ${changePercent.toFixed(1)}% 급등!`,
                `${stock.name} 실적 호조로 주가 상승세!`,
                `${stock.name}, 대규모 투자 유치 성공!`
            ],
            negative: [
                `${stock.name}, 경영진 스캔들로 ${Math.abs(changePercent).toFixed(1)}% 급락!`,
                `${stock.name} 실적 부진으로 주가 하락!`,
                `${stock.name}, 규제 강화로 주가 타격!`
            ]
        };

        const isPositive = changePercent > 0;
        const templates = isPositive ? newsTemplates.positive : newsTemplates.negative;
        const news = templates[Math.floor(Math.random() * templates.length)];

        // 뉴스를 데이터베이스에 저장하거나 디스코드 채널에 발송
        console.log(`📰 주식 뉴스: ${news}`);
    }

    async buyStock(playerId, symbol, quantity) {
        try {
            // 주식 정보 조회
            const stock = await this.db.get('SELECT * FROM stocks WHERE symbol = ?', [symbol]);
            if (!stock) {
                throw new Error('존재하지 않는 주식입니다.');
            }

            // 플레이어 정보 조회
            const player = await this.db.get('SELECT * FROM players WHERE id = ?', [playerId]);
            if (!player) {
                throw new Error('플레이어를 찾을 수 없습니다.');
            }

            const totalCost = stock.current_price * quantity;
            
            // 자금 확인
            if (player.money < totalCost) {
                throw new Error('자금이 부족합니다.');
            }

            // 기존 보유 주식 확인
            const existingStock = await this.db.get(`
                SELECT * FROM player_stocks 
                WHERE player_id = ? AND stock_symbol = ?
            `, [playerId, symbol]);

            if (existingStock) {
                // 기존 보유 주식 업데이트 (평균 단가 계산)
                const totalQuantity = existingStock.quantity + quantity;
                const totalValue = (existingStock.average_price * existingStock.quantity) + totalCost;
                const newAveragePrice = totalValue / totalQuantity;

                await this.db.run(`
                    UPDATE player_stocks 
                    SET quantity = ?, average_price = ?
                    WHERE id = ?
                `, [totalQuantity, newAveragePrice, existingStock.id]);
            } else {
                // 새로운 주식 보유 기록
                await this.db.run(`
                    INSERT INTO player_stocks (player_id, stock_symbol, quantity, average_price)
                    VALUES (?, ?, ?, ?)
                `, [playerId, symbol, quantity, stock.current_price]);
            }

            // 플레이어 자금 차감
            await this.db.run(`
                UPDATE players SET money = money - ? WHERE id = ?
            `, [totalCost, playerId]);

            // 거래 내역 기록
            await this.db.run(`
                INSERT INTO transactions (player_id, type, amount, description, stock_symbol, quantity, price)
                VALUES (?, 'buy', ?, ?, ?, ?, ?)
            `, [playerId, -totalCost, `${symbol} 매수`, symbol, quantity, stock.current_price]);

            return {
                success: true,
                message: `${stock.name} ${quantity}주를 ${stock.current_price.toLocaleString()}원에 매수했습니다.`,
                totalCost: totalCost
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async sellStock(playerId, symbol, quantity) {
        try {
            // 보유 주식 확인
            const playerStock = await this.db.get(`
                SELECT * FROM player_stocks 
                WHERE player_id = ? AND stock_symbol = ?
            `, [playerId, symbol]);

            if (!playerStock || playerStock.quantity < quantity) {
                throw new Error('보유 주식이 부족합니다.');
            }

            // 현재 주식 가격 조회
            const stock = await this.db.get('SELECT * FROM stocks WHERE symbol = ?', [symbol]);
            if (!stock) {
                throw new Error('존재하지 않는 주식입니다.');
            }

            const totalRevenue = stock.current_price * quantity;
            const profit = (stock.current_price - playerStock.average_price) * quantity;

            // 보유 주식 업데이트
            if (playerStock.quantity === quantity) {
                // 전량 매도 - 기록 삭제
                await this.db.run(`
                    DELETE FROM player_stocks WHERE id = ?
                `, [playerStock.id]);
            } else {
                // 일부 매도 - 수량만 감소
                await this.db.run(`
                    UPDATE player_stocks SET quantity = quantity - ? WHERE id = ?
                `, [quantity, playerStock.id]);
            }

            // 플레이어 자금 증가
            await this.db.run(`
                UPDATE players SET money = money + ? WHERE id = ?
            `, [totalRevenue, playerId]);

            // 거래 내역 기록
            await this.db.run(`
                INSERT INTO transactions (player_id, type, amount, description, stock_symbol, quantity, price)
                VALUES (?, 'sell', ?, ?, ?, ?, ?)
            `, [playerId, totalRevenue, `${symbol} 매도`, symbol, quantity, stock.current_price]);

            return {
                success: true,
                message: `${stock.name} ${quantity}주를 ${stock.current_price.toLocaleString()}원에 매도했습니다.`,
                totalRevenue: totalRevenue,
                profit: profit
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async getPortfolio(playerId) {
        try {
            const portfolio = await this.db.all(`
                SELECT 
                    ps.*,
                    s.name,
                    s.current_price,
                    s.change_percent,
                    (s.current_price * ps.quantity) as current_value,
                    (ps.average_price * ps.quantity) as purchase_value,
                    ((s.current_price - ps.average_price) * ps.quantity) as profit_loss,
                    (((s.current_price - ps.average_price) / ps.average_price) * 100) as profit_rate
                FROM player_stocks ps
                JOIN stocks s ON ps.stock_symbol = s.symbol
                WHERE ps.player_id = ?
                ORDER BY current_value DESC
            `, [playerId]);

            // 총 포트폴리오 가치 계산
            const totalValue = portfolio.reduce((sum, stock) => sum + stock.current_value, 0);
            const totalPurchaseValue = portfolio.reduce((sum, stock) => sum + stock.purchase_value, 0);
            const totalProfitLoss = totalValue - totalPurchaseValue;
            const totalProfitRate = totalPurchaseValue > 0 ? (totalProfitLoss / totalPurchaseValue) * 100 : 0;

            return {
                stocks: portfolio,
                summary: {
                    totalValue: totalValue,
                    totalPurchaseValue: totalPurchaseValue,
                    totalProfitLoss: totalProfitLoss,
                    totalProfitRate: totalProfitRate
                }
            };

        } catch (error) {
            console.error('포트폴리오 조회 오류:', error);
            return null;
        }
    }

    async getMarketData() {
        try {
            const stocks = await this.db.all(`
                SELECT symbol, name, current_price, change_percent, sector
                FROM stocks
                ORDER BY 
                    CASE 
                        WHEN change_percent > 0 THEN 0
                        ELSE 1
                    END,
                    ABS(change_percent) DESC
            `);

            return stocks;
        } catch (error) {
            console.error('시장 데이터 조회 오류:', error);
            return [];
        }
    }

    async getTopMovers() {
        try {
            const gainers = await this.db.all(`
                SELECT symbol, name, current_price, change_percent
                FROM stocks
                WHERE change_percent > 0
                ORDER BY change_percent DESC
                LIMIT 5
            `);

            const losers = await this.db.all(`
                SELECT symbol, name, current_price, change_percent
                FROM stocks
                WHERE change_percent < 0
                ORDER BY change_percent ASC
                LIMIT 5
            `);

            return { gainers, losers };
        } catch (error) {
            console.error('상위 변동주 조회 오류:', error);
            return { gainers: [], losers: [] };
        }
    }

    async getStockInfo(symbol) {
        try {
            const stock = await this.db.get('SELECT * FROM stocks WHERE symbol = ?', [symbol]);
            if (!stock) return null;

            // 최근 거래 내역
            const recentTrades = await this.db.all(`
                SELECT 
                    p.username,
                    t.type,
                    t.quantity,
                    t.price,
                    t.timestamp
                FROM transactions t
                JOIN players p ON t.player_id = p.id
                WHERE t.stock_symbol = ?
                ORDER BY t.timestamp DESC
                LIMIT 10
            `, [symbol]);

            return {
                ...stock,
                recentTrades: recentTrades
            };
        } catch (error) {
            console.error('주식 정보 조회 오류:', error);
            return null;
        }
    }
}

module.exports = StockMarket;

