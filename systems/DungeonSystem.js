const { EmbedBuilder } = require('discord.js');

class DungeonSystem {
    constructor(database) {
        this.db = database;
        this.activeBattles = new Map(); // 진행 중인 전투
    }

    async initializeDungeons() {
        // 기본 던전들 생성
        const dungeons = [
            // 일상 던전
            {
                name: '직장 던전',
                type: 'daily',
                difficulty: 1,
                required_level: 1,
                required_stats: JSON.stringify({ attack: 15, defense: 10 }),
                rewards: JSON.stringify({ money: 50000, experience: 100, items: [1, 2] }),
                description: '회사에서 벌어지는 업무 전투!'
            },
            {
                name: '헬스장 던전',
                type: 'daily',
                difficulty: 2,
                required_level: 3,
                required_stats: JSON.stringify({ attack: 25, hp: 80 }),
                rewards: JSON.stringify({ experience: 150, stats: { strength: 5, health: 10 } }),
                description: '근육을 키우는 고된 훈련!'
            },
            {
                name: '도서관 던전',
                type: 'daily',
                difficulty: 1,
                required_level: 1,
                required_stats: JSON.stringify({ magic_attack: 20, mp: 60 }),
                rewards: JSON.stringify({ experience: 80, stats: { intelligence: 8, education: 3 } }),
                description: '지식의 바다에서 펼쳐지는 학습 전투!'
            },
            {
                name: '요리학원 던전',
                type: 'daily',
                difficulty: 2,
                required_level: 2,
                required_stats: JSON.stringify({ attack: 20, magic_attack: 15, speed: 12 }),
                rewards: JSON.stringify({ experience: 120, stats: { charm: 8, health: 5 } }),
                description: '뜨거운 주방에서 펼쳐지는 요리 배틀!'
            },
            {
                name: '쇼핑몰 던전',
                type: 'daily',
                difficulty: 1,
                required_level: 1,
                required_stats: JSON.stringify({ charm: 25, agility: 20 }),
                rewards: JSON.stringify({ money: 40000, experience: 90, items: [1, 3] }),
                description: '복잡한 쇼핑몰에서의 미션 수행!'
            },
            {
                name: '병원 던전',
                type: 'daily',
                difficulty: 3,
                required_level: 5,
                required_stats: JSON.stringify({ intelligence: 50, health: 40 }),
                rewards: JSON.stringify({ experience: 200, stats: { intelligence: 10, health: 15 } }),
                description: '응급상황이 가득한 병원에서의 의료 배틀!'
            },
            
            // 모험 던전
            {
                name: '신비한 숲',
                type: 'adventure',
                difficulty: 3,
                required_level: 5,
                required_stats: JSON.stringify({ agility: 50, luck: 30 }),
                rewards: JSON.stringify({ money: 100000, experience: 300, items: [3, 4, 5] }),
                description: '마법 생물들이 사는 신비로운 숲'
            },
            {
                name: '폐허된 성',
                type: 'adventure',
                difficulty: 5,
                required_level: 10,
                required_stats: JSON.stringify({ strength: 70, intelligence: 60 }),
                rewards: JSON.stringify({ money: 300000, experience: 800, items: [6, 7] }),
                description: '고대 왕국의 폐허가 된 성에서 보물 탐험'
            },
            {
                name: '용의 동굴',
                type: 'adventure',
                difficulty: 8,
                required_level: 20,
                required_stats: JSON.stringify({ strength: 90, agility: 80, luck: 70 }),
                rewards: JSON.stringify({ money: 1000000, experience: 2000, items: [8, 9, 10] }),
                description: '전설의 용이 지키는 보물 동굴'
            },
            {
                name: '얼음 동굴',
                type: 'adventure',
                difficulty: 4,
                required_level: 8,
                required_stats: JSON.stringify({ strength: 60, health: 50 }),
                rewards: JSON.stringify({ money: 200000, experience: 500, items: [4, 5, 6] }),
                description: '극한의 추위가 지배하는 얼음 동굴'
            },
            {
                name: '해적선',
                type: 'adventure',
                difficulty: 6,
                required_level: 15,
                required_stats: JSON.stringify({ agility: 70, charm: 50, luck: 60 }),
                rewards: JSON.stringify({ money: 500000, experience: 1200, items: [7, 8, 9] }),
                description: '보물을 싣고 있는 유령 해적선'
            },
            {
                name: '마법사의 탑',
                type: 'adventure',
                difficulty: 7,
                required_level: 18,
                required_stats: JSON.stringify({ intelligence: 85, luck: 65 }),
                rewards: JSON.stringify({ money: 800000, experience: 1500, items: [9, 10, 11] }),
                description: '고대 마법사가 남긴 신비한 마법의 탑'
            },
            {
                name: '지하 미로',
                type: 'adventure',
                difficulty: 5,
                required_level: 12,
                required_stats: JSON.stringify({ intelligence: 65, agility: 60 }),
                rewards: JSON.stringify({ money: 350000, experience: 900, items: [6, 7, 8] }),
                description: '복잡한 미로와 함정이 가득한 지하 던전'
            },
            
            // 특별 던전
            {
                name: '시간의 균열',
                type: 'special',
                difficulty: 10,
                required_level: 30,
                required_stats: JSON.stringify({ intelligence: 100, luck: 90 }),
                rewards: JSON.stringify({ money: 5000000, experience: 5000, items: [11, 12] }),
                description: '시공간이 뒤틀린 차원의 틈'
            },
            {
                name: '꿈의 세계',
                type: 'special',
                difficulty: 7,
                required_level: 15,
                required_stats: JSON.stringify({ happiness: 80, charm: 70 }),
                rewards: JSON.stringify({ experience: 1500, stats: { happiness: 20, charm: 15 } }),
                description: '무의식 속에서 펼쳐지는 환상의 모험'
            },
            {
                name: '악마의 성역',
                type: 'special',
                difficulty: 12,
                required_level: 35,
                required_stats: JSON.stringify({ strength: 95, intelligence: 90, health: 85 }),
                rewards: JSON.stringify({ money: 8000000, experience: 8000, items: [12, 13, 14] }),
                description: '최강의 악마들이 지키는 금단의 성역'
            },
            {
                name: '천사의 신전',
                type: 'special',
                difficulty: 9,
                required_level: 25,
                required_stats: JSON.stringify({ charm: 85, happiness: 75, luck: 80 }),
                rewards: JSON.stringify({ money: 3000000, experience: 3500, stats: { happiness: 30, charm: 25 } }),
                description: '순수한 영혼만이 입장할 수 있는 천사의 신전'
            },
            {
                name: '무한의 도서관',
                type: 'special',
                difficulty: 8,
                required_level: 22,
                required_stats: JSON.stringify({ intelligence: 90, education: 15 }),
                rewards: JSON.stringify({ experience: 2500, stats: { intelligence: 35, education: 5 } }),
                description: '모든 지식이 담긴 차원을 초월한 도서관'
            },
            
            // 보스 던전
            {
                name: '암흑의 군주',
                type: 'boss',
                difficulty: 15,
                required_level: 40,
                required_stats: JSON.stringify({ strength: 100, intelligence: 95, agility: 90, health: 95 }),
                rewards: JSON.stringify({ money: 15000000, experience: 15000, items: [15, 16, 17] }),
                description: '세계를 어둠으로 물들이려는 최강의 보스'
            },
            {
                name: '창조의 신',
                type: 'boss',
                difficulty: 20,
                required_level: 50,
                required_stats: JSON.stringify({ strength: 100, intelligence: 100, agility: 100, health: 100, charm: 100, happiness: 100, luck: 100 }),
                rewards: JSON.stringify({ money: 50000000, experience: 50000, items: [18, 19, 20] }),
                description: '모든 것을 창조한 절대적 존재와의 최종 결전'
            }
        ];

        for (const dungeon of dungeons) {
            await this.db.run(`
                INSERT OR IGNORE INTO dungeons (name, type, difficulty, required_level, required_stats, rewards, description)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [dungeon.name, dungeon.type, dungeon.difficulty, dungeon.required_level, 
                dungeon.required_stats, dungeon.rewards, dungeon.description]);
        }

        console.log('던전 데이터 초기화 완료');
    }

    async getDungeonList(type = null) {
        let sql = 'SELECT * FROM dungeons';
        let params = [];
        
        if (type) {
            sql += ' WHERE type = ?';
            params.push(type);
        }
        
        sql += ' ORDER BY difficulty ASC, required_level ASC';
        
        return await this.db.all(sql, params);
    }

    async enterDungeon(playerId, dungeonId) {
        try {
            // 던전 정보 확인
            const dungeon = await this.db.get('SELECT * FROM dungeons WHERE id = ?', [dungeonId]);
            if (!dungeon) {
                return { success: false, message: '존재하지 않는 던전입니다.' };
            }

            // 플레이어 정보 확인
            const player = await this.db.get('SELECT * FROM players WHERE id = ?', [playerId]);
            const rpgStats = await this.db.get('SELECT * FROM player_rpg_stats WHERE player_id = ?', [playerId]);
            
            if (!player || !rpgStats) {
                return { success: false, message: '플레이어 정보를 찾을 수 없습니다.' };
            }

            // RPG 레벨 체크
            if (rpgStats.rpg_level < dungeon.required_level) {
                return { 
                    success: false, 
                    message: `RPG 레벨이 부족합니다. 필요 레벨: ${dungeon.required_level}`
                };
            }

            // RPG 스탯 체크
            const requiredStats = JSON.parse(dungeon.required_stats);
            for (const [stat, required] of Object.entries(requiredStats)) {
                if (rpgStats[stat] < required) {
                    const statNames = {
                        'hp': '체력',
                        'mp': '마나',
                        'attack': '공격력',
                        'defense': '방어력',
                        'magic_attack': '마법 공격력',
                        'magic_defense': '마법 방어력',
                        'speed': '속도'
                    };
                    const statName = statNames[stat] || stat;
                    return { 
                        success: false, 
                        message: `${statName}이 부족합니다. (필요: ${required}, 보유: ${rpgStats[stat]})` 
                    };
                }
            }

            // 일일 던전 입장 횟수 체크
            if (dungeon.type === 'daily') {
                const today = new Date().toISOString().split('T')[0];
                const todayClears = await this.db.get(`
                    SELECT COUNT(*) as count FROM player_dungeon_clears 
                    WHERE player_id = ? AND dungeon_id = ? AND DATE(clear_time) = ?
                `, [playerId, dungeonId, today]);

                if (todayClears.count >= 3) {
                    return { 
                        success: false, 
                        message: '오늘은 이미 이 던전을 3번 클리어했습니다.' 
                    };
                }
            }

            // 전투 시작
            const battleResult = await this.startBattle(player, stats, dungeon);
            
            if (battleResult.victory) {
                // 던전 클리어 기록
                await this.recordDungeonClear(playerId, dungeonId, battleResult.score, battleResult.rewards);
                
                // 보상 지급
                await this.giveRewards(playerId, battleResult.rewards);
                
                return {
                    success: true,
                    message: `${dungeon.name} 클리어!`,
                    battleLog: battleResult.battleLog,
                    rewards: battleResult.rewards
                };
            } else {
                return {
                    success: false,
                    message: `${dungeon.name}에서 패배했습니다...`,
                    battleLog: battleResult.battleLog
                };
            }

        } catch (error) {
            console.error('던전 입장 오류:', error);
            return { success: false, message: '던전 입장 중 오류가 발생했습니다.' };
        }
    }

    async startBattle(player, stats, dungeon) {
        const battleLog = [];
        let playerHp = stats.health;
        let enemyHp = dungeon.difficulty * 50;
        
        battleLog.push(`🏰 ${dungeon.name} 전투 시작!`);
        battleLog.push(`👤 ${player.username} HP: ${playerHp}`);
        battleLog.push(`👹 적 HP: ${enemyHp}`);
        
        let turn = 1;
        while (playerHp > 0 && enemyHp > 0 && turn <= 10) {
            battleLog.push(`\n--- ${turn}턴 ---`);
            
            // 플레이어 공격
            const playerDamage = this.calculateDamage(stats, 'player');
            enemyHp -= playerDamage;
            battleLog.push(`⚔️ ${player.username}의 공격! ${playerDamage} 데미지`);
            
            if (enemyHp <= 0) {
                battleLog.push(`🎉 적을 물리쳤습니다!`);
                break;
            }
            
            // 적 공격
            const enemyDamage = Math.floor(dungeon.difficulty * (5 + Math.random() * 10));
            playerHp -= enemyDamage;
            battleLog.push(`💥 적의 반격! ${enemyDamage} 데미지`);
            
            if (playerHp <= 0) {
                battleLog.push(`💀 패배했습니다...`);
                break;
            }
            
            battleLog.push(`👤 HP: ${playerHp} | 👹 HP: ${enemyHp}`);
            turn++;
        }
        
        const victory = enemyHp <= 0;
        const score = victory ? Math.floor((playerHp / stats.health) * 1000) : 0;
        
        let rewards = null;
        if (victory) {
            rewards = JSON.parse(dungeon.rewards);
            // 점수에 따른 보상 조정
            if (rewards.money) rewards.money = Math.floor(rewards.money * (score / 1000));
            if (rewards.experience) rewards.experience = Math.floor(rewards.experience * (score / 1000));
        }
        
        return {
            victory,
            battleLog,
            score,
            rewards
        };
    }

    calculateDamage(stats, type) {
        if (type === 'player') {
            const baseDamage = stats.strength * 0.5 + stats.intelligence * 0.3;
            const critChance = stats.luck / 100;
            const isCrit = Math.random() < critChance;
            
            return Math.floor(baseDamage * (isCrit ? 2 : 1) * (0.8 + Math.random() * 0.4));
        }
        return Math.floor(10 + Math.random() * 20);
    }

    async recordDungeonClear(playerId, dungeonId, score, rewards) {
        await this.db.run(`
            INSERT INTO player_dungeon_clears (player_id, dungeon_id, score, rewards_received)
            VALUES (?, ?, ?, ?)
        `, [playerId, dungeonId, score, JSON.stringify(rewards)]);
    }

    async giveRewards(playerId, rewards) {
        // 돈 지급
        if (rewards.money) {
            await this.db.run('UPDATE players SET money = money + ? WHERE id = ?', [rewards.money, playerId]);
            await this.db.run(`
                INSERT INTO transactions (player_id, type, amount, description)
                VALUES (?, 'dungeon_reward', ?, '던전 클리어 보상')
            `, [playerId, rewards.money]);
        }

        // 경험치 지급
        if (rewards.experience) {
            await this.db.run('UPDATE players SET experience = experience + ? WHERE id = ?', [rewards.experience, playerId]);
        }

        // 스탯 증가
        if (rewards.stats) {
            const statUpdates = [];
            const values = [];
            
            for (const [stat, value] of Object.entries(rewards.stats)) {
                statUpdates.push(`${stat} = ${stat} + ?`);
                values.push(value);
            }
            
            values.push(playerId);
            await this.db.run(`UPDATE player_stats SET ${statUpdates.join(', ')} WHERE player_id = ?`, values);
        }

        // 아이템 지급
        if (rewards.items) {
            for (const itemId of rewards.items) {
                const chance = Math.random();
                if (chance < 0.3) { // 30% 확률로 아이템 획득
                    await this.addItemToPlayer(playerId, itemId, 1);
                }
            }
        }
    }

    async addItemToPlayer(playerId, itemId, quantity) {
        const existing = await this.db.get(`
            SELECT * FROM player_inventory WHERE player_id = ? AND item_id = ?
        `, [playerId, itemId]);

        if (existing) {
            await this.db.run(`
                UPDATE player_inventory SET quantity = quantity + ? WHERE id = ?
            `, [quantity, existing.id]);
        } else {
            await this.db.run(`
                INSERT INTO player_inventory (player_id, item_id, quantity)
                VALUES (?, ?, ?)
            `, [playerId, itemId, quantity]);
        }
    }

    async getDungeonRankings(dungeonId, limit = 10) {
        return await this.db.all(`
            SELECT 
                p.username,
                pdc.score,
                pdc.clear_time
            FROM player_dungeon_clears pdc
            JOIN players p ON pdc.player_id = p.id
            WHERE pdc.dungeon_id = ?
            ORDER BY pdc.score DESC, pdc.clear_time ASC
            LIMIT ?
        `, [dungeonId, limit]);
    }

    async getPlayerDungeonStats(playerId) {
        const stats = await this.db.get(`
            SELECT 
                COUNT(*) as total_clears,
                COUNT(DISTINCT dungeon_id) as unique_dungeons,
                MAX(score) as best_score,
                AVG(score) as avg_score
            FROM player_dungeon_clears
            WHERE player_id = ?
        `, [playerId]);

        const recentClears = await this.db.all(`
            SELECT 
                d.name,
                pdc.score,
                pdc.clear_time
            FROM player_dungeon_clears pdc
            JOIN dungeons d ON pdc.dungeon_id = d.id
            WHERE pdc.player_id = ?
            ORDER BY pdc.clear_time DESC
            LIMIT 5
        `, [playerId]);

        return { stats, recentClears };
    }

    createDungeonListEmbed(dungeons, type = null) {
        const embed = new EmbedBuilder()
            .setColor(0x9932CC)
            .setTitle('🏰 던전 목록')
            .setTimestamp();

        if (type) {
            const typeNames = {
                'daily': '📅 일상 던전',
                'adventure': '⚔️ 모험 던전',
                'special': '✨ 특별 던전'
            };
            embed.setTitle(typeNames[type] || '🏰 던전 목록');
        }

        if (dungeons.length === 0) {
            embed.setDescription('사용 가능한 던전이 없습니다.');
            return embed;
        }

        const difficultyStars = (difficulty) => '⭐'.repeat(Math.min(difficulty, 5));

        for (const dungeon of dungeons) {
            const requiredStats = JSON.parse(dungeon.required_stats);
            const statsText = Object.entries(requiredStats)
                .map(([stat, value]) => `${stat}: ${value}`)
                .join(', ');

            embed.addFields({
                name: `${difficultyStars(dungeon.difficulty)} ${dungeon.name} (ID: ${dungeon.id})`,
                value: [
                    `📝 ${dungeon.description}`,
                    `📊 필요 레벨: ${dungeon.required_level}`,
                    `🎯 필요 스탯: ${statsText}`,
                    `💀 난이도: ${dungeon.difficulty}`
                ].join('\n'),
                inline: false
            });
        }

        embed.setFooter({ text: '던전에 입장하려면 "/던전 입장 던전id:{ID}"를 사용하세요' });
        return embed;
    }

    // === 던전 상호작용 시스템 ===
    async startDungeonExploration(playerId, dungeonId) {
        const player = await this.db.getPlayer(playerId);
        if (!player) {
            return { success: false, message: '플레이어를 찾을 수 없습니다.' };
        }

        const dungeon = this.dungeons.find(d => d.id === dungeonId);
        if (!dungeon) {
            return { success: false, message: '존재하지 않는 던전입니다.' };
        }

        // 레벨 및 스탯 체크
        if (player.level < dungeon.required_level) {
            return { success: false, message: `레벨 ${dungeon.required_level} 이상이 필요합니다.` };
        }

        const requiredStats = JSON.parse(dungeon.required_stats);
        for (const [stat, value] of Object.entries(requiredStats)) {
            if (player[stat] < value) {
                return { success: false, message: `${stat}이(가) ${value} 이상 필요합니다.` };
            }
        }

        // 던전 세션 생성
        const sessionId = `dungeon_${playerId}_${Date.now()}`;
        const dungeonSession = {
            sessionId: sessionId,
            playerId: playerId,
            dungeon: dungeon,
            currentStage: 1,
            totalStages: 5,
            playerHP: 100,
            playerMP: 50,
            defeated_monsters: 0,
            treasure_found: 0,
            status: 'active',
            startTime: Date.now()
        };

        // 활성 세션 저장
        if (!this.activeSessions) {
            this.activeSessions = new Map();
        }
        this.activeSessions.set(sessionId, dungeonSession);

        // 첫 번째 조우 생성
        const firstEncounter = await this.generateEncounter(dungeonSession);
        
        return {
            success: true,
            message: `${dungeon.name} 탐험을 시작합니다!`,
            sessionId: sessionId,
            encounter: firstEncounter
        };
    }

    async handleDungeonAction(sessionId, action, options = {}) {
        const session = this.activeSessions?.get(sessionId);
        if (!session) {
            return { success: false, message: '던전 세션을 찾을 수 없습니다.' };
        }

        switch (action) {
            case 'fight':
                return await this.handleCombat(session, options);
            case 'flee':
                return await this.handleFlee(session);
            case 'use_item':
                return await this.handleItemUse(session, options.itemId, options.quantity || 1);
            case 'use_skill':
                return await this.handleSkillUse(session, options.skillId);
            case 'continue':
                return await this.continueExploration(session);
            default:
                return { success: false, message: '알 수 없는 행동입니다.' };
        }
    }

    async generateEncounter(session) {
        const random = Math.random();
        
        if (random < 0.7) {
            // 70% 몬스터 조우
            const monster = await this.getRandomMonster(session.dungeon.difficulty);
            session.currentEncounter = {
                type: 'monster',
                monster: monster,
                description: `${monster.name}이(가) 나타났습니다!`
            };
            
            return {
                type: 'monster',
                monster: monster,
                description: `${monster.name}이(가) 나타났습니다!`,
                options: [
                    { id: 'fight', label: '⚔️ 전투', description: '몬스터와 싸웁니다' },
                    { id: 'flee', label: '🏃 도망', description: '던전에서 도망칩니다' },
                    { id: 'use_item', label: '🎒 아이템 사용', description: '아이템을 사용합니다' },
                    { id: 'use_skill', label: '✨ 스킬 사용', description: '스킬을 사용합니다' }
                ]
            };
        } else if (random < 0.85) {
            // 15% 보물 상자
            const treasure = this.generateTreasure(session.dungeon.difficulty);
            session.treasure_found++;
            
            // 보상 즉시 지급
            await this.giveRewards(session.playerId, treasure);
            
            return {
                type: 'treasure',
                treasure: treasure,
                description: '✨ 보물 상자를 발견했습니다!',
                options: [
                    { id: 'continue', label: '➡️ 계속 탐험', description: '다음 구역으로 이동합니다' }
                ]
            };
        } else {
            // 15% 휴식 지점
            session.playerHP = Math.min(100, session.playerHP + 25);
            session.playerMP = Math.min(100, session.playerMP + 20);
            
            return {
                type: 'rest',
                description: '🛡️ 안전한 휴식 지점을 발견했습니다!\n체력 +25, 마나 +20 회복',
                hp_restored: 25,
                mp_restored: 20,
                options: [
                    { id: 'continue', label: '➡️ 계속 탐험', description: '다음 구역으로 이동합니다' }
                ]
            };
        }
    }

    async handleCombat(session, options) {
        if (!session.currentEncounter || session.currentEncounter.type !== 'monster') {
            return { success: false, message: '전투할 몬스터가 없습니다.' };
        }

        const player = await this.db.getPlayer(session.playerId);
        const monster = session.currentEncounter.monster;
        
        // 플레이어 공격
        const playerDamage = this.calculatePlayerDamage(player, monster, options.skillId);
        monster.current_hp = (monster.current_hp || monster.hp) - playerDamage;

        let combatResult = {
            success: true,
            playerAction: `${monster.name}에게 ${playerDamage}의 피해를 입혔습니다!`,
            playerDamage: playerDamage,
            monsterHP: monster.current_hp,
            playerHP: session.playerHP
        };

        // 몬스터 처치 확인
        if (monster.current_hp <= 0) {
            session.defeated_monsters++;
            const rewards = monster.rewards || { money: 100, exp: 50 };
            
            await this.giveRewards(session.playerId, rewards);
            
            combatResult.victory = true;
            combatResult.message = `${monster.name}을(를) 처치했습니다!`;
            combatResult.rewards = rewards;

            // 스테이지 진행
            if (session.currentStage < session.totalStages) {
                session.currentStage++;
                const nextEncounter = await this.generateEncounter(session);
                combatResult.nextEncounter = nextEncounter;
            } else {
                // 던전 완료
                combatResult.dungeonComplete = true;
                const finalRewards = await this.calculateFinalRewards(session);
                combatResult.finalRewards = finalRewards;
                this.activeSessions.delete(session.sessionId);
            }
        } else {
            // 몬스터 반격
            const monsterDamage = this.calculateMonsterDamage(monster, player);
            session.playerHP -= monsterDamage;
            
            combatResult.monsterAction = `${monster.name}이(가) ${monsterDamage}의 피해를 입혔습니다!`;
            combatResult.monsterDamage = monsterDamage;
            combatResult.playerHP = session.playerHP;

            if (session.playerHP <= 0) {
                combatResult.defeat = true;
                combatResult.message = '체력이 모두 소진되었습니다. 던전에서 탈출합니다.';
                this.activeSessions.delete(session.sessionId);
            } else {
                combatResult.options = [
                    { id: 'fight', label: '⚔️ 계속 전투', description: '계속 싸웁니다' },
                    { id: 'flee', label: '🏃 도망', description: '던전에서 도망칩니다' },
                    { id: 'use_item', label: '🎒 아이템 사용', description: '아이템을 사용합니다' }
                ];
            }
        }

        // 세션 업데이트
        this.activeSessions.set(session.sessionId, session);
        return combatResult;
    }

    async handleFlee(session) {
        const fleeChance = 0.8; // 80% 도망 성공률
        
        if (Math.random() < fleeChance) {
            const partialRewards = await this.calculatePartialRewards(session);
            this.activeSessions.delete(session.sessionId);
            
            return {
                success: true,
                message: '던전에서 성공적으로 도망쳤습니다.',
                fled: true,
                partialRewards: partialRewards
            };
        } else {
            // 도망 실패
            if (session.currentEncounter && session.currentEncounter.type === 'monster') {
                const monster = session.currentEncounter.monster;
                const player = await this.db.getPlayer(session.playerId);
                const damage = this.calculateMonsterDamage(monster, player);
                
                session.playerHP -= damage;
                
                if (session.playerHP <= 0) {
                    this.activeSessions.delete(session.sessionId);
                    return {
                        success: false,
                        message: `도망에 실패했습니다! ${monster.name}의 공격으로 쓰러졌습니다.`,
                        defeat: true
                    };
                }
            }

            this.activeSessions.set(session.sessionId, session);
            return {
                success: false,
                message: '도망에 실패했습니다! 계속 전투해야 합니다.',
                playerHP: session.playerHP,
                options: [
                    { id: 'fight', label: '⚔️ 전투', description: '몬스터와 싸웁니다' },
                    { id: 'use_item', label: '🎒 아이템 사용', description: '아이템을 사용합니다' }
                ]
            };
        }
    }

    async handleItemUse(session, itemId, quantity = 1) {
        // 플레이어 인벤토리에서 아이템 확인 (실제 구현 시 연동 필요)
        const itemEffects = {
            'healing_potion': { type: 'heal', amount: 30, name: '치유 물약' },
            'mana_potion': { type: 'mana', amount: 25, name: '마나 물약' },
            'strength_potion': { type: 'buff', stat: 'damage', amount: 1.5, duration: 3, name: '힘의 물약' },
            'escape_scroll': { type: 'escape', name: '탈출 주문서' },
            'health_food': { type: 'heal', amount: 15, name: '건강식품' }
        };

        const item = itemEffects[itemId];
        if (!item) {
            return { success: false, message: '사용할 수 없는 아이템입니다.' };
        }

        let effect_message = '';
        
        switch (item.type) {
            case 'heal':
                const healAmount = item.amount;
                const oldHP = session.playerHP;
                session.playerHP = Math.min(100, session.playerHP + healAmount);
                const actualHeal = session.playerHP - oldHP;
                effect_message = `${item.name}을(를) 사용하여 체력을 ${actualHeal} 회복했습니다!`;
                break;
                
            case 'mana':
                const manaAmount = item.amount;
                const oldMP = session.playerMP;
                session.playerMP = Math.min(100, session.playerMP + manaAmount);
                const actualMana = session.playerMP - oldMP;
                effect_message = `${item.name}을(를) 사용하여 마나를 ${actualMana} 회복했습니다!`;
                break;
                
            case 'buff':
                session.damage_buff = item.amount;
                session.buff_turns = item.duration;
                effect_message = `${item.name}을(를) 사용하여 ${item.duration}턴 동안 공격력이 증가합니다!`;
                break;
                
            case 'escape':
                const partialRewards = await this.calculatePartialRewards(session);
                this.activeSessions.delete(session.sessionId);
                return {
                    success: true,
                    message: `${item.name}을(를) 사용하여 던전에서 즉시 탈출했습니다!`,
                    escaped: true,
                    partialRewards: partialRewards
                };
        }

        // 아이템 소모 처리 (실제 구현 시 인벤토리 시스템과 연동)
        // await this.removeItemFromInventory(session.playerId, itemId, quantity);
        
        this.activeSessions.set(session.sessionId, session);
        
        return {
            success: true,
            message: effect_message,
            playerHP: session.playerHP,
            playerMP: session.playerMP,
            options: [
                { id: 'fight', label: '⚔️ 전투', description: '몬스터와 싸웁니다' },
                { id: 'use_item', label: '🎒 아이템 사용', description: '다른 아이템을 사용합니다' }
            ]
        };
    }

    async continueExploration(session) {
        if (session.currentStage >= session.totalStages) {
            // 던전 완료
            const finalRewards = await this.calculateFinalRewards(session);
            this.activeSessions.delete(session.sessionId);
            
            return {
                success: true,
                dungeonComplete: true,
                message: '던전을 완전히 탐험했습니다!',
                finalRewards: finalRewards
            };
        }

        session.currentStage++;
        const nextEncounter = await this.generateEncounter(session);
        this.activeSessions.set(session.sessionId, session);
        
        return {
            success: true,
            message: `${session.currentStage}단계로 이동합니다...`,
            encounter: nextEncounter
        };
    }

    async getRandomMonster(difficulty) {
        // 간단한 몬스터 생성 (실제로는 CombatSystem과 연동)
        const monsters = [
            { name: '고블린', hp: 30 + difficulty * 10, attack: 10 + difficulty * 3, defense: 2 + difficulty, rewards: { money: 100 + difficulty * 50, exp: 25 + difficulty * 15 }},
            { name: '오크', hp: 50 + difficulty * 15, attack: 15 + difficulty * 5, defense: 5 + difficulty * 2, rewards: { money: 150 + difficulty * 75, exp: 40 + difficulty * 20 }},
            { name: '스켈레톤', hp: 40 + difficulty * 12, attack: 12 + difficulty * 4, defense: 3 + difficulty, rewards: { money: 120 + difficulty * 60, exp: 30 + difficulty * 18 }}
        ];
        
        const monster = monsters[Math.floor(Math.random() * monsters.length)];
        monster.current_hp = monster.hp;
        return monster;
    }

    calculatePlayerDamage(player, monster, skillId = null) {
        let baseDamage = (player.strength || 20) + Math.floor((player.level || 1) * 2);
        
        // 스킬 사용 시 보정
        if (skillId) {
            baseDamage *= 1.5;
        }
        
        // 몬스터 방어력 적용
        const finalDamage = Math.max(1, baseDamage - (monster.defense || 0));
        
        // 랜덤 요소 추가
        return Math.floor(finalDamage * (0.9 + Math.random() * 0.2));
    }

    calculateMonsterDamage(monster, player) {
        const baseDamage = monster.attack || 10;
        const playerDefense = Math.floor((player.health || 50) / 10) + Math.floor((player.level || 1) / 3);
        const finalDamage = Math.max(1, baseDamage - playerDefense);
        
        return Math.floor(finalDamage * (0.8 + Math.random() * 0.4));
    }

    generateTreasure(difficulty) {
        const treasures = [
            { money: 200 + difficulty * 100, items: ['healing_potion'] },
            { money: 150 + difficulty * 75, items: ['mana_potion'] },
            { money: 300 + difficulty * 150, exp: 50 + difficulty * 25 },
            { items: ['strength_potion', 'healing_potion'] },
            { money: 500 + difficulty * 200, items: ['rare_gem'] }
        ];
        
        return treasures[Math.floor(Math.random() * treasures.length)];
    }

    async giveRewards(playerId, rewards) {
        if (rewards.money) {
            await this.db.updatePlayerMoney(playerId, rewards.money);
        }
        
        if (rewards.exp) {
            await this.db.updatePlayerExperience(playerId, rewards.exp);
        }
        
        if (rewards.items) {
            for (const item of rewards.items) {
                // 아이템 지급 로직 (실제 구현 시 인벤토리 시스템과 연동)
                // await this.addItemToInventory(playerId, item);
            }
        }
    }

    async calculateFinalRewards(session) {
        const baseRewards = JSON.parse(session.dungeon.rewards);
        const completionBonus = {
            money: Math.floor(baseRewards.money * 1.3),
            exp: Math.floor(baseRewards.experience * 1.2),
            bonus_message: '던전 완주 보너스!'
        };
        
        await this.giveRewards(session.playerId, completionBonus);
        return completionBonus;
    }

    async calculatePartialRewards(session) {
        const progress = session.currentStage / session.totalStages;
        const baseRewards = JSON.parse(session.dungeon.rewards);
        
        const partialRewards = {
            money: Math.floor(baseRewards.money * progress * 0.4),
            exp: Math.floor(baseRewards.experience * progress * 0.4)
        };
        
        if (partialRewards.money > 0 || partialRewards.exp > 0) {
            await this.giveRewards(session.playerId, partialRewards);
        }
        
        return partialRewards;
    }

    getDungeonSession(sessionId) {
        return this.activeSessions?.get(sessionId);
    }

    createBattleResultEmbed(result, dungeonName) {
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#00ff00' : '#ff0000')
            .setTitle(result.success ? '🎉 던전 클리어!' : '💀 던전 실패')
            .setDescription(result.message);

        // 전투 로그 추가
        if (result.battleLog) {
            const battleLogText = result.battleLog.join('\n');
            embed.addFields({
                name: '⚔️ 전투 기록',
                value: battleLogText.length > 1024 ? battleLogText.substring(0, 1020) + '...' : battleLogText,
                inline: false
            });
        }

        // 보상 정보 추가
        if (result.rewards) {
            const rewardTexts = [];
            
            if (result.rewards.money) rewardTexts.push(`💰 ${result.rewards.money.toLocaleString()}원`);
            if (result.rewards.experience) rewardTexts.push(`⭐ ${result.rewards.experience} 경험치`);
            
            if (result.rewards.stats) {
                const statTexts = Object.entries(result.rewards.stats)
                    .map(([stat, value]) => `📊 ${stat} +${value}`)
                    .join('\n');
                rewardTexts.push(statTexts);
            }
            
            if (rewardTexts.length > 0) {
                embed.addFields({
                    name: '🎁 획득 보상',
                    value: rewardTexts.join('\n'),
                    inline: false
                });
            }
        }

        return embed;
    }
}

module.exports = DungeonSystem;

