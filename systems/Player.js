const { EmbedBuilder } = require('discord.js');

class Player {
    constructor(database) {
        this.db = database;
    }

    async getProfile(userId, username = null, createIfNotExists = true) {
        try {
            let player = await this.db.get(`
                SELECT * FROM players WHERE id = ?
            `, [userId]);

            let isNewPlayer = false;
            
            // 플레이어가 없으면 새로 생성 (createIfNotExists가 true일 때만)
            if (!player && username && createIfNotExists) {
                console.log(`새 플레이어 생성 중 - 사용자: ${username} (${userId})`);
                const createResult = await this.createPlayer(userId, username);
                console.log(`플레이어 생성 결과:`, createResult);
                
                player = await this.db.get(`
                    SELECT * FROM players WHERE id = ?
                `, [userId]);
                console.log(`생성된 플레이어 확인:`, player ? '성공' : '실패');
                isNewPlayer = true;
            }

            if (!player) return null;

            const stats = await this.db.get(`
                SELECT * FROM player_stats WHERE player_id = ?
            `, [userId]);

            const currentJob = await this.db.get(`
                SELECT pj.*, j.name as job_name, j.category 
                FROM player_jobs pj
                JOIN jobs j ON pj.job_id = j.id
                WHERE pj.player_id = ? AND pj.is_current = TRUE
            `, [userId]);

            const achievements = await this.db.all(`
                SELECT COUNT(*) as count FROM player_achievements WHERE player_id = ?
            `, [userId]);

            const activePet = await this.db.get(`
                SELECT pp.*, pt.name as pet_name, pt.special_ability
                FROM player_pets pp
                JOIN pet_types pt ON pp.pet_type_id = pt.id
                WHERE pp.player_id = ? AND pp.is_active = TRUE
            `, [userId]);

            const activeTitle = await this.db.get(`
                SELECT pt.*, t.name as title_name
                FROM player_titles pt
                JOIN titles t ON pt.title_id = t.id
                WHERE pt.player_id = ? AND pt.is_active = TRUE
            `, [userId]);

            return {
                player: player,
                stats: stats,
                currentJob: currentJob,
                achievementCount: achievements[0]?.count || 0,
                activePet: activePet,
                activeTitle: activeTitle,
                isNewPlayer: isNewPlayer
            };

        } catch (error) {
            console.error('프로필 조회 오류:', error);
            return null;
        }
    }

    async createProfileEmbed(profileData) {
        if (!profileData) {
            return new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('오류')
                .setDescription('플레이어 정보를 찾을 수 없습니다.');
        }

        const { player, stats, currentJob, achievementCount, activePet, activeTitle } = profileData;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${player.username}의 인생`);

        if (activeTitle) {
            embed.setTitle(`${activeTitle.title_name} ${player.username}의 인생`);
        }

        // 기본 정보
        embed.addFields(
            { name: '💰 자산', value: `${player.money.toLocaleString()}원`, inline: true },
            { name: '📊 레벨', value: `${player.level} (${player.experience} XP)`, inline: true },
            { name: '🎂 나이', value: `${player.age}세`, inline: true }
        );

        // 직업 정보
        if (currentJob) {
            embed.addFields({
                name: '💼 현재 직업',
                value: `${currentJob.job_name} (${currentJob.salary.toLocaleString()}원/월)`,
                inline: false
            });
        }

        // 스탯 정보
        if (stats) {
            const statText = [
                `❤️ 체력: ${stats.health}`,
                `😊 행복: ${stats.happiness}`,
                `🧠 지능: ${stats.intelligence}`,
                `💪 근력: ${stats.strength}`,
                `🏃 민첩: ${stats.agility}`,
                `✨ 매력: ${stats.charm}`,
                `🍀 운: ${stats.luck}`,
                `📚 교육: ${stats.education}`
            ].join('\n');

            embed.addFields({
                name: '📈 능력치',
                value: statText,
                inline: true
            });
        }

        // 펫 정보
        if (activePet) {
            embed.addFields({
                name: '🐾 반려동물',
                value: `${activePet.name} (Lv.${activePet.level})\n특수능력: ${activePet.special_ability}`,
                inline: true
            });
        }

        // 업적 정보
        embed.addFields({
            name: '🏆 업적',
            value: `${achievementCount}개 달성`,
            inline: true
        });

        embed.setTimestamp();
        return embed;
    }

    async createPlayer(userId, username) {
        const startingMoney = 50000; // 기본 시작 자금
        const startingStats = {
            health: 100,
            happiness: 50,
            education: 10,
            charm: 10,
            luck: 10,
            intelligence: 10,
            strength: 10,
            agility: 10
        };
        
        try {
            // 플레이어 생성
            await this.db.run(`
                INSERT INTO players (id, username, money, level, experience, age, created_at)
                VALUES (?, ?, ?, 1, 0, 20, CURRENT_TIMESTAMP)
            `, [userId, username, startingMoney]);

            // 스탯 생성
            await this.db.run(`
                INSERT INTO player_stats (
                    player_id, health, happiness, education, charm, luck, 
                    intelligence, strength, agility
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                userId,
                startingStats.health,
                startingStats.happiness,
                startingStats.education,
                startingStats.charm,
                startingStats.luck,
                startingStats.intelligence,
                startingStats.strength,
                startingStats.agility
            ]);

            console.log(`새 플레이어 생성: ${username} (${userId})`);
            return true;
            
        } catch (error) {
            console.error('플레이어 생성 오류:', error);
            return false;
        }
    }

    async updateStats(userId, statChanges) {
        try {
            const updateFields = [];
            const values = [];

            for (const [stat, change] of Object.entries(statChanges)) {
                updateFields.push(`${stat} = CASE WHEN ${stat} + ? < 0 THEN 0 WHEN ${stat} + ? > 100 THEN 100 ELSE ${stat} + ? END`);
                values.push(change, change, change);
            }

            values.push(userId);

            const sql = `UPDATE player_stats SET ${updateFields.join(', ')} WHERE player_id = ?`;
            await this.db.run(sql, values);

            return true;
        } catch (error) {
            console.error('스탯 업데이트 오류:', error);
            return false;
        }
    }

    async ageUp(userId) {
        try {
            // 나이 증가
            await this.db.run('UPDATE players SET age = age + 1 WHERE id = ?', [userId]);

            // 랜덤 이벤트 발생 확률
            if (Math.random() < 0.3) { // 30% 확률
                return await this.triggerRandomEvent(userId);
            }

            return null;
        } catch (error) {
            console.error('나이 증가 오류:', error);
            return null;
        }
    }

    async triggerRandomEvent(userId) {
        const events = [
            {
                name: '건강검진',
                description: '정기 건강검진을 받았습니다.',
                effects: { health: 10 },
                cost: 50000
            },
            {
                name: '복권 당첨',
                description: '소액 복권에 당첨되었습니다!',
                effects: {},
                reward: 100000
            },
            {
                name: '감기',
                description: '감기에 걸렸습니다.',
                effects: { health: -20, happiness: -10 },
                cost: 30000
            },
            {
                name: '친구와의 만남',
                description: '오랜 친구와 즐거운 시간을 보냈습니다.',
                effects: { happiness: 15 },
                cost: 20000
            },
            {
                name: '책 읽기',
                description: '유익한 책을 읽고 지식을 쌓았습니다.',
                effects: { intelligence: 5 },
                cost: 15000
            }
        ];

        const event = events[Math.floor(Math.random() * events.length)];

        // 비용 지불 (돈이 부족하면 이벤트 발생 안함)
        if (event.cost) {
            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [userId]);
            if (!player || player.money < event.cost) {
                return null;
            }

            await this.db.run('UPDATE players SET money = money - ? WHERE id = ?', [event.cost, userId]);
        }

        // 보상 지급
        if (event.reward) {
            await this.db.run('UPDATE players SET money = money + ? WHERE id = ?', [event.reward, userId]);
        }

        // 스탯 변경
        if (Object.keys(event.effects).length > 0) {
            await this.updateStats(userId, event.effects);
        }

        return event;
    }

    async getRankings(category = 'wealth', limit = 10) {
        try {
            const rankings = await this.db.all(`
                SELECT 
                    r.rank_position,
                    p.username,
                    r.value,
                    pt.title_name
                FROM rankings r
                JOIN players p ON r.player_id = p.id
                LEFT JOIN player_titles ept ON p.id = ept.player_id AND ept.is_active = TRUE
                LEFT JOIN titles pt ON ept.title_id = pt.id
                WHERE r.category = ?
                ORDER BY r.rank_position ASC
                LIMIT ?
            `, [category, limit]);

            return rankings;
        } catch (error) {
            console.error('랭킹 조회 오류:', error);
            return [];
        }
    }

    async createRankingEmbed(category, rankings) {
        const categoryNames = {
            'wealth': '💰 부자 랭킹',
            'level': '📊 레벨 랭킹',
            'achievements': '🏆 업적 랭킹'
        };

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle(categoryNames[category] || '랭킹')
            .setTimestamp();

        if (rankings.length === 0) {
            embed.setDescription('랭킹 데이터가 없습니다.');
            return embed;
        }

        let description = '';
        for (const rank of rankings) {
            const medal = rank.rank_position <= 3 ? ['🥇', '🥈', '🥉'][rank.rank_position - 1] : `${rank.rank_position}.`;
            const title = rank.title_name ? `[${rank.title_name}] ` : '';
            
            let valueText = '';
            switch (category) {
                case 'wealth':
                    valueText = `${Math.floor(rank.value).toLocaleString()}원`;
                    break;
                case 'level':
                    valueText = `${Math.floor(rank.value)}레벨`;
                    break;
                case 'achievements':
                    valueText = `${Math.floor(rank.value)}개`;
                    break;
            }

            description += `${medal} ${title}${rank.username} - ${valueText}\n`;
        }

        embed.setDescription(description);
        return embed;
    }

    async getInventory(userId) {
        try {
            const items = await this.db.all(`
                SELECT 
                    pi.*,
                    i.name,
                    i.category,
                    i.rarity,
                    i.description,
                    i.consumable
                FROM player_inventory pi
                JOIN items i ON pi.item_id = i.id
                WHERE pi.player_id = ?
                ORDER BY i.rarity DESC, i.name ASC
            `, [userId]);

            return items;
        } catch (error) {
            console.error('인벤토리 조회 오류:', error);
            return [];
        }
    }

    async useItem(userId, itemId) {
        try {
            // 아이템 보유 확인
            const playerItem = await this.db.get(`
                SELECT pi.*, i.* FROM player_inventory pi
                JOIN items i ON pi.item_id = i.id
                WHERE pi.player_id = ? AND pi.item_id = ?
            `, [userId, itemId]);

            if (!playerItem) {
                return { success: false, message: '해당 아이템을 보유하고 있지 않습니다.' };
            }

            if (!playerItem.consumable) {
                return { success: false, message: '사용할 수 없는 아이템입니다.' };
            }

            // 아이템 효과 적용
            if (playerItem.stats_effect) {
                const effects = JSON.parse(playerItem.stats_effect);
                await this.updateStats(userId, effects);
            }

            // 아이템 수량 감소
            if (playerItem.quantity <= 1) {
                await this.db.run('DELETE FROM player_inventory WHERE id = ?', [playerItem.id]);
            } else {
                await this.db.run('UPDATE player_inventory SET quantity = quantity - 1 WHERE id = ?', [playerItem.id]);
            }

            return {
                success: true,
                message: `${playerItem.name}을(를) 사용했습니다.`,
                effects: playerItem.stats_effect ? JSON.parse(playerItem.stats_effect) : {}
            };

        } catch (error) {
            console.error('아이템 사용 오류:', error);
            return { success: false, message: '아이템 사용 중 오류가 발생했습니다.' };
        }
    }

    async addItem(userId, itemId, quantity = 1) {
        try {
            // 기존 아이템 확인
            const existing = await this.db.get(`
                SELECT * FROM player_inventory 
                WHERE player_id = ? AND item_id = ?
            `, [userId, itemId]);

            if (existing) {
                // 기존 아이템 수량 증가
                await this.db.run(`
                    UPDATE player_inventory SET quantity = quantity + ? WHERE id = ?
                `, [quantity, existing.id]);
            } else {
                // 새 아이템 추가
                await this.db.run(`
                    INSERT INTO player_inventory (player_id, item_id, quantity)
                    VALUES (?, ?, ?)
                `, [userId, itemId, quantity]);
            }

            return true;
        } catch (error) {
            console.error('아이템 추가 오류:', error);
            return false;
        }
    }
}

module.exports = Player;

