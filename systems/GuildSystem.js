const { EmbedBuilder } = require('discord.js');

class GuildSystem {
    constructor(database) {
        this.db = database;
        
        this.guildRanks = [
            { id: 'member', name: '일반 멤버', permissions: ['chat', 'participate_events'] },
            { id: 'officer', name: '임원', permissions: ['chat', 'participate_events', 'invite_members', 'kick_members', 'manage_events'] },
            { id: 'leader', name: '길드장', permissions: ['all'] }
        ];

        this.guildLevels = [
            { level: 1, required_exp: 0, max_members: 10, perks: '기본 길드' },
            { level: 2, required_exp: 1000, max_members: 15, perks: '경험치 보너스 +5%' },
            { level: 3, required_exp: 3000, max_members: 20, perks: '돈 보너스 +5%' },
            { level: 4, required_exp: 6000, max_members: 25, perks: '전투 보너스 +10%' },
            { level: 5, required_exp: 10000, max_members: 30, perks: '채굴 보너스 +15%' },
            { level: 6, required_exp: 15000, max_members: 35, perks: '제작 성공률 +10%' },
            { level: 7, required_exp: 21000, max_members: 40, perks: '상점 할인 10%' },
            { level: 8, required_exp: 28000, max_members: 45, perks: '던전 보상 +20%' },
            { level: 9, required_exp: 36000, max_members: 50, perks: '특별 길드 던전 접근' },
            { level: 10, required_exp: 45000, max_members: 60, perks: '모든 보너스 최대화' }
        ];

        this.guildBuildings = [
            { id: 'warehouse', name: '창고', description: '길드 아이템 저장소', cost: 100000, max_level: 5 },
            { id: 'training_ground', name: '훈련장', description: '멤버 능력치 훈련', cost: 200000, max_level: 5 },
            { id: 'workshop', name: '작업장', description: '길드 전용 제작 시설', cost: 300000, max_level: 5 },
            { id: 'laboratory', name: '연구소', description: '길드 기술 연구', cost: 500000, max_level: 5 },
            { id: 'shrine', name: '신전', description: '길드 축복 및 버프', cost: 800000, max_level: 3 },
            { id: 'fortress', name: '요새', description: '길드 전쟁 방어력', cost: 1000000, max_level: 3 }
        ];
    }

    async initializeGuildSystem() {
        // 길드 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS guilds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                leader_id TEXT NOT NULL,
                level INTEGER DEFAULT 1,
                experience INTEGER DEFAULT 0,
                treasury REAL DEFAULT 0,
                member_count INTEGER DEFAULT 1,
                max_members INTEGER DEFAULT 10,
                created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                activity_score INTEGER DEFAULT 0,
                guild_type TEXT DEFAULT 'general', -- 'general', 'combat', 'trading', 'crafting'
                announcement TEXT,
                FOREIGN KEY (leader_id) REFERENCES players(id)
            )
        `);

        // 길드 멤버 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS guild_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id INTEGER NOT NULL,
                player_id TEXT NOT NULL,
                rank TEXT DEFAULT 'member',
                joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                contribution_points INTEGER DEFAULT 0,
                last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
                weekly_contribution INTEGER DEFAULT 0,
                FOREIGN KEY (guild_id) REFERENCES guilds(id),
                FOREIGN KEY (player_id) REFERENCES players(id),
                UNIQUE(player_id)
            )
        `);

        // 길드 건물 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS guild_buildings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id INTEGER NOT NULL,
                building_type TEXT NOT NULL,
                building_level INTEGER DEFAULT 1,
                upgrade_cost REAL,
                last_upgraded DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (guild_id) REFERENCES guilds(id),
                UNIQUE(guild_id, building_type)
            )
        `);

        // 길드 이벤트 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS guild_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id INTEGER NOT NULL,
                event_type TEXT NOT NULL, -- 'raid', 'quest', 'competition', 'training'
                title TEXT NOT NULL,
                description TEXT,
                start_time DATETIME,
                end_time DATETIME,
                max_participants INTEGER,
                rewards TEXT,
                status TEXT DEFAULT 'scheduled', -- 'scheduled', 'active', 'completed', 'cancelled'
                created_by TEXT NOT NULL,
                created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (guild_id) REFERENCES guilds(id),
                FOREIGN KEY (created_by) REFERENCES players(id)
            )
        `);

        // 길드 이벤트 참가자 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS guild_event_participants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                player_id TEXT NOT NULL,
                participation_score INTEGER DEFAULT 0,
                rewards_claimed BOOLEAN DEFAULT FALSE,
                joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (event_id) REFERENCES guild_events(id),
                FOREIGN KEY (player_id) REFERENCES players(id),
                UNIQUE(event_id, player_id)
            )
        `);

        // 길드 로그 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS guild_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id INTEGER NOT NULL,
                action_type TEXT NOT NULL, -- 'join', 'leave', 'promote', 'demote', 'deposit', 'withdraw', 'upgrade'
                actor_id TEXT,
                target_id TEXT,
                description TEXT NOT NULL,
                amount REAL DEFAULT 0,
                log_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (guild_id) REFERENCES guilds(id),
                FOREIGN KEY (actor_id) REFERENCES players(id),
                FOREIGN KEY (target_id) REFERENCES players(id)
            )
        `);

        // 길드 상점 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS guild_shop_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_name TEXT NOT NULL,
                item_type TEXT NOT NULL,
                cost_type TEXT NOT NULL, -- 'contribution', 'treasury'
                cost_amount INTEGER NOT NULL,
                guild_level_requirement INTEGER DEFAULT 1,
                description TEXT,
                stock INTEGER DEFAULT -1, -- -1은 무제한
                weekly_limit INTEGER DEFAULT -1
            )
        `);

        // 길드 상점 구매 기록 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS guild_shop_purchases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                item_id INTEGER NOT NULL,
                quantity INTEGER DEFAULT 1,
                cost_paid INTEGER NOT NULL,
                purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                week_year TEXT, -- 'YYYY-WW' 형식으로 주차 저장
                FOREIGN KEY (player_id) REFERENCES players(id),
                FOREIGN KEY (item_id) REFERENCES guild_shop_items(id)
            )
        `);

        // 길드 전쟁 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS guild_wars (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                attacker_guild_id INTEGER NOT NULL,
                defender_guild_id INTEGER NOT NULL,
                war_status TEXT DEFAULT 'declared', -- 'declared', 'active', 'ended'
                start_time DATETIME,
                end_time DATETIME,
                attacker_score INTEGER DEFAULT 0,
                defender_score INTEGER DEFAULT 0,
                winner_guild_id INTEGER,
                war_type TEXT DEFAULT 'territorial', -- 'territorial', 'honor', 'resource'
                stakes TEXT, -- JSON 형태로 전쟁 조건 저장
                FOREIGN KEY (attacker_guild_id) REFERENCES guilds(id),
                FOREIGN KEY (defender_guild_id) REFERENCES guilds(id)
            )
        `);

        // 기본 길드 상점 아이템 추가
        await this.seedGuildShop();

        console.log('길드 시스템 초기화 완료');
    }

    async seedGuildShop() {
        const shopItems = [
            { name: '경험치 부스터', type: 'boost', cost_type: 'contribution', cost: 100, description: '1시간 동안 경험치 +50%' },
            { name: '돈 부스터', type: 'boost', cost_type: 'contribution', cost: 150, description: '1시간 동안 획득 돈 +50%' },
            { name: '희귀 보석', type: 'item', cost_type: 'contribution', cost: 500, level_req: 3, description: '희귀한 보석' },
            { name: '길드 깃발', type: 'decoration', cost_type: 'treasury', cost: 100000, level_req: 2, description: '길드 위상을 높이는 깃발' },
            { name: '전설의 재료', type: 'material', cost_type: 'contribution', cost: 1000, level_req: 5, description: '전설 장비 제작용 재료' },
            { name: '길드 스킬북', type: 'skill', cost_type: 'contribution', cost: 2000, level_req: 7, description: '특별한 길드 전용 스킬' }
        ];

        for (const item of shopItems) {
            await this.db.run(`
                INSERT OR IGNORE INTO guild_shop_items 
                (item_name, item_type, cost_type, cost_amount, guild_level_requirement, description)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [item.name, item.type, item.cost_type, item.cost, item.level_req || 1, item.description]);
        }
    }

    async createGuild(leaderId, guildName, description = '', guildType = 'general') {
        try {
            // 플레이어가 이미 길드에 속해있는지 확인
            const existingMember = await this.db.get(`
                SELECT * FROM guild_members WHERE player_id = ?
            `, [leaderId]);

            if (existingMember) {
                return { success: false, message: '이미 길드에 속해 있습니다.' };
            }

            // 길드명 중복 확인
            const existingGuild = await this.db.get(`
                SELECT * FROM guilds WHERE name = ?
            `, [guildName]);

            if (existingGuild) {
                return { success: false, message: '이미 존재하는 길드명입니다.' };
            }

            // 플레이어 정보 확인
            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [leaderId]);
            const guildCreationCost = 1000000; // 100만원

            if (player.money < guildCreationCost) {
                return { 
                    success: false, 
                    message: `길드 생성 비용이 부족합니다. 필요: ${guildCreationCost.toLocaleString()}원` 
                };
            }

            // 길드 생성
            const guildResult = await this.db.run(`
                INSERT INTO guilds (name, description, leader_id, guild_type)
                VALUES (?, ?, ?, ?)
            `, [guildName, description, leaderId, guildType]);

            const guildId = guildResult.lastID;

            // 길드장을 멤버로 추가
            await this.db.run(`
                INSERT INTO guild_members (guild_id, player_id, rank)
                VALUES (?, ?, 'leader')
            `, [guildId, leaderId]);

            // 길드 생성 비용 차감
            await this.db.run(`
                UPDATE players SET money = money - ? WHERE id = ?
            `, [guildCreationCost, leaderId]);

            // 기본 건물들 추가
            const basicBuildings = ['warehouse', 'training_ground'];
            for (const building of basicBuildings) {
                await this.db.run(`
                    INSERT INTO guild_buildings (guild_id, building_type)
                    VALUES (?, ?)
                `, [guildId, building]);
            }

            // 길드 로그
            await this.addGuildLog(guildId, 'create', leaderId, null, '길드가 생성되었습니다');

            return {
                success: true,
                message: `길드 '${guildName}'이(가) 성공적으로 생성되었습니다!`,
                guildId: guildId,
                cost: guildCreationCost
            };

        } catch (error) {
            console.error('길드 생성 오류:', error);
            return { success: false, message: '길드 생성 중 오류가 발생했습니다.' };
        }
    }

    async joinGuild(playerId, guildId) {
        try {
            // 플레이어가 이미 길드에 속해있는지 확인
            const existingMember = await this.db.get(`
                SELECT * FROM guild_members WHERE player_id = ?
            `, [playerId]);

            if (existingMember) {
                return { success: false, message: '이미 길드에 속해 있습니다.' };
            }

            // 길드 정보 확인
            const guild = await this.db.get('SELECT * FROM guilds WHERE id = ?', [guildId]);
            if (!guild) {
                return { success: false, message: '존재하지 않는 길드입니다.' };
            }

            // 길드 정원 확인
            if (guild.member_count >= guild.max_members) {
                return { success: false, message: '길드 정원이 가득찼습니다.' };
            }

            // 길드 가입
            await this.db.run(`
                INSERT INTO guild_members (guild_id, player_id)
                VALUES (?, ?)
            `, [guildId, playerId]);

            // 길드 멤버 수 업데이트
            await this.db.run(`
                UPDATE guilds SET member_count = member_count + 1 WHERE id = ?
            `, [guildId]);

            // 길드 로그
            await this.addGuildLog(guildId, 'join', playerId, null, '새로운 멤버가 가입했습니다');

            return {
                success: true,
                message: `길드 '${guild.name}'에 가입했습니다!`,
                guild: guild
            };

        } catch (error) {
            console.error('길드 가입 오류:', error);
            return { success: false, message: '길드 가입 중 오류가 발생했습니다.' };
        }
    }

    async leaveGuild(playerId) {
        try {
            // 플레이어의 길드 멤버십 확인
            const membership = await this.db.get(`
                SELECT gm.*, g.name as guild_name, g.leader_id
                FROM guild_members gm
                JOIN guilds g ON gm.guild_id = g.id
                WHERE gm.player_id = ?
            `, [playerId]);

            if (!membership) {
                return { success: false, message: '길드에 속해 있지 않습니다.' };
            }

            // 길드장인 경우 특별 처리
            if (membership.rank === 'leader') {
                const memberCount = await this.db.get(`
                    SELECT COUNT(*) as count FROM guild_members WHERE guild_id = ?
                `, [membership.guild_id]);

                if (memberCount.count > 1) {
                    return { 
                        success: false, 
                        message: '길드장은 길드에 다른 멤버가 있을 때 탈퇴할 수 없습니다. 먼저 길드장을 넘기거나 길드를 해체하세요.' 
                    };
                } else {
                    // 길드 해체
                    return await this.disbandGuild(playerId, membership.guild_id);
                }
            }

            // 길드 탈퇴
            await this.db.run(`
                DELETE FROM guild_members WHERE player_id = ?
            `, [playerId]);

            // 길드 멤버 수 업데이트
            await this.db.run(`
                UPDATE guilds SET member_count = member_count - 1 WHERE id = ?
            `, [membership.guild_id]);

            // 길드 로그
            await this.addGuildLog(membership.guild_id, 'leave', playerId, null, '멤버가 길드를 떠났습니다');

            return {
                success: true,
                message: `길드 '${membership.guild_name}'에서 탈퇴했습니다.`
            };

        } catch (error) {
            console.error('길드 탈퇴 오류:', error);
            return { success: false, message: '길드 탈퇴 중 오류가 발생했습니다.' };
        }
    }

    async promoteMembe(promoterId, targetPlayerId, newRank) {
        try {
            // 승진시키는 사람의 권한 확인
            const promoter = await this.db.get(`
                SELECT * FROM guild_members WHERE player_id = ?
            `, [promoterId]);

            if (!promoter || !['leader', 'officer'].includes(promoter.rank)) {
                return { success: false, message: '승진시킬 권한이 없습니다.' };
            }

            // 대상 멤버 확인
            const target = await this.db.get(`
                SELECT gm.*, p.username
                FROM guild_members gm
                JOIN players p ON gm.player_id = p.id
                WHERE gm.player_id = ? AND gm.guild_id = ?
            `, [targetPlayerId, promoter.guild_id]);

            if (!target) {
                return { success: false, message: '같은 길드의 멤버가 아닙니다.' };
            }

            // 권한 확인 (길드장만 임원 임명 가능)
            if (newRank === 'officer' && promoter.rank !== 'leader') {
                return { success: false, message: '임원 임명은 길드장만 가능합니다.' };
            }

            if (newRank === 'leader') {
                return { success: false, message: '길드장 이양은 별도 명령을 사용해주세요.' };
            }

            // 승진 실행
            await this.db.run(`
                UPDATE guild_members SET rank = ? WHERE player_id = ?
            `, [newRank, targetPlayerId]);

            // 길드 로그
            await this.addGuildLog(promoter.guild_id, 'promote', promoterId, targetPlayerId, 
                `${target.username}이(가) ${newRank}로 승진했습니다`);

            return {
                success: true,
                message: `${target.username}을(를) ${newRank}로 승진시켰습니다.`
            };

        } catch (error) {
            console.error('승진 오류:', error);
            return { success: false, message: '승진 처리 중 오류가 발생했습니다.' };
        }
    }

    async contributeToGuild(playerId, amount) {
        try {
            const membership = await this.db.get(`
                SELECT gm.*, g.name as guild_name
                FROM guild_members gm
                JOIN guilds g ON gm.guild_id = g.id
                WHERE gm.player_id = ?
            `, [playerId]);

            if (!membership) {
                return { success: false, message: '길드에 속해 있지 않습니다.' };
            }

            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [playerId]);
            if (player.money < amount) {
                return { success: false, message: '돈이 부족합니다.' };
            }

            // 기여도 계산 (돈의 1/100이 기여도가 됨)
            const contributionPoints = Math.floor(amount / 100);

            // 돈 차감 및 길드 금고에 추가
            await this.db.run(`
                UPDATE players SET money = money - ? WHERE id = ?
            `, [amount, playerId]);

            await this.db.run(`
                UPDATE guilds SET treasury = treasury + ? WHERE id = ?
            `, [amount, membership.guild_id]);

            // 개인 기여도 추가
            await this.db.run(`
                UPDATE guild_members 
                SET contribution_points = contribution_points + ?,
                    weekly_contribution = weekly_contribution + ?
                WHERE player_id = ?
            `, [contributionPoints, contributionPoints, playerId]);

            // 길드 경험치 추가
            await this.addGuildExperience(membership.guild_id, contributionPoints);

            // 길드 로그
            await this.addGuildLog(membership.guild_id, 'deposit', playerId, null, 
                `${amount.toLocaleString()}원을 기부했습니다 (+${contributionPoints} 기여도)`);

            return {
                success: true,
                message: `${amount.toLocaleString()}원을 기부하여 ${contributionPoints} 기여도를 획득했습니다!`
            };

        } catch (error) {
            console.error('길드 기여 오류:', error);
            return { success: false, message: '길드 기여 중 오류가 발생했습니다.' };
        }
    }

    async addGuildExperience(guildId, expAmount) {
        const guild = await this.db.get('SELECT * FROM guilds WHERE id = ?', [guildId]);
        if (!guild) return;

        const newExp = guild.experience + expAmount;
        const currentLevelInfo = this.guildLevels.find(l => l.level === guild.level);
        const nextLevelInfo = this.guildLevels.find(l => l.level === guild.level + 1);

        let newLevel = guild.level;
        let maxMembers = currentLevelInfo?.max_members || 10;

        // 레벨업 확인
        if (nextLevelInfo && newExp >= nextLevelInfo.required_exp) {
            newLevel = nextLevelInfo.level;
            maxMembers = nextLevelInfo.max_members;
            
            // 레벨업 로그
            await this.addGuildLog(guildId, 'levelup', null, null, 
                `길드가 레벨 ${newLevel}로 승급했습니다! ${nextLevelInfo.perks}`);
        }

        await this.db.run(`
            UPDATE guilds 
            SET experience = ?, level = ?, max_members = ?
            WHERE id = ?
        `, [newExp, newLevel, maxMembers, guildId]);
    }

    async addGuildLog(guildId, actionType, actorId, targetId, description, amount = 0) {
        await this.db.run(`
            INSERT INTO guild_logs (guild_id, action_type, actor_id, target_id, description, amount)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [guildId, actionType, actorId, targetId, description, amount]);
    }

    async getGuildInfo(guildId) {
        const guild = await this.db.get('SELECT * FROM guilds WHERE id = ?', [guildId]);
        if (!guild) return null;

        const members = await this.db.all(`
            SELECT gm.*, p.username, p.level
            FROM guild_members gm
            JOIN players p ON gm.player_id = p.id
            WHERE gm.guild_id = ?
            ORDER BY 
                CASE gm.rank 
                    WHEN 'leader' THEN 1 
                    WHEN 'officer' THEN 2 
                    ELSE 3 
                END,
                gm.contribution_points DESC
        `, [guildId]);

        const buildings = await this.db.all(`
            SELECT * FROM guild_buildings WHERE guild_id = ?
        `, [guildId]);

        const recentLogs = await this.db.all(`
            SELECT gl.*, p1.username as actor_name, p2.username as target_name
            FROM guild_logs gl
            LEFT JOIN players p1 ON gl.actor_id = p1.id
            LEFT JOIN players p2 ON gl.target_id = p2.id
            WHERE gl.guild_id = ?
            ORDER BY gl.log_date DESC
            LIMIT 10
        `, [guildId]);

        return { guild, members, buildings, recentLogs };
    }

    async getPlayerGuild(playerId) {
        return await this.db.get(`
            SELECT gm.*, g.*
            FROM guild_members gm
            JOIN guilds g ON gm.guild_id = g.id
            WHERE gm.player_id = ?
        `, [playerId]);
    }

    async searchGuilds(namePattern = '', guildType = '') {
        let sql = 'SELECT * FROM guilds WHERE 1=1';
        const params = [];

        if (namePattern) {
            sql += ' AND name LIKE ?';
            params.push(`%${namePattern}%`);
        }

        if (guildType) {
            sql += ' AND guild_type = ?';
            params.push(guildType);
        }

        sql += ' ORDER BY level DESC, member_count DESC LIMIT 20';

        return await this.db.all(sql, params);
    }

    createGuildInfoEmbed(guildInfo) {
        const { guild, members, buildings } = guildInfo;
        const levelInfo = this.guildLevels.find(l => l.level === guild.level);
        
        const embed = new EmbedBuilder()
            .setColor('#6600cc')
            .setTitle(`🏰 ${guild.name} (Lv.${guild.level})`)
            .setDescription(guild.description || '길드 설명이 없습니다.')
            .setTimestamp();

        // 길드 기본 정보
        embed.addFields({
            name: '📊 길드 정보',
            value: [
                `👑 길드장: ${members.find(m => m.rank === 'leader')?.username || '없음'}`,
                `👥 멤버: ${guild.member_count}/${guild.max_members}`,
                `💰 금고: ${guild.treasury.toLocaleString()}원`,
                `⭐ 경험치: ${guild.experience}/${levelInfo?.required_exp || 0}`,
                `🎯 활동도: ${guild.activity_score}`,
                `🏷️ 타입: ${guild.guild_type}`
            ].join('\n'),
            inline: true
        });

        // 길드 특전
        if (levelInfo) {
            embed.addFields({
                name: '🎁 길드 특전',
                value: levelInfo.perks,
                inline: true
            });
        }

        // 주요 멤버들
        const topMembers = members.slice(0, 5).map(member => {
            const rankEmoji = {
                'leader': '👑',
                'officer': '⭐',
                'member': '👤'
            };
            return `${rankEmoji[member.rank]} ${member.username} (기여도: ${member.contribution_points})`;
        });

        embed.addFields({
            name: '👥 주요 멤버',
            value: topMembers.join('\n') || '멤버 없음',
            inline: false
        });

        // 건물 정보
        if (buildings.length > 0) {
            const buildingList = buildings.map(building => {
                const buildingInfo = this.guildBuildings.find(b => b.id === building.building_type);
                return `🏗️ ${buildingInfo?.name || building.building_type} Lv.${building.building_level}`;
            }).join('\n');

            embed.addFields({
                name: '🏗️ 길드 건물',
                value: buildingList,
                inline: false
            });
        }

        return embed;
    }

    createGuildListEmbed(guilds, title = '길드 목록') {
        const embed = new EmbedBuilder()
            .setColor('#9933ff')
            .setTitle(`🏰 ${title}`)
            .setTimestamp();

        if (guilds.length === 0) {
            embed.setDescription('검색된 길드가 없습니다.');
            return embed;
        }

        for (const guild of guilds) {
            const levelInfo = this.guildLevels.find(l => l.level === guild.level);
            
            embed.addFields({
                name: `🏰 ${guild.name} (Lv.${guild.level})`,
                value: [
                    `👥 멤버: ${guild.member_count}/${guild.max_members}`,
                    `🏷️ 타입: ${guild.guild_type}`,
                    `🎁 특전: ${levelInfo?.perks || '기본 길드'}`,
                    `📝 ${guild.description || '설명 없음'}`
                ].join('\n'),
                inline: true
            });
        }

        embed.setFooter({ text: '길드에 가입하려면 "/길드 가입 {길드ID}"를 사용하세요' });
        return embed;
    }
}

module.exports = GuildSystem;

