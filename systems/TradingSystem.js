const { EmbedBuilder } = require('discord.js');

class TradingSystem {
    constructor(database) {
        this.db = database;
        this.activeTrades = new Map(); // 진행 중인 거래
    }

    async initializeTradingSystem() {
        // 거래 요청 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS trade_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id TEXT NOT NULL,
                receiver_id TEXT NOT NULL,
                trade_type TEXT NOT NULL, -- 'item', 'money', 'mixed'
                sender_money REAL DEFAULT 0,
                receiver_money REAL DEFAULT 0,
                status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'completed', 'cancelled'
                created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_date DATETIME,
                FOREIGN KEY (sender_id) REFERENCES players(id),
                FOREIGN KEY (receiver_id) REFERENCES players(id)
            )
        `);

        // 거래 아이템 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS trade_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trade_id INTEGER NOT NULL,
                player_id TEXT NOT NULL,
                item_id INTEGER NOT NULL,
                quantity INTEGER DEFAULT 1,
                FOREIGN KEY (trade_id) REFERENCES trade_requests(id),
                FOREIGN KEY (player_id) REFERENCES players(id),
                FOREIGN KEY (item_id) REFERENCES items(id)
            )
        `);

        // 거래 기록 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS trade_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trade_id INTEGER NOT NULL,
                sender_id TEXT NOT NULL,
                receiver_id TEXT NOT NULL,
                items_summary TEXT,
                money_summary TEXT,
                completion_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (trade_id) REFERENCES trade_requests(id)
            )
        `);

        // 선물 테이블 (간단한 선물 시스템)
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS gifts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id TEXT NOT NULL,
                receiver_id TEXT NOT NULL,
                gift_type TEXT NOT NULL, -- 'money', 'item'
                amount REAL DEFAULT 0,
                item_id INTEGER,
                quantity INTEGER DEFAULT 1,
                message TEXT,
                sent_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                received BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (sender_id) REFERENCES players(id),
                FOREIGN KEY (receiver_id) REFERENCES players(id),
                FOREIGN KEY (item_id) REFERENCES items(id)
            )
        `);

        console.log('거래 시스템 초기화 완료');
    }

    async createTradeRequest(senderId, receiverId, tradeData) {
        try {
            // 플레이어 확인
            const sender = await this.db.get('SELECT * FROM players WHERE id = ?', [senderId]);
            const receiver = await this.db.get('SELECT * FROM players WHERE id = ?', [receiverId]);

            if (!sender || !receiver) {
                return { success: false, message: '존재하지 않는 플레이어입니다.' };
            }

            if (senderId === receiverId) {
                return { success: false, message: '자기 자신과는 거래할 수 없습니다.' };
            }

            // 활성 거래 확인
            const existingTrade = await this.db.get(`
                SELECT * FROM trade_requests 
                WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
                AND status = 'pending'
            `, [senderId, receiverId, receiverId, senderId]);

            if (existingTrade) {
                return { success: false, message: '이미 진행 중인 거래가 있습니다.' };
            }

            // 거래 요청 생성
            const result = await this.db.run(`
                INSERT INTO trade_requests (sender_id, receiver_id, trade_type, sender_money, receiver_money)
                VALUES (?, ?, ?, ?, ?)
            `, [senderId, receiverId, tradeData.type, tradeData.senderMoney || 0, tradeData.receiverMoney || 0]);

            const tradeId = result.lastID;

            // 거래 아이템 추가
            if (tradeData.senderItems) {
                for (const item of tradeData.senderItems) {
                    await this.db.run(`
                        INSERT INTO trade_items (trade_id, player_id, item_id, quantity)
                        VALUES (?, ?, ?, ?)
                    `, [tradeId, senderId, item.itemId, item.quantity]);
                }
            }

            if (tradeData.receiverItems) {
                for (const item of tradeData.receiverItems) {
                    await this.db.run(`
                        INSERT INTO trade_items (trade_id, player_id, item_id, quantity)
                        VALUES (?, ?, ?, ?)
                    `, [tradeId, receiverId, item.itemId, item.quantity]);
                }
            }

            return {
                success: true,
                message: '거래 요청을 보냈습니다.',
                tradeId: tradeId
            };

        } catch (error) {
            console.error('거래 요청 생성 오류:', error);
            return { success: false, message: '거래 요청 생성 중 오류가 발생했습니다.' };
        }
    }

    async acceptTrade(playerId, tradeId) {
        try {
            // 거래 확인
            const trade = await this.db.get(`
                SELECT * FROM trade_requests WHERE id = ? AND receiver_id = ? AND status = 'pending'
            `, [tradeId, playerId]);

            if (!trade) {
                return { success: false, message: '존재하지 않거나 승인할 수 없는 거래입니다.' };
            }

            // 거래 검증 및 실행
            const validationResult = await this.validateAndExecuteTrade(trade);
            
            if (!validationResult.success) {
                return validationResult;
            }

            // 거래 상태 업데이트
            await this.db.run(`
                UPDATE trade_requests 
                SET status = 'completed', completed_date = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [tradeId]);

            // 거래 기록 저장
            await this.recordTradeHistory(trade);

            return {
                success: true,
                message: '거래가 성공적으로 완료되었습니다!',
                trade: trade
            };

        } catch (error) {
            console.error('거래 승인 오류:', error);
            return { success: false, message: '거래 승인 중 오류가 발생했습니다.' };
        }
    }

    async rejectTrade(playerId, tradeId) {
        try {
            const trade = await this.db.get(`
                SELECT * FROM trade_requests WHERE id = ? AND receiver_id = ? AND status = 'pending'
            `, [tradeId, playerId]);

            if (!trade) {
                return { success: false, message: '존재하지 않거나 거절할 수 없는 거래입니다.' };
            }

            await this.db.run(`
                UPDATE trade_requests SET status = 'rejected' WHERE id = ?
            `, [tradeId]);

            return {
                success: true,
                message: '거래를 거절했습니다.',
                trade: trade
            };

        } catch (error) {
            console.error('거래 거절 오류:', error);
            return { success: false, message: '거래 거절 중 오류가 발생했습니다.' };
        }
    }

    async validateAndExecuteTrade(trade) {
        // 플레이어 정보 확인
        const sender = await this.db.get('SELECT * FROM players WHERE id = ?', [trade.sender_id]);
        const receiver = await this.db.get('SELECT * FROM players WHERE id = ?', [trade.receiver_id]);

        // 돈 검증
        if (sender.money < trade.sender_money) {
            return { success: false, message: '보내는 사람의 돈이 부족합니다.' };
        }
        if (receiver.money < trade.receiver_money) {
            return { success: false, message: '받는 사람의 돈이 부족합니다.' };
        }

        // 아이템 검증
        const tradeItems = await this.db.all(`
            SELECT * FROM trade_items WHERE trade_id = ?
        `, [trade.id]);

        for (const tradeItem of tradeItems) {
            const inventory = await this.db.get(`
                SELECT quantity FROM player_inventory 
                WHERE player_id = ? AND item_id = ?
            `, [tradeItem.player_id, tradeItem.item_id]);

            if (!inventory || inventory.quantity < tradeItem.quantity) {
                return { success: false, message: '아이템이 부족합니다.' };
            }
        }

        // 거래 실행
        // 돈 교환
        if (trade.sender_money > 0 || trade.receiver_money > 0) {
            await this.db.run(`
                UPDATE players 
                SET money = money - ? + ?
                WHERE id = ?
            `, [trade.sender_money, trade.receiver_money, trade.sender_id]);

            await this.db.run(`
                UPDATE players 
                SET money = money - ? + ?
                WHERE id = ?
            `, [trade.receiver_money, trade.sender_money, trade.receiver_id]);
        }

        // 아이템 교환
        for (const tradeItem of tradeItems) {
            // 원래 소유자에게서 아이템 제거
            await this.db.run(`
                UPDATE player_inventory 
                SET quantity = quantity - ?
                WHERE player_id = ? AND item_id = ?
            `, [tradeItem.quantity, tradeItem.player_id, tradeItem.item_id]);

            // 상대방에게 아이템 추가
            const targetId = tradeItem.player_id === trade.sender_id ? trade.receiver_id : trade.sender_id;
            
            const existingItem = await this.db.get(`
                SELECT * FROM player_inventory WHERE player_id = ? AND item_id = ?
            `, [targetId, tradeItem.item_id]);

            if (existingItem) {
                await this.db.run(`
                    UPDATE player_inventory SET quantity = quantity + ? WHERE id = ?
                `, [tradeItem.quantity, existingItem.id]);
            } else {
                await this.db.run(`
                    INSERT INTO player_inventory (player_id, item_id, quantity)
                    VALUES (?, ?, ?)
                `, [targetId, tradeItem.item_id, tradeItem.quantity]);
            }
        }

        return { success: true };
    }

    async recordTradeHistory(trade) {
        // 거래 아이템 요약
        const tradeItems = await this.db.all(`
            SELECT ti.*, i.name as item_name, p.username
            FROM trade_items ti
            JOIN items i ON ti.item_id = i.id
            JOIN players p ON ti.player_id = p.id
            WHERE ti.trade_id = ?
        `, [trade.id]);

        const itemsSummary = tradeItems.map(item => 
            `${item.username}: ${item.item_name} x${item.quantity}`
        ).join(', ');

        const moneySummary = `${trade.sender_money > 0 ? `Sender: ${trade.sender_money}원` : ''} ${trade.receiver_money > 0 ? `Receiver: ${trade.receiver_money}원` : ''}`.trim();

        await this.db.run(`
            INSERT INTO trade_history (trade_id, sender_id, receiver_id, items_summary, money_summary)
            VALUES (?, ?, ?, ?, ?)
        `, [trade.id, trade.sender_id, trade.receiver_id, itemsSummary, moneySummary]);
    }

    async sendGift(senderId, receiverId, giftData) {
        try {
            const sender = await this.db.get('SELECT * FROM players WHERE id = ?', [senderId]);
            const receiver = await this.db.get('SELECT * FROM players WHERE id = ?', [receiverId]);

            if (!sender || !receiver) {
                return { success: false, message: '존재하지 않는 플레이어입니다.' };
            }

            if (senderId === receiverId) {
                return { success: false, message: '자기 자신에게는 선물할 수 없습니다.' };
            }

            // 선물 검증
            if (giftData.type === 'money') {
                if (sender.money < giftData.amount) {
                    return { success: false, message: '돈이 부족합니다.' };
                }
                
                // 돈 차감
                await this.db.run(`
                    UPDATE players SET money = money - ? WHERE id = ?
                `, [giftData.amount, senderId]);

            } else if (giftData.type === 'item') {
                const inventory = await this.db.get(`
                    SELECT quantity FROM player_inventory 
                    WHERE player_id = ? AND item_id = ?
                `, [senderId, giftData.itemId]);

                if (!inventory || inventory.quantity < giftData.quantity) {
                    return { success: false, message: '아이템이 부족합니다.' };
                }

                // 아이템 차감
                await this.db.run(`
                    UPDATE player_inventory 
                    SET quantity = quantity - ?
                    WHERE player_id = ? AND item_id = ?
                `, [giftData.quantity, senderId, giftData.itemId]);
            }

            // 선물 생성
            await this.db.run(`
                INSERT INTO gifts (sender_id, receiver_id, gift_type, amount, item_id, quantity, message)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [senderId, receiverId, giftData.type, giftData.amount || 0, 
                giftData.itemId || null, giftData.quantity || 1, giftData.message || '']);

            return {
                success: true,
                message: `${receiver.username}님에게 선물을 보냈습니다!`
            };

        } catch (error) {
            console.error('선물 보내기 오류:', error);
            return { success: false, message: '선물 보내기 중 오류가 발생했습니다.' };
        }
    }

    async receiveGift(playerId, giftId) {
        try {
            const gift = await this.db.get(`
                SELECT g.*, p.username as sender_name, i.name as item_name
                FROM gifts g
                JOIN players p ON g.sender_id = p.id
                LEFT JOIN items i ON g.item_id = i.id
                WHERE g.id = ? AND g.receiver_id = ? AND g.received = FALSE
            `, [giftId, playerId]);

            if (!gift) {
                return { success: false, message: '존재하지 않거나 이미 받은 선물입니다.' };
            }

            // 선물 지급
            if (gift.gift_type === 'money') {
                await this.db.run(`
                    UPDATE players SET money = money + ? WHERE id = ?
                `, [gift.amount, playerId]);

            } else if (gift.gift_type === 'item') {
                const existingItem = await this.db.get(`
                    SELECT * FROM player_inventory WHERE player_id = ? AND item_id = ?
                `, [playerId, gift.item_id]);

                if (existingItem) {
                    await this.db.run(`
                        UPDATE player_inventory SET quantity = quantity + ? WHERE id = ?
                    `, [gift.quantity, existingItem.id]);
                } else {
                    await this.db.run(`
                        INSERT INTO player_inventory (player_id, item_id, quantity)
                        VALUES (?, ?, ?)
                    `, [playerId, gift.item_id, gift.quantity]);
                }
            }

            // 선물 수령 처리
            await this.db.run(`
                UPDATE gifts SET received = TRUE WHERE id = ?
            `, [giftId]);

            return {
                success: true,
                message: `${gift.sender_name}님의 선물을 받았습니다!`,
                gift: gift
            };

        } catch (error) {
            console.error('선물 받기 오류:', error);
            return { success: false, message: '선물 받기 중 오류가 발생했습니다.' };
        }
    }

    async getPlayerTrades(playerId) {
        // 보낸 거래
        const sentTrades = await this.db.all(`
            SELECT tr.*, p.username as receiver_name
            FROM trade_requests tr
            JOIN players p ON tr.receiver_id = p.id
            WHERE tr.sender_id = ?
            ORDER BY tr.created_date DESC
            LIMIT 10
        `, [playerId]);

        // 받은 거래
        const receivedTrades = await this.db.all(`
            SELECT tr.*, p.username as sender_name
            FROM trade_requests tr
            JOIN players p ON tr.sender_id = p.id
            WHERE tr.receiver_id = ?
            ORDER BY tr.created_date DESC
            LIMIT 10
        `, [playerId]);

        return { sentTrades, receivedTrades };
    }

    async getPlayerGifts(playerId) {
        // 보낸 선물
        const sentGifts = await this.db.all(`
            SELECT g.*, p.username as receiver_name, i.name as item_name
            FROM gifts g
            JOIN players p ON g.receiver_id = p.id
            LEFT JOIN items i ON g.item_id = i.id
            WHERE g.sender_id = ?
            ORDER BY g.sent_date DESC
            LIMIT 10
        `, [playerId]);

        // 받은 선물
        const receivedGifts = await this.db.all(`
            SELECT g.*, p.username as sender_name, i.name as item_name
            FROM gifts g
            JOIN players p ON g.sender_id = p.id
            LEFT JOIN items i ON g.item_id = i.id
            WHERE g.receiver_id = ?
            ORDER BY g.sent_date DESC
            LIMIT 10
        `, [playerId]);

        return { sentGifts, receivedGifts };
    }

    createTradeEmbed(trades, title) {
        const embed = new EmbedBuilder()
            .setColor('#ffff00')
            .setTitle(`💱 ${title}`)
            .setTimestamp();

        if (trades.length === 0) {
            embed.setDescription('거래 내역이 없습니다.');
            return embed;
        }

        const statusEmojis = {
            'pending': '⏳',
            'accepted': '✅',
            'rejected': '❌',
            'completed': '🎉',
            'cancelled': '⭕'
        };

        for (const trade of trades) {
            const partnerName = trade.sender_name || trade.receiver_name;
            const status = statusEmojis[trade.status] || '❓';
            
            embed.addFields({
                name: `${status} 거래 #${trade.id}`,
                value: [
                    `👤 상대방: ${partnerName}`,
                    `💰 돈: ${trade.sender_money || 0}원 ↔ ${trade.receiver_money || 0}원`,
                    `📅 요청일: ${new Date(trade.created_date).toLocaleDateString('ko-KR')}`,
                    `📋 상태: ${trade.status}`
                ].join('\n'),
                inline: true
            });
        }

        return embed;
    }

    createGiftEmbed(gifts, title) {
        const embed = new EmbedBuilder()
            .setColor('#ff69b4')
            .setTitle(`🎁 ${title}`)
            .setTimestamp();

        if (gifts.length === 0) {
            embed.setDescription('선물 내역이 없습니다.');
            return embed;
        }

        for (const gift of gifts) {
            const partnerName = gift.sender_name || gift.receiver_name;
            const giftContent = gift.gift_type === 'money' 
                ? `💰 ${gift.amount.toLocaleString()}원`
                : `📦 ${gift.item_name} x${gift.quantity}`;
            
            const status = gift.received ? '✅ 수령완료' : '📮 수령대기';

            embed.addFields({
                name: `🎁 선물 #${gift.id}`,
                value: [
                    `👤 ${gift.sender_name ? '보낸이' : '받는이'}: ${partnerName}`,
                    `🎁 내용: ${giftContent}`,
                    `📅 날짜: ${new Date(gift.sent_date).toLocaleDateString('ko-KR')}`,
                    `📋 상태: ${status}`,
                    gift.message ? `💌 메시지: ${gift.message}` : ''
                ].filter(line => line).join('\n'),
                inline: true
            });
        }

        return embed;
    }
}

module.exports = TradingSystem;

