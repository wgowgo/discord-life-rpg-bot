const { EmbedBuilder } = require('discord.js');

class ShopSystem {
    constructor(database) {
        this.db = database;
        this.items = [
            // 소모품
            {
                name: '체력 포션',
                category: 'consumable',
                price: 1000,
                description: '체력을 50 회복합니다',
                effect: { type: 'heal', value: 50 },
                rarity: 'common'
            },
            {
                name: '마나 포션',
                category: 'consumable',
                price: 1500,
                description: '마나를 30 회복합니다',
                effect: { type: 'mana', value: 30 },
                rarity: 'common'
            },
            {
                name: '경험치 부스터',
                category: 'consumable',
                price: 5000,
                description: '1시간 동안 경험치 획득량이 2배가 됩니다',
                effect: { type: 'exp_boost', value: 2, duration: 3600000 },
                rarity: 'rare'
            },
            {
                name: '행운의 부적',
                category: 'consumable',
                price: 10000,
                description: '다음 3번의 행동에서 성공률이 증가합니다',
                effect: { type: 'luck', value: 3 },
                rarity: 'rare'
            },

            // 장비
            {
                name: '기본 검',
                category: 'weapon',
                price: 5000,
                description: '공격력 +10',
                effect: { type: 'attack', value: 10 },
                rarity: 'common'
            },
            {
                name: '강화된 검',
                category: 'weapon',
                price: 15000,
                description: '공격력 +25',
                effect: { type: 'attack', value: 25 },
                rarity: 'uncommon'
            },
            {
                name: '전설의 검',
                category: 'weapon',
                price: 50000,
                description: '공격력 +50',
                effect: { type: 'attack', value: 50 },
                rarity: 'legendary'
            },
            {
                name: '기본 갑옷',
                category: 'armor',
                price: 3000,
                description: '방어력 +5',
                effect: { type: 'defense', value: 5 },
                rarity: 'common'
            },
            {
                name: '강화된 갑옷',
                category: 'armor',
                price: 10000,
                description: '방어력 +15',
                effect: { type: 'defense', value: 15 },
                rarity: 'uncommon'
            },
            {
                name: '전설의 갑옷',
                category: 'armor',
                price: 30000,
                description: '방어력 +30',
                effect: { type: 'defense', value: 30 },
                rarity: 'legendary'
            },

            // 도구
            {
                name: '낚시대',
                category: 'tool',
                price: 2000,
                description: '낚시 성공률을 증가시킵니다',
                effect: { type: 'fishing_bonus', value: 10 },
                rarity: 'common'
            },
            {
                name: '고급 낚시대',
                category: 'tool',
                price: 8000,
                description: '낚시 성공률을 크게 증가시킵니다',
                effect: { type: 'fishing_bonus', value: 25 },
                rarity: 'uncommon'
            },
            {
                name: '곡괭이',
                category: 'tool',
                price: 3000,
                description: '채굴 효율을 증가시킵니다',
                effect: { type: 'mining_bonus', value: 15 },
                rarity: 'common'
            },
            {
                name: '고급 곡괭이',
                category: 'tool',
                price: 12000,
                description: '채굴 효율을 크게 증가시킵니다',
                effect: { type: 'mining_bonus', value: 30 },
                rarity: 'uncommon'
            },

            // 특수 아이템
            {
                name: '부활의 돌',
                category: 'special',
                price: 25000,
                description: '죽었을 때 자동으로 부활합니다',
                effect: { type: 'revive', value: 1 },
                rarity: 'epic'
            },
            {
                name: '시간 가속기',
                category: 'special',
                price: 20000,
                description: '모든 쿨다운을 즉시 초기화합니다',
                effect: { type: 'cooldown_reset', value: 1 },
                rarity: 'epic'
            },
            {
                name: '행운의 동전',
                category: 'special',
                price: 50000,
                description: '다음 도박에서 무조건 승리합니다',
                effect: { type: 'guaranteed_win', value: 1 },
                rarity: 'legendary'
            }
        ];
    }

    async initializeShopSystem() {
        // 상점 아이템 테이블 생성
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS shop_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                price INTEGER NOT NULL,
                description TEXT NOT NULL,
                effect_type TEXT NOT NULL,
                effect_value INTEGER NOT NULL,
                effect_duration INTEGER DEFAULT 0,
                rarity TEXT NOT NULL,
                stock INTEGER DEFAULT -1,
                is_available BOOLEAN DEFAULT TRUE
            )
        `);

        // 플레이어 인벤토리 테이블 생성
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS player_inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                item_id INTEGER NOT NULL,
                quantity INTEGER DEFAULT 1,
                obtained_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(player_id, item_id),
                FOREIGN KEY (item_id) REFERENCES shop_items(id)
            )
        `);

        // 상점 아이템 데이터 삽입
        for (const item of this.items) {
            await this.db.run(`
                INSERT OR IGNORE INTO shop_items 
                (name, category, price, description, effect_type, effect_value, effect_duration, rarity)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                item.name,
                item.category,
                item.price,
                item.description,
                item.effect.type,
                item.effect.value,
                item.effect.duration || 0,
                item.rarity
            ]);
        }

        console.log('상점 시스템 초기화 완료');
    }

    async getShopItems(category = null) {
        let query = 'SELECT * FROM shop_items WHERE is_available = TRUE';
        let params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        query += ' ORDER BY category, price ASC';
        return await this.db.all(query, params);
    }

    async buyItem(playerId, itemId, quantity = 1) {
        try {
            // 아이템 정보 확인
            const item = await this.db.get('SELECT * FROM shop_items WHERE id = ? AND is_available = TRUE', [itemId]);
            if (!item) {
                return { success: false, message: '존재하지 않거나 구매할 수 없는 아이템입니다.' };
            }

            // 재고 확인
            if (item.stock !== -1 && item.stock < quantity) {
                return { success: false, message: '재고가 부족합니다.' };
            }

            // 플레이어 자금 확인
            const totalCost = item.price * quantity;
            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [playerId]);
            if (!player || player.money < totalCost) {
                return { 
                    success: false, 
                    message: `자금이 부족합니다. 필요: ${totalCost.toLocaleString()}원` 
                };
            }

            // 아이템 구매
            const existingItem = await this.db.get(`
                SELECT * FROM player_inventory WHERE player_id = ? AND item_id = ?
            `, [playerId, itemId]);

            if (existingItem) {
                // 기존 아이템 수량 증가
                await this.db.run(`
                    UPDATE player_inventory SET quantity = quantity + ? WHERE player_id = ? AND item_id = ?
                `, [quantity, playerId, itemId]);
            } else {
                // 새 아이템 추가
                await this.db.run(`
                    INSERT INTO player_inventory (player_id, item_id, quantity)
                    VALUES (?, ?, ?)
                `, [playerId, itemId, quantity]);
            }

            // 자금 차감
            await this.db.run('UPDATE players SET money = money - ? WHERE id = ?', [totalCost, playerId]);

            // 재고 차감 (제한된 재고인 경우)
            if (item.stock !== -1) {
                await this.db.run(`
                    UPDATE shop_items SET stock = stock - ? WHERE id = ?
                `, [quantity, itemId]);
            }

            // 거래 내역 기록
            await this.db.run(`
                INSERT INTO transactions (player_id, type, amount, description)
                VALUES (?, 'item_purchase', ?, ?)
            `, [playerId, -totalCost, `${item.name} ${quantity}개 구매`]);

            return {
                success: true,
                message: `${item.name} ${quantity}개를 구매했습니다!`,
                cost: totalCost,
                item: item
            };

        } catch (error) {
            console.error('아이템 구매 오류:', error);
            return { success: false, message: '아이템 구매 중 오류가 발생했습니다.' };
        }
    }

    async getPlayerInventory(playerId) {
        return await this.db.all(`
            SELECT 
                pi.*,
                si.name,
                si.description,
                si.category,
                si.effect_type,
                si.effect_value,
                si.effect_duration,
                si.rarity
            FROM player_inventory pi
            JOIN shop_items si ON pi.item_id = si.id
            WHERE pi.player_id = ?
            ORDER BY pi.obtained_at DESC
        `, [playerId]);
    }

    async useItem(playerId, itemId) {
        try {
            // 인벤토리에서 아이템 확인
            const inventoryItem = await this.db.get(`
                SELECT pi.*, si.*
                FROM player_inventory pi
                JOIN shop_items si ON pi.item_id = si.id
                WHERE pi.player_id = ? AND pi.item_id = ?
            `, [playerId, itemId]);

            if (!inventoryItem || inventoryItem.quantity <= 0) {
                return { success: false, message: '인벤토리에 해당 아이템이 없습니다.' };
            }

            // 아이템 효과 적용
            let effectResult = { success: true, message: '' };

            switch (inventoryItem.effect_type) {
                case 'heal':
                    await this.db.run(`
                        UPDATE players SET health = LEAST(100, health + ?) WHERE id = ?
                    `, [inventoryItem.effect_value, playerId]);
                    effectResult.message = `체력이 ${inventoryItem.effect_value} 회복되었습니다.`;
                    break;

                case 'mana':
                    await this.db.run(`
                        UPDATE players SET mana = LEAST(100, mana + ?) WHERE id = ?
                    `, [inventoryItem.effect_value, playerId]);
                    effectResult.message = `마나가 ${inventoryItem.effect_value} 회복되었습니다.`;
                    break;

                case 'exp_boost':
                    // 경험치 부스터는 별도 테이블에서 관리
                    await this.db.run(`
                        INSERT OR REPLACE INTO player_buffs (player_id, buff_type, value, expires_at)
                        VALUES (?, 'exp_boost', ?, ?)
                    `, [playerId, inventoryItem.effect_value, Date.now() + inventoryItem.effect_duration]);
                    effectResult.message = `1시간 동안 경험치 획득량이 ${inventoryItem.effect_value}배가 됩니다.`;
                    break;

                default:
                    effectResult.message = `${inventoryItem.name}을(를) 사용했습니다.`;
            }

            // 아이템 수량 차감
            if (inventoryItem.quantity > 1) {
                await this.db.run(`
                    UPDATE player_inventory SET quantity = quantity - 1 WHERE player_id = ? AND item_id = ?
                `, [playerId, itemId]);
            } else {
                await this.db.run(`
                    DELETE FROM player_inventory WHERE player_id = ? AND item_id = ?
                `, [playerId, itemId]);
            }

            return {
                success: true,
                message: effectResult.message,
                item: inventoryItem
            };

        } catch (error) {
            console.error('아이템 사용 오류:', error);
            return { success: false, message: '아이템 사용 중 오류가 발생했습니다.' };
        }
    }

    createShopEmbed(items, category = null) {
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🛒 상점')
            .setTimestamp();

        if (category) {
            embed.setDescription(`${category} 카테고리 아이템`);
        } else {
            embed.setDescription('다양한 아이템을 구매하세요!');
        }

        if (items.length === 0) {
            embed.setDescription('해당 카테고리에 아이템이 없습니다.');
            return embed;
        }

        const categories = {};
        items.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });

        for (const [cat, categoryItems] of Object.entries(categories)) {
            const categoryEmojis = {
                'consumable': '🧪',
                'weapon': '⚔️',
                'armor': '🛡️',
                'tool': '🔧',
                'special': '✨'
            };

            const itemsText = categoryItems.map(item => {
                const rarityEmojis = {
                    'common': '⚪',
                    'uncommon': '🟢',
                    'rare': '🔵',
                    'epic': '🟣',
                    'legendary': '🟡'
                };

                const stockText = item.stock === -1 ? '무제한' : `${item.stock}개`;
                return [
                    `**${item.name}** (ID: ${item.id}) ${rarityEmojis[item.rarity] || '⚪'}`,
                    `💰 가격: ${item.price.toLocaleString()}원`,
                    `📦 재고: ${stockText}`,
                    `📝 ${item.description}`
                ].join('\n');
            }).join('\n\n');

            embed.addFields({
                name: `${categoryEmojis[cat] || '📦'} ${cat.toUpperCase()}`,
                value: itemsText,
                inline: false
            });
        }

        embed.setFooter({ text: '아이템을 구매하려면 "/상점 구매 아이템id:{ID} 수량:{개수}"를 사용하세요' });
        return embed;
    }

    createInventoryEmbed(items) {
        const embed = new EmbedBuilder()
            .setColor(0x0000FF)
            .setTitle('🎒 인벤토리')
            .setTimestamp();

        if (items.length === 0) {
            embed.setDescription('인벤토리가 비어있습니다.\n상점에서 아이템을 구매해보세요!');
            return embed;
        }

        const categories = {};
        items.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });

        for (const [category, categoryItems] of Object.entries(categories)) {
            const categoryEmojis = {
                'consumable': '🧪',
                'weapon': '⚔️',
                'armor': '🛡️',
                'tool': '🔧',
                'special': '✨'
            };

            const itemsText = categoryItems.map(item => {
                const rarityEmojis = {
                    'common': '⚪',
                    'uncommon': '🟢',
                    'rare': '🔵',
                    'epic': '🟣',
                    'legendary': '🟡'
                };

                return [
                    `**${item.name}** (ID: ${item.item_id}) ${rarityEmojis[item.rarity] || '⚪'}`,
                    `📦 수량: ${item.quantity}개`,
                    `📝 ${item.description}`
                ].join('\n');
            }).join('\n\n');

            embed.addFields({
                name: `${categoryEmojis[category] || '📦'} ${category.toUpperCase()}`,
                value: itemsText,
                inline: false
            });
        }

        embed.setFooter({ text: '아이템을 사용하려면 "/상점 사용 아이템id:{ID}"를 사용하세요' });
        return embed;
    }
}

module.exports = ShopSystem;
