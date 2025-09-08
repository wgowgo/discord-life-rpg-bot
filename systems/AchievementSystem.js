const { EmbedBuilder } = require('discord.js');

class AchievementSystem {
    constructor(database) {
        this.db = database;
        this.achievements = [
            // 기본 업적들
            {
                id: 'first_login',
                name: '첫 걸음',
                description: '게임에 처음 로그인했습니다',
                icon: '🎮',
                category: 'basic',
                requirement: { type: 'login', value: 1 },
                reward: { money: 10000, exp: 100 }
            },
            {
                id: 'first_job',
                name: '사회 초년생',
                description: '첫 직업을 얻었습니다',
                icon: '💼',
                category: 'career',
                requirement: { type: 'job_obtained', value: 1 },
                reward: { money: 50000, exp: 500 }
            },
            {
                id: 'first_property',
                name: '부동산 투자자',
                description: '첫 부동산을 구매했습니다',
                icon: '🏠',
                category: 'investment',
                requirement: { type: 'property_purchased', value: 1 },
                reward: { money: 100000, exp: 1000 }
            },
            {
                id: 'first_business',
                name: '창업가',
                description: '첫 사업을 시작했습니다',
                icon: '🏢',
                category: 'business',
                requirement: { type: 'business_started', value: 1 },
                reward: { money: 200000, exp: 2000 }
            },
            {
                id: 'first_fish',
                name: '낚시꾼',
                description: '첫 물고기를 잡았습니다',
                icon: '🎣',
                category: 'activity',
                requirement: { type: 'fish_caught', value: 1 },
                reward: { money: 30000, exp: 300 }
            },
            {
                id: 'first_crop',
                name: '농부',
                description: '첫 작물을 수확했습니다',
                icon: '🌾',
                category: 'activity',
                requirement: { type: 'crop_harvested', value: 1 },
                reward: { money: 40000, exp: 400 }
            },
            {
                id: 'first_mining',
                name: '광부',
                description: '첫 광물을 채굴했습니다',
                icon: '⛏️',
                category: 'activity',
                requirement: { type: 'mining_done', value: 1 },
                reward: { money: 50000, exp: 500 }
            },
            {
                id: 'millionaire',
                name: '백만장자',
                description: '100만원을 모았습니다',
                icon: '💰',
                category: 'wealth',
                requirement: { type: 'money_earned', value: 1000000 },
                reward: { money: 100000, exp: 1000 }
            },
            {
                id: 'multi_job',
                name: '다재다능',
                description: '3개의 다른 직업을 경험했습니다',
                icon: '🔄',
                category: 'career',
                requirement: { type: 'jobs_tried', value: 3 },
                reward: { money: 150000, exp: 1500 }
            },
            {
                id: 'property_tycoon',
                name: '부동산 재벌',
                description: '5개의 부동산을 소유했습니다',
                icon: '🏘️',
                category: 'investment',
                requirement: { type: 'properties_owned', value: 5 },
                reward: { money: 500000, exp: 5000 }
            }
        ];
    }

    async initializeAchievementSystem() {
        // 업적 테이블 생성
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS achievements (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                icon TEXT NOT NULL,
                category TEXT NOT NULL,
                requirement_type TEXT NOT NULL,
                requirement_value INTEGER NOT NULL,
                reward_money INTEGER DEFAULT 0,
                reward_exp INTEGER DEFAULT 0
            )
        `);

        // 기존 테이블에 icon 컬럼 추가 (없는 경우)
        await this.db.run(`
            ALTER TABLE achievements ADD COLUMN icon TEXT DEFAULT '🏆'
        `).catch(() => {}); // 이미 존재하면 무시

        // 플레이어 업적 테이블 생성
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS player_achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                achievement_id TEXT NOT NULL,
                unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(player_id, achievement_id),
                FOREIGN KEY (achievement_id) REFERENCES achievements(id)
            )
        `);

        // 업적 데이터 삽입
        for (const achievement of this.achievements) {
            await this.db.run(`
                INSERT OR IGNORE INTO achievements 
                (id, name, description, icon, category, requirement_type, requirement_value, reward_money, reward_exp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                achievement.id,
                achievement.name,
                achievement.description,
                achievement.icon,
                achievement.category,
                achievement.requirement.type,
                achievement.requirement.value,
                achievement.reward.money,
                achievement.reward.exp
            ]);
        }

        console.log('업적 시스템 초기화 완료');
    }

    async checkAchievements(playerId, type, value = 1) {
        try {
            // 해당 타입의 업적들 조회
            const achievements = await this.db.all(`
                SELECT * FROM achievements 
                WHERE requirement_type = ? AND requirement_value <= ?
            `, [type, value]);

            const unlockedAchievements = [];

            for (const achievement of achievements) {
                // 이미 획득한 업적인지 확인
                const existing = await this.db.get(`
                    SELECT * FROM player_achievements 
                    WHERE player_id = ? AND achievement_id = ?
                `, [playerId, achievement.id]);

                if (!existing) {
                    // 업적 획득
                    await this.db.run(`
                        INSERT INTO player_achievements (player_id, achievement_id)
                        VALUES (?, ?)
                    `, [playerId, achievement.id]);

                    // 보상 지급
                    if (achievement.reward_money > 0) {
                        await this.db.run(`
                            UPDATE players SET money = money + ? WHERE id = ?
                        `, [achievement.reward_money, playerId]);
                    }

                    if (achievement.reward_exp > 0) {
                        await this.db.run(`
                            UPDATE players SET exp = exp + ? WHERE id = ?
                        `, [achievement.reward_exp, playerId]);
                    }

                    unlockedAchievements.push(achievement);
                }
            }

            return unlockedAchievements;

        } catch (error) {
            console.error('업적 확인 오류:', error);
            return [];
        }
    }

    async getPlayerAchievements(playerId) {
        return await this.db.all(`
            SELECT 
                pa.*,
                a.name,
                a.description,
                a.icon,
                a.category
            FROM player_achievements pa
            JOIN achievements a ON pa.achievement_id = a.id
            WHERE pa.player_id = ?
            ORDER BY pa.unlocked_at DESC
        `, [playerId]);
    }

    async getAllAchievements() {
        return await this.db.all(`
            SELECT 
                a.*,
                CASE WHEN pa.player_id IS NOT NULL THEN 1 ELSE 0 END as is_unlocked
            FROM achievements a
            LEFT JOIN player_achievements pa ON a.id = pa.achievement_id
            ORDER BY a.category, a.requirement_value ASC
        `);
    }

    async getAchievementStats(playerId) {
        const stats = await this.db.get(`
            SELECT 
                COUNT(*) as total_achievements,
                SUM(a.reward_money) as total_money_earned,
                SUM(a.reward_exp) as total_exp_earned
            FROM player_achievements pa
            JOIN achievements a ON pa.achievement_id = a.id
            WHERE pa.player_id = ?
        `, [playerId]);

        return stats || { total_achievements: 0, total_money_earned: 0, total_exp_earned: 0 };
    }

    createAchievementEmbed(achievements, title = '업적 목록') {
        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle(title)
            .setTimestamp();

        if (achievements.length === 0) {
            embed.setDescription('획득한 업적이 없습니다.');
            return embed;
        }

        const categories = {};
        achievements.forEach(achievement => {
            if (!categories[achievement.category]) {
                categories[achievement.category] = [];
            }
            categories[achievement.category].push(achievement);
        });

        for (const [category, categoryAchievements] of Object.entries(categories)) {
            const categoryEmojis = {
                'basic': '🎮',
                'career': '💼',
                'investment': '💰',
                'business': '🏢',
                'activity': '🎯',
                'wealth': '💎'
            };

            const achievementsText = categoryAchievements.map(achievement => {
                const status = achievement.is_unlocked ? '✅' : '❌';
                return `${status} **${achievement.name}** - ${achievement.description}`;
            }).join('\n');

            embed.addFields({
                name: `${categoryEmojis[category] || '🏆'} ${category.toUpperCase()}`,
                value: achievementsText,
                inline: false
            });
        }

        return embed;
    }

    createUnlockedAchievementEmbed(achievements) {
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🏆 새로운 업적을 획득했습니다!')
            .setTimestamp();

        for (const achievement of achievements) {
            embed.addFields({
                name: `${achievement.icon} ${achievement.name}`,
                value: [
                    achievement.description,
                    `💰 보상: ${achievement.reward_money.toLocaleString()}원`,
                    `⭐ 경험치: ${achievement.reward_exp.toLocaleString()}`
                ].join('\n'),
                inline: false
            });
        }

        return embed;
    }
}

module.exports = AchievementSystem;
