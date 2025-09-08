const { EmbedBuilder } = require('discord.js');

class CollectionSystem {
    constructor(database) {
        this.db = database;
        
        this.collectionCategories = [
            {
                id: 'monsters',
                name: '몬스터 도감',
                emoji: '👹',
                description: '다양한 몬스터들의 정보를 수집하세요'
            },
            {
                id: 'items',
                name: '아이템 도감',
                emoji: '📦',
                description: '게임 내 모든 아이템을 수집하세요'
            },
            {
                id: 'equipment',
                name: '장비 도감',
                emoji: '⚔️',
                description: '강력한 장비들을 수집하세요'
            },
            {
                id: 'pets',
                name: '펫 도감',
                emoji: '🐕',
                description: '귀여운 펫들을 수집하세요'
            },
            {
                id: 'achievements',
                name: '업적 도감',
                emoji: '🏆',
                description: '모든 업적을 달성하세요'
            },
            {
                id: 'locations',
                name: '지역 도감',
                emoji: '🗺️',
                description: '다양한 지역을 탐험하세요'
            },
            {
                id: 'npcs',
                name: 'NPC 도감',
                emoji: '👥',
                description: '특별한 NPC들을 만나보세요'
            },
            {
                id: 'skills',
                name: '스킬 도감',
                emoji: '✨',
                description: '강력한 스킬들을 배우세요'
            },
            {
                id: 'ores',
                name: '광물 도감',
                emoji: '💎',
                description: '희귀한 광물들을 채굴하세요'
            },
            {
                id: 'recipes',
                name: '제작법 도감',
                emoji: '📜',
                description: '다양한 제작법을 습득하세요'
            }
        ];

        this.rarityInfo = {
            'common': { emoji: '⚪', name: '일반', color: '#808080' },
            'rare': { emoji: '🔵', name: '희귀', color: '#0066ff' },
            'epic': { emoji: '🟣', name: '영웅', color: '#9966ff' },
            'legendary': { emoji: '🟡', name: '전설', color: '#ffcc00' },
            'mythic': { emoji: '🔴', name: '신화', color: '#ff0000' },
            'unique': { emoji: '🌟', name: '유니크', color: '#00ffff' }
        };
    }

    async initializeCollectionSystem() {
        // 도감 엔트리 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS collection_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                entry_id TEXT NOT NULL,
                name TEXT NOT NULL,
                rarity TEXT DEFAULT 'common',
                description TEXT,
                image_url TEXT,
                stats TEXT,
                unlock_condition TEXT,
                rewards TEXT,
                created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(category, entry_id)
            )
        `);

        // 플레이어 도감 수집 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS player_collections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                category TEXT NOT NULL,
                entry_id TEXT NOT NULL,
                discovered_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                discovery_method TEXT,
                times_encountered INTEGER DEFAULT 1,
                FOREIGN KEY (player_id) REFERENCES players(id),
                UNIQUE(player_id, category, entry_id)
            )
        `);

        // 도감 진행도 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS collection_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                category TEXT NOT NULL,
                total_entries INTEGER DEFAULT 0,
                discovered_entries INTEGER DEFAULT 0,
                completion_percentage REAL DEFAULT 0.0,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (player_id) REFERENCES players(id),
                UNIQUE(player_id, category)
            )
        `);

        // 도감 보상 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS collection_rewards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                milestone_percentage INTEGER NOT NULL,
                reward_type TEXT NOT NULL, -- 'money', 'item', 'title', 'stats'
                reward_value TEXT NOT NULL,
                description TEXT
            )
        `);

        // 초기 도감 엔트리들 생성
        await this.seedCollectionEntries();
        await this.seedCollectionRewards();

        console.log('도감 시스템 초기화 완료');
    }

    async seedCollectionEntries() {
        // 몬스터 도감 엔트리
        const monsters = [
            { id: 'goblin', name: '고블린', rarity: 'common', description: '가장 기본적인 몬스터', unlock: '고블린 처치' },
            { id: 'orc', name: '오크', rarity: 'common', description: '강한 힘을 가진 몬스터', unlock: '오크 처치' },
            { id: 'skeleton', name: '스켈레톤', rarity: 'rare', description: '언데드 몬스터', unlock: '스켈레톤 처치' },
            { id: 'dragon', name: '드래곤', rarity: 'legendary', description: '전설의 용', unlock: '드래곤 처치' },
            { id: 'demon_lord', name: '마왕', rarity: 'mythic', description: '악마들의 왕', unlock: '마왕 처치' }
        ];

        for (const monster of monsters) {
            await this.db.run(`
                INSERT OR IGNORE INTO collection_entries (category, entry_id, name, rarity, description, unlock_condition)
                VALUES ('monsters', ?, ?, ?, ?, ?)
            `, [monster.id, monster.name, monster.rarity, monster.description, monster.unlock]);
        }

        // 지역 도감 엔트리
        const locations = [
            { id: 'goblin_cave', name: '고블린 동굴', rarity: 'common', description: '고블린들이 사는 동굴', unlock: '고블린 동굴 방문' },
            { id: 'dark_forest', name: '어둠의 숲', rarity: 'rare', description: '위험한 어둠의 숲', unlock: '어둠의 숲 탐험' },
            { id: 'dragon_lair', name: '용의 둥지', rarity: 'legendary', description: '고대 용이 사는 곳', unlock: '용의 둥지 발견' },
            { id: 'heaven_realm', name: '천계', rarity: 'mythic', description: '신들이 사는 곳', unlock: '천계 도달' }
        ];

        for (const location of locations) {
            await this.db.run(`
                INSERT OR IGNORE INTO collection_entries (category, entry_id, name, rarity, description, unlock_condition)
                VALUES ('locations', ?, ?, ?, ?, ?)
            `, [location.id, location.name, location.rarity, location.description, location.unlock]);
        }

        // NPC 도감 엔트리
        const npcs = [
            { id: 'blacksmith', name: '대장장이', rarity: 'common', description: '장비를 만드는 대장장이', unlock: '대장장이와 대화' },
            { id: 'merchant', name: '상인', rarity: 'common', description: '아이템을 파는 상인', unlock: '상인과 거래' },
            { id: 'wise_sage', name: '현자', rarity: 'epic', description: '지혜로운 현자', unlock: '현자의 시험 완료' },
            { id: 'dragon_king', name: '용왕', rarity: 'legendary', description: '모든 용을 다스리는 왕', unlock: '용왕과 만남' },
            { id: 'creator_god', name: '창조신', rarity: 'mythic', description: '모든 것을 창조한 신', unlock: '창조신과 대면' }
        ];

        for (const npc of npcs) {
            await this.db.run(`
                INSERT OR IGNORE INTO collection_entries (category, entry_id, name, rarity, description, unlock_condition)
                VALUES ('npcs', ?, ?, ?, ?, ?)
            `, [npc.id, npc.name, npc.rarity, npc.description, npc.unlock]);
        }

        // 제작법 도감 엔트리
        const recipes = [
            { id: 'iron_sword', name: '철검 제작법', rarity: 'common', description: '기본적인 철검 제작법', unlock: '대장장이에게 배움' },
            { id: 'healing_potion', name: '치유 물약 제작법', rarity: 'common', description: '체력을 회복하는 물약', unlock: '연금술사에게 배움' },
            { id: 'dragon_armor', name: '용린 갑옷 제작법', rarity: 'legendary', description: '용의 비늘로 만든 갑옷', unlock: '전설의 대장장이에게 배움' },
            { id: 'philosophers_stone', name: '현자의 돌 제작법', rarity: 'mythic', description: '모든 것을 금으로 바꾸는 돌', unlock: '연금술 마스터가 됨' }
        ];

        for (const recipe of recipes) {
            await this.db.run(`
                INSERT OR IGNORE INTO collection_entries (category, entry_id, name, rarity, description, unlock_condition)
                VALUES ('recipes', ?, ?, ?, ?, ?)
            `, [recipe.id, recipe.name, recipe.rarity, recipe.description, recipe.unlock]);
        }
    }

    async seedCollectionRewards() {
        const rewards = [
            // 몬스터 도감 보상
            { category: 'monsters', milestone: 10, type: 'money', value: '10000', description: '몬스터 10종 발견 보상' },
            { category: 'monsters', milestone: 25, type: 'title', value: 'monster_hunter', description: '몬스터 헌터 칭호' },
            { category: 'monsters', milestone: 50, type: 'item', value: 'rare_gem', description: '희귀 보석' },
            { category: 'monsters', milestone: 75, type: 'stats', value: '{"strength": 10, "agility": 10}', description: '전투 능력 향상' },
            { category: 'monsters', milestone: 100, type: 'title', value: 'monster_master', description: '몬스터 마스터 칭호' },

            // 아이템 도감 보상
            { category: 'items', milestone: 20, type: 'money', value: '20000', description: '아이템 20종 수집 보상' },
            { category: 'items', milestone: 50, type: 'title', value: 'collector', description: '컬렉터 칭호' },
            { category: 'items', milestone: 100, type: 'item', value: 'legendary_chest', description: '전설의 상자' },

            // 지역 도감 보상
            { category: 'locations', milestone: 25, type: 'title', value: 'explorer', description: '탐험가 칭호' },
            { category: 'locations', milestone: 50, type: 'stats', value: '{"luck": 15, "agility": 10}', description: '탐험 능력 향상' },
            { category: 'locations', milestone: 100, type: 'title', value: 'world_traveler', description: '세계 여행자 칭호' },

            // 펫 도감 보상
            { category: 'pets', milestone: 10, type: 'item', value: 'pet_food', description: '펫 사료' },
            { category: 'pets', milestone: 30, type: 'title', value: 'pet_lover', description: '펫 애호가 칭호' },
            { category: 'pets', milestone: 50, type: 'stats', value: '{"charm": 20, "happiness": 25}', description: '매력 및 행복도 증가' }
        ];

        for (const reward of rewards) {
            await this.db.run(`
                INSERT OR IGNORE INTO collection_rewards (category, milestone_percentage, reward_type, reward_value, description)
                VALUES (?, ?, ?, ?, ?)
            `, [reward.category, reward.milestone, reward.type, reward.value, reward.description]);
        }
    }

    async discoverEntry(playerId, category, entryId, discoveryMethod = 'unknown') {
        try {
            // 엔트리 존재 확인
            const entry = await this.db.get(`
                SELECT * FROM collection_entries WHERE category = ? AND entry_id = ?
            `, [category, entryId]);

            if (!entry) {
                return { success: false, message: '존재하지 않는 도감 엔트리입니다.' };
            }

            // 이미 발견했는지 확인
            const existing = await this.db.get(`
                SELECT * FROM player_collections WHERE player_id = ? AND category = ? AND entry_id = ?
            `, [playerId, category, entryId]);

            if (existing) {
                // 이미 발견했다면 조우 횟수만 증가
                await this.db.run(`
                    UPDATE player_collections 
                    SET times_encountered = times_encountered + 1
                    WHERE player_id = ? AND category = ? AND entry_id = ?
                `, [playerId, category, entryId]);

                return { 
                    success: true, 
                    message: `${entry.name}을(를) 다시 발견했습니다! (${existing.times_encountered + 1}번째)`,
                    isNew: false,
                    entry: entry
                };
            }

            // 새로 발견
            await this.db.run(`
                INSERT INTO player_collections (player_id, category, entry_id, discovery_method)
                VALUES (?, ?, ?, ?)
            `, [playerId, category, entryId, discoveryMethod]);

            // 진행도 업데이트
            await this.updateCollectionProgress(playerId, category);

            // 보상 확인
            const rewards = await this.checkMilestoneRewards(playerId, category);

            return {
                success: true,
                message: `🎉 새로운 발견! ${entry.name}이(가) 도감에 추가되었습니다!`,
                isNew: true,
                entry: entry,
                rewards: rewards
            };

        } catch (error) {
            console.error('도감 엔트리 발견 오류:', error);
            return { success: false, message: '도감 업데이트 중 오류가 발생했습니다.' };
        }
    }

    async updateCollectionProgress(playerId, category) {
        // 전체 엔트리 수
        const totalEntries = await this.db.get(`
            SELECT COUNT(*) as count FROM collection_entries WHERE category = ?
        `, [category]);

        // 발견한 엔트리 수
        const discoveredEntries = await this.db.get(`
            SELECT COUNT(*) as count FROM player_collections WHERE player_id = ? AND category = ?
        `, [playerId, category]);

        const completionPercentage = (discoveredEntries.count / totalEntries.count) * 100;

        // 진행도 업데이트
        await this.db.run(`
            INSERT OR REPLACE INTO collection_progress (player_id, category, total_entries, discovered_entries, completion_percentage, last_updated)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [playerId, category, totalEntries.count, discoveredEntries.count, completionPercentage]);
    }

    async checkMilestoneRewards(playerId, category) {
        const progress = await this.db.get(`
            SELECT completion_percentage FROM collection_progress WHERE player_id = ? AND category = ?
        `, [playerId, category]);

        if (!progress) return [];

        // 달성 가능한 보상 확인
        const availableRewards = await this.db.all(`
            SELECT * FROM collection_rewards 
            WHERE category = ? AND milestone_percentage <= ?
            ORDER BY milestone_percentage DESC
        `, [category, progress.completion_percentage]);

        const newRewards = [];
        for (const reward of availableRewards) {
            // 이미 받은 보상인지 확인 (여기서는 간단히 구현)
            const rewardGiven = await this.db.get(`
                SELECT * FROM transactions 
                WHERE player_id = ? AND description LIKE ?
            `, [playerId, `%${reward.description}%`]);

            if (!rewardGiven) {
                await this.giveCollectionReward(playerId, reward);
                newRewards.push(reward);
            }
        }

        return newRewards;
    }

    async giveCollectionReward(playerId, reward) {
        try {
            switch (reward.reward_type) {
                case 'money':
                    const amount = parseInt(reward.reward_value);
                    await this.db.run(`
                        UPDATE players SET money = money + ? WHERE id = ?
                    `, [amount, playerId]);
                    
                    await this.db.run(`
                        INSERT INTO transactions (player_id, type, amount, description)
                        VALUES (?, 'collection_reward', ?, ?)
                    `, [playerId, amount, reward.description]);
                    break;

                case 'stats':
                    const stats = JSON.parse(reward.reward_value);
                    let updateSQL = 'UPDATE player_stats SET ';
                    const updateValues = [];
                    
                    for (const [stat, value] of Object.entries(stats)) {
                        updateSQL += `${stat} = ${stat} + ?, `;
                        updateValues.push(value);
                    }
                    
                    updateSQL = updateSQL.slice(0, -2) + ' WHERE player_id = ?';
                    updateValues.push(playerId);
                    
                    await this.db.run(updateSQL, updateValues);
                    break;

                case 'title':
                    // 칭호 지급 (구현에 따라 다를 수 있음)
                    break;

                case 'item':
                    // 아이템 지급 (구현에 따라 다를 수 있음)
                    break;
            }
        } catch (error) {
            console.error('도감 보상 지급 오류:', error);
        }
    }

    async getPlayerCollection(playerId, category = null) {
        let sql = `
            SELECT 
                pc.category,
                pc.entry_id,
                ce.name,
                ce.rarity,
                ce.description,
                pc.discovered_date,
                pc.discovery_method,
                pc.times_encountered
            FROM player_collections pc
            JOIN collection_entries ce ON pc.category = ce.category AND pc.entry_id = ce.entry_id
            WHERE pc.player_id = ?
        `;
        const params = [playerId];

        if (category) {
            sql += ' AND pc.category = ?';
            params.push(category);
        }

        sql += ' ORDER BY pc.discovered_date DESC';

        return await this.db.all(sql, params);
    }

    async getCollectionProgress(playerId) {
        return await this.db.all(`
            SELECT 
                cp.*,
                (SELECT name FROM (VALUES 
                    ('monsters', '몬스터 도감'),
                    ('items', '아이템 도감'),
                    ('equipment', '장비 도감'),
                    ('pets', '펫 도감'),
                    ('achievements', '업적 도감'),
                    ('locations', '지역 도감'),
                    ('npcs', 'NPC 도감'),
                    ('skills', '스킬 도감'),
                    ('ores', '광물 도감'),
                    ('recipes', '제작법 도감')
                ) AS category_names(id, name) WHERE id = cp.category) as category_name
            FROM collection_progress cp
            WHERE cp.player_id = ?
            ORDER BY cp.completion_percentage DESC
        `, [playerId]);
    }

    async getCategoryEntries(category) {
        return await this.db.all(`
            SELECT * FROM collection_entries WHERE category = ?
            ORDER BY rarity, name
        `, [category]);
    }

    async getCollectionStats(playerId) {
        const totalStats = await this.db.get(`
            SELECT 
                COUNT(DISTINCT category) as categories_started,
                COUNT(*) as total_discovered,
                AVG(completion_percentage) as average_completion
            FROM collection_progress
            WHERE player_id = ?
        `, [playerId]);

        const rarityStats = await this.db.all(`
            SELECT 
                ce.rarity,
                COUNT(*) as count
            FROM player_collections pc
            JOIN collection_entries ce ON pc.category = ce.category AND pc.entry_id = ce.entry_id
            WHERE pc.player_id = ?
            GROUP BY ce.rarity
            ORDER BY ce.rarity
        `, [playerId]);

        return { totalStats, rarityStats };
    }

    createCollectionOverviewEmbed(playerId, progress) {
        const embed = new EmbedBuilder()
            .setColor('#00ff99')
            .setTitle('📚 도감 현황')
            .setDescription('다양한 카테고리의 도감을 완성해보세요!')
            .setTimestamp();

        if (progress.length === 0) {
            embed.addFields({
                name: '📝 시작하기',
                value: '아직 수집한 것이 없습니다. 모험을 시작해보세요!',
                inline: false
            });
            return embed;
        }

        for (const category of progress) {
            const completionBar = this.createProgressBar(category.completion_percentage);
            const categoryInfo = this.collectionCategories.find(c => c.id === category.category);
            
            embed.addFields({
                name: `${categoryInfo?.emoji || '📖'} ${category.category_name}`,
                value: [
                    `${completionBar} ${category.completion_percentage.toFixed(1)}%`,
                    `📊 ${category.discovered_entries}/${category.total_entries}`,
                    `📅 마지막 업데이트: ${new Date(category.last_updated).toLocaleDateString('ko-KR')}`
                ].join('\n'),
                inline: true
            });
        }

        return embed;
    }

    createCollectionDetailEmbed(category, entries, playerCollection) {
        const categoryInfo = this.collectionCategories.find(c => c.id === category);
        const embed = new EmbedBuilder()
            .setColor('#6699ff')
            .setTitle(`${categoryInfo?.emoji || '📖'} ${categoryInfo?.name || category}`)
            .setDescription(categoryInfo?.description || '도감 상세 정보')
            .setTimestamp();

        const playerEntryIds = new Set(playerCollection.map(e => e.entry_id));
        
        // 희귀도별로 그룹화
        const entriesByRarity = {};
        entries.forEach(entry => {
            if (!entriesByRarity[entry.rarity]) {
                entriesByRarity[entry.rarity] = [];
            }
            entriesByRarity[entry.rarity].push(entry);
        });

        for (const [rarity, rarityEntries] of Object.entries(entriesByRarity)) {
            const rarityInfo = this.rarityInfo[rarity] || this.rarityInfo.common;
            const entryTexts = rarityEntries.map(entry => {
                const isDiscovered = playerEntryIds.has(entry.entry_id);
                const playerEntry = playerCollection.find(pe => pe.entry_id === entry.entry_id);
                
                if (isDiscovered) {
                    return `✅ **${entry.name}** (x${playerEntry.times_encountered})`;
                } else {
                    return `❓ **???**`;
                }
            });

            embed.addFields({
                name: `${rarityInfo.emoji} ${rarityInfo.name} (${entryTexts.filter(t => t.includes('✅')).length}/${rarityEntries.length})`,
                value: entryTexts.join('\n') || '없음',
                inline: false
            });
        }

        return embed;
    }

    createProgressBar(percentage) {
        const barLength = 10;
        const filledBars = Math.floor((percentage / 100) * barLength);
        const emptyBars = barLength - filledBars;
        
        return '🟩'.repeat(filledBars) + '⬜'.repeat(emptyBars);
    }

    createDiscoveryEmbed(result) {
        const embed = new EmbedBuilder()
            .setColor(result.isNew ? '#00ff00' : '#ffff00')
            .setTitle(result.isNew ? '🎉 새로운 발견!' : '🔄 재발견!')
            .setDescription(result.message)
            .setTimestamp();

        if (result.entry) {
            const rarityInfo = this.rarityInfo[result.entry.rarity] || this.rarityInfo.common;
            
            embed.addFields({
                name: `${rarityInfo.emoji} ${result.entry.name}`,
                value: [
                    `🔸 희귀도: ${rarityInfo.name}`,
                    `📝 ${result.entry.description}`,
                    `🔓 해금 조건: ${result.entry.unlock_condition}`
                ].join('\n'),
                inline: false
            });
        }

        if (result.rewards && result.rewards.length > 0) {
            const rewardTexts = result.rewards.map(reward => 
                `🎁 ${reward.description}`
            );
            
            embed.addFields({
                name: '🏆 마일스톤 보상',
                value: rewardTexts.join('\n'),
                inline: false
            });
        }

        return embed;
    }
}

module.exports = CollectionSystem;
