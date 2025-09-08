const { EmbedBuilder } = require('discord.js');

class AuctionSystem {
    constructor(database) {
        this.db = database;
        
        this.auctionTypes = [
            { id: 'standard', name: '일반 경매', description: '24시간 경매', duration: 24, fee_rate: 0.05 },
            { id: 'quick', name: '빠른 경매', description: '6시간 경매', duration: 6, fee_rate: 0.08 },
            { id: 'premium', name: '프리미엄 경매', description: '72시간 경매', duration: 72, fee_rate: 0.03 }
        ];

        this.auctionCategories = [
            { id: 'weapons', name: '무기', emoji: '⚔️' },
            { id: 'armor', name: '방어구', emoji: '🛡️' },
            { id: 'accessories', name: '장신구', emoji: '💍' },
            { id: 'consumables', name: '소비품', emoji: '🧪' },
            { id: 'materials', name: '재료', emoji: '📦' },
            { id: 'rare_items', name: '희귀템', emoji: '✨' },
            { id: 'pets', name: '펫', emoji: '🐕' },
            { id: 'misc', name: '기타', emoji: '📋' }
        ];
    }

    async initializeAuctionSystem() {
        // 경매 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS auctions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                seller_id TEXT NOT NULL,
                item_id INTEGER NOT NULL,
                item_quantity INTEGER DEFAULT 1,
                starting_price REAL NOT NULL,
                current_price REAL NOT NULL,
                buyout_price REAL,
                auction_type TEXT DEFAULT 'standard',
                category TEXT,
                status TEXT DEFAULT 'active', -- 'active', 'sold', 'expired', 'cancelled'
                start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                end_time DATETIME NOT NULL,
                winner_id TEXT,
                final_price REAL DEFAULT 0,
                fee_paid REAL DEFAULT 0,
                title TEXT,
                description TEXT,
                FOREIGN KEY (seller_id) REFERENCES players(id),
                FOREIGN KEY (item_id) REFERENCES items(id),
                FOREIGN KEY (winner_id) REFERENCES players(id)
            )
        `);

        // 입찰 기록 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS auction_bids (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                auction_id INTEGER NOT NULL,
                bidder_id TEXT NOT NULL,
                bid_amount REAL NOT NULL,
                bid_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_winning BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (auction_id) REFERENCES auctions(id),
                FOREIGN KEY (bidder_id) REFERENCES players(id)
            )
        `);

        // 경매 관심 목록 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS auction_watchlist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                auction_id INTEGER NOT NULL,
                added_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (player_id) REFERENCES players(id),
                FOREIGN KEY (auction_id) REFERENCES auctions(id),
                UNIQUE(player_id, auction_id)
            )
        `);

        // 경매 알림 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS auction_notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                auction_id INTEGER NOT NULL,
                notification_type TEXT NOT NULL, -- 'outbid', 'won', 'sold', 'expired'
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (player_id) REFERENCES players(id),
                FOREIGN KEY (auction_id) REFERENCES auctions(id)
            )
        `);

        // 경매 통계 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS auction_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id INTEGER NOT NULL,
                average_price REAL DEFAULT 0,
                min_price REAL DEFAULT 0,
                max_price REAL DEFAULT 0,
                total_sales INTEGER DEFAULT 0,
                last_sale_price REAL DEFAULT 0,
                last_sale_date DATETIME,
                price_trend TEXT DEFAULT 'stable', -- 'rising', 'falling', 'stable'
                FOREIGN KEY (item_id) REFERENCES items(id),
                UNIQUE(item_id)
            )
        `);

        // 입찰 제한 테이블 (스나이핑 방지)
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS bid_restrictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                auction_id INTEGER NOT NULL,
                last_bid_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                bid_count INTEGER DEFAULT 1,
                FOREIGN KEY (player_id) REFERENCES players(id),
                FOREIGN KEY (auction_id) REFERENCES auctions(id),
                UNIQUE(player_id, auction_id)
            )
        `);

        // console.log('경매 시스템 초기화 완료');
    }

    async createAuction(sellerId, itemId, quantity, startingPrice, buyoutPrice = null, auctionType = 'standard', title = '', description = '') {
        try {
            // 아이템 보유 확인
            const inventory = await this.db.get(`
                SELECT pi.quantity, i.name, i.category
                FROM player_inventory pi
                JOIN items i ON pi.item_id = i.id
                WHERE pi.player_id = ? AND pi.item_id = ?
            `, [sellerId, itemId]);

            if (!inventory || inventory.quantity < quantity) {
                return { 
                    success: false, 
                    message: `아이템이 부족합니다. 보유: ${inventory ? inventory.quantity : 0}개` 
                };
            }

            // 경매 타입 확인
            const auctionTypeInfo = this.auctionTypes.find(t => t.id === auctionType);
            if (!auctionTypeInfo) {
                return { success: false, message: '잘못된 경매 타입입니다.' };
            }

            // 경매 수수료 계산
            const fee = Math.floor(startingPrice * auctionTypeInfo.fee_rate);
            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [sellerId]);
            
            if (player.money < fee) {
                return { 
                    success: false, 
                    message: `경매 등록 수수료가 부족합니다. 필요: ${fee.toLocaleString()}원` 
                };
            }

            // 종료 시간 계산
            const endTime = new Date();
            endTime.setHours(endTime.getHours() + auctionTypeInfo.duration);

            // 카테고리 자동 결정
            const category = this.determineCategory(inventory.category, inventory.name);

            // 경매 생성
            const result = await this.db.run(`
                INSERT INTO auctions (
                    seller_id, item_id, item_quantity, starting_price, current_price, 
                    buyout_price, auction_type, category, end_time, fee_paid, title, description
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [sellerId, itemId, quantity, startingPrice, startingPrice, 
                buyoutPrice, auctionType, category, endTime.toISOString(), fee,
                title || inventory.name, description]);

            const auctionId = result.lastID;

            // 아이템 차감
            await this.db.run(`
                UPDATE player_inventory SET quantity = quantity - ? WHERE player_id = ? AND item_id = ?
            `, [quantity, sellerId, itemId]);

            // 수수료 차감
            await this.db.run(`
                UPDATE players SET money = money - ? WHERE id = ?
            `, [fee, sellerId]);

            // 거래 기록
            await this.db.run(`
                INSERT INTO transactions (player_id, type, amount, description)
                VALUES (?, 'auction_fee', ?, ?)
            `, [sellerId, -fee, `경매 등록 수수료 (${inventory.name})`]);

            return {
                success: true,
                message: `경매가 등록되었습니다! (수수료: ${fee.toLocaleString()}원)`,
                auctionId: auctionId,
                endTime: endTime
            };

        } catch (error) {
            console.error('경매 생성 오류:', error);
            return { success: false, message: '경매 등록 중 오류가 발생했습니다.' };
        }
    }

    async placeBid(bidderId, auctionId, bidAmount) {
        try {
            // 경매 정보 확인
            const auction = await this.db.get(`
                SELECT a.*, i.name as item_name
                FROM auctions a
                JOIN items i ON a.item_id = i.id
                WHERE a.id = ? AND a.status = 'active'
            `, [auctionId]);

            if (!auction) {
                return { success: false, message: '존재하지 않거나 종료된 경매입니다.' };
            }

            // 경매 시간 확인
            const now = new Date();
            const endTime = new Date(auction.end_time);
            if (now >= endTime) {
                await this.endAuction(auctionId);
                return { success: false, message: '이미 종료된 경매입니다.' };
            }

            // 자신의 경매인지 확인
            if (auction.seller_id === bidderId) {
                return { success: false, message: '자신의 경매에는 입찰할 수 없습니다.' };
            }

            // 최소 입찰가 확인
            const minBid = auction.current_price + 1000; // 최소 1000원 더 높게
            if (bidAmount < minBid) {
                return { 
                    success: false, 
                    message: `최소 입찰가: ${minBid.toLocaleString()}원` 
                };
            }

            // 즉시 구매가 확인
            if (auction.buyout_price && bidAmount >= auction.buyout_price) {
                return await this.buyout(bidderId, auctionId);
            }

            // 플레이어 돈 확인
            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [bidderId]);
            if (player.money < bidAmount) {
                return { success: false, message: '돈이 부족합니다.' };
            }

            // 입찰 제한 확인 (스나이핑 방지)
            const bidRestriction = await this.checkBidRestriction(bidderId, auctionId);
            if (!bidRestriction.allowed) {
                return { success: false, message: bidRestriction.message };
            }

            // 이전 최고 입찰자에게 환불
            const previousWinner = await this.db.get(`
                SELECT bidder_id, bid_amount FROM auction_bids 
                WHERE auction_id = ? AND is_winning = TRUE
            `, [auctionId]);

            if (previousWinner) {
                await this.db.run(`
                    UPDATE players SET money = money + ? WHERE id = ?
                `, [previousWinner.bid_amount, previousWinner.bidder_id]);

                // 환불 알림
                await this.addNotification(previousWinner.bidder_id, auctionId, 'outbid', 
                    `${auction.item_name} 경매에서 더 높은 입찰이 들어왔습니다.`);
            }

            // 기존 승리 입찰 무효화
            await this.db.run(`
                UPDATE auction_bids SET is_winning = FALSE WHERE auction_id = ?
            `, [auctionId]);

            // 새 입찰 기록
            await this.db.run(`
                INSERT INTO auction_bids (auction_id, bidder_id, bid_amount, is_winning)
                VALUES (?, ?, ?, TRUE)
            `, [auctionId, bidderId, bidAmount]);

            // 돈 차감
            await this.db.run(`
                UPDATE players SET money = money - ? WHERE id = ?
            `, [bidAmount, bidderId]);

            // 경매 현재가 업데이트
            await this.db.run(`
                UPDATE auctions SET current_price = ? WHERE id = ?
            `, [bidAmount, auctionId]);

            // 입찰 제한 업데이트
            await this.updateBidRestriction(bidderId, auctionId);

            // 마지막 5분 이내 입찰시 시간 연장 (스나이핑 방지)
            const timeLeft = endTime.getTime() - now.getTime();
            if (timeLeft < 5 * 60 * 1000) { // 5분 미만
                const newEndTime = new Date(now.getTime() + 5 * 60 * 1000); // 5분 연장
                await this.db.run(`
                    UPDATE auctions SET end_time = ? WHERE id = ?
                `, [newEndTime.toISOString(), auctionId]);
            }

            return {
                success: true,
                message: `입찰에 성공했습니다! (${bidAmount.toLocaleString()}원)`,
                currentPrice: bidAmount,
                timeLeft: timeLeft
            };

        } catch (error) {
            console.error('입찰 오류:', error);
            return { success: false, message: '입찰 중 오류가 발생했습니다.' };
        }
    }

    async buyout(buyerId, auctionId) {
        try {
            const auction = await this.db.get(`
                SELECT a.*, i.name as item_name
                FROM auctions a
                JOIN items i ON a.item_id = i.id
                WHERE a.id = ? AND a.status = 'active' AND a.buyout_price IS NOT NULL
            `, [auctionId]);

            if (!auction) {
                return { success: false, message: '즉시 구매가 설정되지 않은 경매입니다.' };
            }

            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [buyerId]);
            if (player.money < auction.buyout_price) {
                return { success: false, message: '돈이 부족합니다.' };
            }

            // 이전 입찰자들에게 환불
            const previousBids = await this.db.all(`
                SELECT bidder_id, bid_amount FROM auction_bids 
                WHERE auction_id = ? AND is_winning = TRUE
            `, [auctionId]);

            for (const bid of previousBids) {
                await this.db.run(`
                    UPDATE players SET money = money + ? WHERE id = ?
                `, [bid.bid_amount, bid.bidder_id]);
            }

            // 즉시 구매 처리
            await this.completeAuction(auctionId, buyerId, auction.buyout_price, 'buyout');

            return {
                success: true,
                message: `${auction.item_name}을(를) 즉시 구매했습니다! (${auction.buyout_price.toLocaleString()}원)`,
                price: auction.buyout_price
            };

        } catch (error) {
            console.error('즉시 구매 오류:', error);
            return { success: false, message: '즉시 구매 중 오류가 발생했습니다.' };
        }
    }

    async completeAuction(auctionId, winnerId, finalPrice, completionType = 'auction') {
        const auction = await this.db.get('SELECT * FROM auctions WHERE id = ?', [auctionId]);
        if (!auction) return;

        // 경매 상태 업데이트
        await this.db.run(`
            UPDATE auctions 
            SET status = 'sold', winner_id = ?, final_price = ?
            WHERE id = ?
        `, [winnerId, finalPrice, auctionId]);

        // 구매자 돈 차감 (입찰시 이미 차감되었으므로 차액만)
        if (completionType === 'buyout') {
            await this.db.run(`
                UPDATE players SET money = money - ? WHERE id = ?
            `, [finalPrice, winnerId]);
        }

        // 판매자에게 돈 지급 (수수료 제외)
        const auctionTypeInfo = this.auctionTypes.find(t => t.id === auction.auction_type);
        const fee = Math.floor(finalPrice * auctionTypeInfo.fee_rate);
        const sellerAmount = finalPrice - fee;

        await this.db.run(`
            UPDATE players SET money = money + ? WHERE id = ?
        `, [sellerAmount, auction.seller_id]);

        // 구매자에게 아이템 지급
        const existingItem = await this.db.get(`
            SELECT * FROM player_inventory WHERE player_id = ? AND item_id = ?
        `, [winnerId, auction.item_id]);

        if (existingItem) {
            await this.db.run(`
                UPDATE player_inventory SET quantity = quantity + ? WHERE id = ?
            `, [auction.item_quantity, existingItem.id]);
        } else {
            await this.db.run(`
                INSERT INTO player_inventory (player_id, item_id, quantity)
                VALUES (?, ?, ?)
            `, [winnerId, auction.item_id, auction.item_quantity]);
        }

        // 거래 기록
        await this.db.run(`
            INSERT INTO transactions (player_id, type, amount, description)
            VALUES (?, 'auction_sale', ?, ?)
        `, [auction.seller_id, sellerAmount, `경매 판매 (수수료 ${fee.toLocaleString()}원 차감)`]);

        await this.db.run(`
            INSERT INTO transactions (player_id, type, amount, description)
            VALUES (?, 'auction_purchase', ?, ?)
        `, [winnerId, -finalPrice, `경매 구매`]);

        // 알림 발송
        await this.addNotification(auction.seller_id, auctionId, 'sold', 
            `경매가 ${finalPrice.toLocaleString()}원에 판매되었습니다!`);
        await this.addNotification(winnerId, auctionId, 'won', 
            `경매에서 낙찰받았습니다! (${finalPrice.toLocaleString()}원)`);

        // 가격 통계 업데이트
        await this.updatePriceStats(auction.item_id, finalPrice);
    }

    async endAuction(auctionId) {
        const auction = await this.db.get('SELECT * FROM auctions WHERE id = ?', [auctionId]);
        if (!auction || auction.status !== 'active') return;

        const winningBid = await this.db.get(`
            SELECT * FROM auction_bids 
            WHERE auction_id = ? AND is_winning = TRUE
        `, [auctionId]);

        if (winningBid) {
            // 낙찰자가 있는 경우
            await this.completeAuction(auctionId, winningBid.bidder_id, winningBid.bid_amount);
        } else {
            // 입찰자가 없는 경우 - 유찰
            await this.db.run(`
                UPDATE auctions SET status = 'expired' WHERE id = ?
            `, [auctionId]);

            // 판매자에게 아이템 반환
            const existingItem = await this.db.get(`
                SELECT * FROM player_inventory WHERE player_id = ? AND item_id = ?
            `, [auction.seller_id, auction.item_id]);

            if (existingItem) {
                await this.db.run(`
                    UPDATE player_inventory SET quantity = quantity + ? WHERE id = ?
                `, [auction.item_quantity, existingItem.id]);
            } else {
                await this.db.run(`
                    INSERT INTO player_inventory (player_id, item_id, quantity)
                    VALUES (?, ?, ?)
                `, [auction.seller_id, auction.item_id, auction.item_quantity]);
            }

            // 알림
            await this.addNotification(auction.seller_id, auctionId, 'expired', 
                '경매가 유찰되어 아이템이 반환되었습니다.');
        }
    }

    async checkBidRestriction(playerId, auctionId) {
        const restriction = await this.db.get(`
            SELECT * FROM bid_restrictions WHERE player_id = ? AND auction_id = ?
        `, [playerId, auctionId]);

        if (!restriction) {
            return { allowed: true };
        }

        const now = new Date();
        const lastBidTime = new Date(restriction.last_bid_time);
        const timeDiff = now.getTime() - lastBidTime.getTime();

        // 30초 내 재입찰 제한
        if (timeDiff < 30000) {
            return { 
                allowed: false, 
                message: `입찰 제한: ${Math.ceil((30000 - timeDiff) / 1000)}초 후 다시 시도하세요.` 
            };
        }

        // 1분간 최대 3회 입찰 제한
        if (timeDiff < 60000 && restriction.bid_count >= 3) {
            return { 
                allowed: false, 
                message: '1분간 최대 3회까지만 입찰할 수 있습니다.' 
            };
        }

        return { allowed: true };
    }

    async updateBidRestriction(playerId, auctionId) {
        const restriction = await this.db.get(`
            SELECT * FROM bid_restrictions WHERE player_id = ? AND auction_id = ?
        `, [playerId, auctionId]);

        if (!restriction) {
            await this.db.run(`
                INSERT INTO bid_restrictions (player_id, auction_id)
                VALUES (?, ?)
            `, [playerId, auctionId]);
        } else {
            const now = new Date();
            const lastBidTime = new Date(restriction.last_bid_time);
            const timeDiff = now.getTime() - lastBidTime.getTime();

            let newCount = timeDiff < 60000 ? restriction.bid_count + 1 : 1;

            await this.db.run(`
                UPDATE bid_restrictions 
                SET last_bid_time = CURRENT_TIMESTAMP, bid_count = ?
                WHERE player_id = ? AND auction_id = ?
            `, [newCount, playerId, auctionId]);
        }
    }

    async updatePriceStats(itemId, salePrice) {
        const stats = await this.db.get('SELECT * FROM auction_stats WHERE item_id = ?', [itemId]);

        if (!stats) {
            await this.db.run(`
                INSERT INTO auction_stats (item_id, average_price, min_price, max_price, total_sales, last_sale_price, last_sale_date)
                VALUES (?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP)
            `, [itemId, salePrice, salePrice, salePrice, salePrice]);
        } else {
            const newTotalSales = stats.total_sales + 1;
            const newAveragePrice = ((stats.average_price * stats.total_sales) + salePrice) / newTotalSales;
            const newMinPrice = Math.min(stats.min_price, salePrice);
            const newMaxPrice = Math.max(stats.max_price, salePrice);

            // 가격 트렌드 계산
            let priceTrend = 'stable';
            if (salePrice > stats.average_price * 1.1) priceTrend = 'rising';
            else if (salePrice < stats.average_price * 0.9) priceTrend = 'falling';

            await this.db.run(`
                UPDATE auction_stats 
                SET average_price = ?, min_price = ?, max_price = ?, total_sales = ?, 
                    last_sale_price = ?, last_sale_date = CURRENT_TIMESTAMP, price_trend = ?
                WHERE item_id = ?
            `, [newAveragePrice, newMinPrice, newMaxPrice, newTotalSales, salePrice, priceTrend, itemId]);
        }
    }

    async addNotification(playerId, auctionId, type, message) {
        await this.db.run(`
            INSERT INTO auction_notifications (player_id, auction_id, notification_type, message)
            VALUES (?, ?, ?, ?)
        `, [playerId, auctionId, type, message]);
    }

    async getActiveAuctions(category = null, searchTerm = '', sortBy = 'end_time', page = 1, limit = 10) {
        let sql = `
            SELECT a.*, i.name as item_name, i.rarity, p.username as seller_name,
                   julianday('now') - julianday(a.end_time) as time_left_days
            FROM auctions a
            JOIN items i ON a.item_id = i.id
            JOIN players p ON a.seller_id = p.id
            WHERE a.status = 'active' AND datetime(a.end_time) > datetime('now')
        `;
        const params = [];

        if (category) {
            sql += ' AND a.category = ?';
            params.push(category);
        }

        if (searchTerm) {
            sql += ' AND (i.name LIKE ? OR a.title LIKE ? OR a.description LIKE ?)';
            params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }

        // 정렬
        switch (sortBy) {
            case 'price_low':
                sql += ' ORDER BY a.current_price ASC';
                break;
            case 'price_high':
                sql += ' ORDER BY a.current_price DESC';
                break;
            case 'end_time':
                sql += ' ORDER BY a.end_time ASC';
                break;
            case 'newest':
                sql += ' ORDER BY a.start_time DESC';
                break;
            default:
                sql += ' ORDER BY a.end_time ASC';
        }

        sql += ` LIMIT ? OFFSET ?`;
        params.push(limit, (page - 1) * limit);

        return await this.db.all(sql, params);
    }

    async getPlayerAuctions(playerId, type = 'selling') {
        if (type === 'selling') {
            return await this.db.all(`
                SELECT a.*, i.name as item_name, i.rarity
                FROM auctions a
                JOIN items i ON a.item_id = i.id
                WHERE a.seller_id = ?
                ORDER BY a.start_time DESC
                LIMIT 20
            `, [playerId]);
        } else if (type === 'bidding') {
            return await this.db.all(`
                SELECT DISTINCT a.*, i.name as item_name, i.rarity, ab.bid_amount, ab.is_winning
                FROM auctions a
                JOIN items i ON a.item_id = i.id
                JOIN auction_bids ab ON a.id = ab.auction_id
                WHERE ab.bidder_id = ? AND a.status = 'active'
                ORDER BY ab.bid_time DESC
                LIMIT 20
            `, [playerId]);
        }
    }

    determineCategory(itemCategory, itemName) {
        const nameUpper = itemName.toUpperCase();
        
        if (itemCategory === 'weapon' || nameUpper.includes('검') || nameUpper.includes('활') || nameUpper.includes('지팡이')) {
            return 'weapons';
        } else if (itemCategory === 'armor' || nameUpper.includes('갑옷') || nameUpper.includes('투구') || nameUpper.includes('방패')) {
            return 'armor';
        } else if (itemCategory === 'accessory' || nameUpper.includes('반지') || nameUpper.includes('목걸이')) {
            return 'accessories';
        } else if (itemCategory === 'consumable' || nameUpper.includes('물약') || nameUpper.includes('포션')) {
            return 'consumables';
        } else if (itemCategory === 'material' || nameUpper.includes('광석') || nameUpper.includes('재료')) {
            return 'materials';
        } else if (itemCategory === 'pet') {
            return 'pets';
        } else {
            return 'misc';
        }
    }

    createAuctionListEmbed(auctions, title = '경매 목록', page = 1) {
        const embed = new EmbedBuilder()
            .setColor('#ff9900')
            .setTitle(`🏺 ${title} (페이지 ${page})`)
            .setTimestamp();

        if (auctions.length === 0) {
            embed.setDescription('진행 중인 경매가 없습니다.');
            return embed;
        }

        for (const auction of auctions) {
            const timeLeft = this.formatTimeLeft(auction.time_left_days);
            const rarityEmoji = this.getRarityEmoji(auction.rarity);
            
            embed.addFields({
                name: `${rarityEmoji} ${auction.item_name} x${auction.item_quantity} (ID: ${auction.id})`,
                value: [
                    `💰 현재가: ${auction.current_price.toLocaleString()}원`,
                    auction.buyout_price ? `🏃 즉시구매: ${auction.buyout_price.toLocaleString()}원` : '',
                    `👤 판매자: ${auction.seller_name}`,
                    `⏰ 남은시간: ${timeLeft}`,
                    auction.description ? `📝 ${auction.description}` : ''
                ].filter(line => line).join('\n'),
                inline: true
            });
        }

        embed.setFooter({ text: '입찰하려면 "/경매 입찰 {경매ID} {금액}"을 사용하세요' });
        return embed;
    }

    createAuctionDetailEmbed(auction, bids = []) {
        const embed = new EmbedBuilder()
            .setColor('#ff6600')
            .setTitle(`🏺 ${auction.item_name} 경매 상세`)
            .setDescription(auction.description || '설명 없음')
            .setTimestamp();

        const timeLeft = this.formatTimeLeft(auction.time_left_days);
        const rarityEmoji = this.getRarityEmoji(auction.rarity);

        embed.addFields({
            name: '📦 경매 정보',
            value: [
                `${rarityEmoji} **${auction.item_name}** x${auction.item_quantity}`,
                `💰 현재가: ${auction.current_price.toLocaleString()}원`,
                `🚀 시작가: ${auction.starting_price.toLocaleString()}원`,
                auction.buyout_price ? `🏃 즉시구매: ${auction.buyout_price.toLocaleString()}원` : '',
                `👤 판매자: ${auction.seller_name}`,
                `⏰ 남은시간: ${timeLeft}`,
                `🏷️ 카테고리: ${auction.category}`
            ].filter(line => line).join('\n'),
            inline: false
        });

        if (bids.length > 0) {
            const recentBids = bids.slice(0, 5).map(bid => 
                `💰 ${bid.bid_amount.toLocaleString()}원 - ${bid.bidder_name} ${bid.is_winning ? '(현재 최고가)' : ''}`
            );
            
            embed.addFields({
                name: '📊 최근 입찰 내역',
                value: recentBids.join('\n'),
                inline: false
            });
        }

        return embed;
    }

    formatTimeLeft(timeLeftDays) {
        const totalSeconds = Math.abs(timeLeftDays * 24 * 60 * 60);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        
        if (timeLeftDays < 0) return '종료됨';
        if (hours > 0) return `${hours}시간 ${minutes}분`;
        return `${minutes}분`;
    }

    getRarityEmoji(rarity) {
        const rarityEmojis = {
            'common': '⚪',
            'rare': '🔵',
            'epic': '🟣',
            'legendary': '🟡',
            'mythic': '🔴'
        };
        return rarityEmojis[rarity] || '⚪';
    }
    // === 통합 시스템 연동 ===
    
    async integrateWithOtherSystems(equipmentSystem, inventorySystem, playerSystem) {
        this.equipmentSystem = equipmentSystem;
        this.inventorySystem = inventorySystem;
        this.playerSystem = playerSystem;
        
        console.log('경매장 시스템이 다른 시스템들과 통합되었습니다.');
    }

    // 장비 시스템과 연동하여 아이템 정보 가져오기
    async getItemDetails(itemId) {
        if (this.equipmentSystem) {
            return this.equipmentSystem.getItemById(itemId);
        }
        
        // 기본 아이템 정보
        return {
            id: itemId,
            name: itemId,
            category: 'unknown',
            rarity: 'common',
            description: '알 수 없는 아이템'
        };
    }

    // 플레이어 인벤토리 확인
    async hasPlayerItem(playerId, itemId, quantity = 1) {
        if (this.inventorySystem) {
            return this.inventorySystem.hasItem(playerId, itemId, quantity);
        }
        
        // 임시 구현
        return true;
    }

    // 아이템을 플레이어에게서 제거
    async removeItemFromPlayer(playerId, itemId, quantity = 1) {
        if (this.inventorySystem) {
            return this.inventorySystem.removeItem(playerId, itemId, quantity);
        }
        
        console.log(`플레이어 ${playerId}에게서 ${itemId} ${quantity}개 제거됨`);
        return true;
    }

    // 아이템을 플레이어에게 지급
    async giveItemToPlayer(playerId, itemId, quantity = 1) {
        if (this.inventorySystem) {
            return this.inventorySystem.addItem(playerId, itemId, quantity);
        }
        
        console.log(`플레이어 ${playerId}에게 ${itemId} ${quantity}개 지급됨`);
        return true;
    }

    // 플레이어 돈 확인 및 차감
    async deductPlayerMoney(playerId, amount) {
        if (this.playerSystem) {
            return this.playerSystem.deductMoney(playerId, amount);
        }
        
        // 임시 구현
        return true;
    }

    // 플레이어에게 돈 지급
    async givePlayerMoney(playerId, amount) {
        if (this.playerSystem) {
            return this.playerSystem.addMoney(playerId, amount);
        }
        
        console.log(`플레이어 ${playerId}에게 ${amount}원 지급됨`);
        return true;
    }

    // === 고급 경매 기능 ===
    
    // 자동 재경매 시스템
    async setupAutoReauction(auctionId, maxAttempts = 3) {
        const auction = await this.getAuction(auctionId);
        if (!auction || auction.status !== 'expired') {
            return { success: false, message: '재경매할 수 없는 상태입니다.' };
        }

        // 시작가를 10% 낮춰서 재경매
        const newStartingPrice = Math.floor(auction.starting_price * 0.9);
        
        await this.db.run(`
            UPDATE auctions 
            SET status = 'active',
                starting_price = ?,
                current_price = ?,
                auto_reauction_count = auto_reauction_count + 1,
                end_time = datetime('now', '+24 hours')
            WHERE id = ? AND auto_reauction_count < ?
        `, [newStartingPrice, newStartingPrice, auctionId, maxAttempts]);

        return { success: true, message: '자동 재경매가 시작되었습니다.' };
    }

    // 관심 목록 시스템
    async addToWatchlist(playerId, auctionId) {
        try {
            await this.db.run(`
                INSERT OR IGNORE INTO auction_watchlist (player_id, auction_id) 
                VALUES (?, ?)
            `, [playerId, auctionId]);

            return { success: true, message: '관심 목록에 추가되었습니다.' };
        } catch (error) {
            return { success: false, message: '관심 목록 추가 중 오류가 발생했습니다.' };
        }
    }

    async removeFromWatchlist(playerId, auctionId) {
        await this.db.run(`
            DELETE FROM auction_watchlist 
            WHERE player_id = ? AND auction_id = ?
        `, [playerId, auctionId]);

        return { success: true, message: '관심 목록에서 제거되었습니다.' };
    }

    async getWatchlist(playerId) {
        return await this.db.run(`
            SELECT a.*, aw.added_at as watched_at
            FROM auctions a
            JOIN auction_watchlist aw ON a.id = aw.auction_id
            WHERE aw.player_id = ? AND a.status = 'active'
            ORDER BY aw.added_at DESC
        `, [playerId]);
    }

    // 경매 알림 시스템
    async sendBidNotification(auctionId, bidderId, bidAmount) {
        const auction = await this.getAuction(auctionId);
        if (!auction) return;

        // 이전 최고 입찰자에게 알림
        if (auction.highest_bidder && auction.highest_bidder !== bidderId) {
            await this.addNotification(auction.highest_bidder, 'bid_outbid', {
                auction_id: auctionId,
                item_name: auction.item_name,
                new_bid: bidAmount
            });
        }

        // 경매 등록자에게 알림
        if (auction.seller_id !== bidderId) {
            await this.addNotification(auction.seller_id, 'new_bid', {
                auction_id: auctionId,
                item_name: auction.item_name,
                bid_amount: bidAmount,
                bidder_id: bidderId
            });
        }

        // 관심 목록에 추가한 사용자들에게 알림
        const watchers = await this.db.run(`
            SELECT player_id FROM auction_watchlist 
            WHERE auction_id = ? AND player_id NOT IN (?, ?)
        `, [auctionId, bidderId, auction.seller_id]);

        for (const watcher of watchers) {
            await this.addNotification(watcher.player_id, 'watchlist_bid', {
                auction_id: auctionId,
                item_name: auction.item_name,
                bid_amount: bidAmount
            });
        }
    }

    async addNotification(playerId, type, data) {
        await this.db.run(`
            INSERT INTO auction_notifications 
            (player_id, notification_type, notification_data, is_read) 
            VALUES (?, ?, ?, 0)
        `, [playerId, type, JSON.stringify(data)]);
    }

    async getPlayerNotifications(playerId, unreadOnly = false) {
        const whereClause = unreadOnly ? 'WHERE player_id = ? AND is_read = 0' : 'WHERE player_id = ?';
        
        return await this.db.run(`
            SELECT * FROM auction_notifications 
            ${whereClause}
            ORDER BY created_at DESC LIMIT 50
        `, [playerId]);
    }

    async markNotificationAsRead(notificationId) {
        await this.db.run(`
            UPDATE auction_notifications 
            SET is_read = 1 
            WHERE id = ?
        `, [notificationId]);
    }

    // 경매 통계 시스템
    async getPlayerAuctionStats(playerId) {
        const [sellingStats] = await this.db.run(`
            SELECT 
                COUNT(*) as total_auctions,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_sales,
                COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_auctions,
                AVG(CASE WHEN status = 'completed' THEN final_price END) as avg_sale_price,
                SUM(CASE WHEN status = 'completed' THEN final_price END) as total_revenue
            FROM auctions 
            WHERE seller_id = ?
        `, [playerId]);

        const [biddingStats] = await this.db.run(`
            SELECT 
                COUNT(DISTINCT auction_id) as auctions_bid_on,
                COUNT(CASE WHEN won = 1 THEN 1 END) as auctions_won,
                AVG(bid_amount) as avg_bid_amount,
                SUM(CASE WHEN won = 1 THEN bid_amount END) as total_spent
            FROM auction_bids 
            WHERE bidder_id = ?
        `, [playerId]);

        return {
            selling: sellingStats || {},
            bidding: biddingStats || {}
        };
    }

    async getMarketTrends(category = null, timeframe = '7 days') {
        let categoryFilter = '';
        let params = [];
        
        if (category) {
            categoryFilter = 'AND category = ?';
            params.push(category);
        }
        
        params.push(timeframe);

        return await this.db.run(`
            SELECT 
                item_name,
                category,
                COUNT(*) as total_sales,
                AVG(final_price) as avg_price,
                MIN(final_price) as min_price,
                MAX(final_price) as max_price
            FROM auctions 
            WHERE status = 'completed' 
                AND created_at >= datetime('now', '-' || ?)
                ${categoryFilter}
            GROUP BY item_name, category
            ORDER BY total_sales DESC, avg_price DESC
            LIMIT 20
        `, params);
    }

    // 대량 경매 관리
    async createBulkAuction(playerId, items, auctionType = 'normal', duration = 24) {
        const results = [];
        
        for (const itemData of items) {
            const result = await this.createAuction(
                playerId,
                itemData.item_id,
                itemData.quantity || 1,
                itemData.starting_price,
                auctionType,
                itemData.buyout_price,
                duration
            );
            
            results.push({
                item: itemData,
                result: result
            });
        }
        
        return {
            success: true,
            message: `${results.filter(r => r.result.success).length}개의 경매가 생성되었습니다.`,
            results: results
        };
    }

    // 경매 검색 고도화
    async advancedSearch(options = {}) {
        let query = 'SELECT * FROM auctions WHERE status = "active"';
        const params = [];
        
        if (options.category) {
            query += ' AND category = ?';
            params.push(options.category);
        }
        
        if (options.rarity) {
            query += ' AND rarity = ?';
            params.push(options.rarity);
        }
        
        if (options.minPrice !== undefined) {
            query += ' AND current_price >= ?';
            params.push(options.minPrice);
        }
        
        if (options.maxPrice !== undefined) {
            query += ' AND current_price <= ?';
            params.push(options.maxPrice);
        }
        
        if (options.itemName) {
            query += ' AND item_name LIKE ?';
            params.push(`%${options.itemName}%`);
        }
        
        if (options.sellerName) {
            query += ' AND seller_id = ?';
            params.push(options.sellerName);
        }
        
        if (options.timeRemaining) {
            query += ' AND end_time <= datetime("now", "+' + options.timeRemaining + ' hours")';
        }
        
        // 정렬 옵션
        switch (options.sortBy) {
            case 'price_low':
                query += ' ORDER BY current_price ASC';
                break;
            case 'price_high':
                query += ' ORDER BY current_price DESC';
                break;
            case 'time_ending':
                query += ' ORDER BY end_time ASC';
                break;
            case 'newest':
                query += ' ORDER BY created_at DESC';
                break;
            default:
                query += ' ORDER BY created_at DESC';
        }
        
        query += ` LIMIT ${options.limit || 50}`;
        
        return await this.db.run(query, params);
    }
}

module.exports = AuctionSystem;
