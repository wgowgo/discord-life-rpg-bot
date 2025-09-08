const { EmbedBuilder } = require('discord.js');

class ActivityTracker {
    constructor(database, config, client) {
        this.db = database;
        this.config = config;
        this.client = client;
        this.chatCooldowns = new Map(); // 채팅 쿨다운 관리
        this.voiceSessions = new Map(); // 음성 세션 관리
    }

    async handleMessage(message) {
        const userId = message.author.id;
        const channelId = message.channel.id;
        const now = Date.now();

        // 쿨다운 체크
        const lastReward = this.chatCooldowns.get(userId);
        if (lastReward && now - lastReward < this.config.game.chatRewards.cooldown) {
            return;
        }

        try {
            // 플레이어 존재 확인 및 생성
            let player = await this.db.get('SELECT * FROM players WHERE id = ?', [userId]);
            if (!player) {
                await this.createPlayer(userId, message.author.username);
                player = await this.db.get('SELECT * FROM players WHERE id = ?', [userId]);
            }

            // 채팅 활동 기록
            await this.recordChatActivity(userId, channelId);

            // 보상 지급
            const reward = await this.calculateChatReward();
            await this.giveReward(userId, reward);

            // 쿨다운 설정
            this.chatCooldowns.set(userId, now);

            // 업적 및 도전과제 체크
            await this.checkAchievements(userId, 'chat');
            await this.updateChallengeProgress(userId, 'chat_count', 1);

            // 보상 알림 (확률적으로) - 개인 메시지로 전송
            if (Math.random() < 0.1) { // 10% 확률로 알림
                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('🎉 채팅 보상!')
                    .setDescription(`${reward.money}원을 획득했습니다!\n경험치 +${reward.experience}`)
                    .setTimestamp();

                try {
                    await message.author.send({ embeds: [embed] });
                } catch (error) {
                    // DM을 보낼 수 없는 경우 (차단 등) 무시
                    console.log(`${message.author.username}에게 DM을 보낼 수 없습니다.`);
                }
            }

        } catch (error) {
            console.error('메시지 처리 오류:', error);
        }
    }

    async handleVoiceUpdate(oldState, newState) {
        const userId = newState.member?.id || oldState.member?.id;
        if (!userId) return;

        try {
            // 플레이어 존재 확인
            let player = await this.db.get('SELECT * FROM players WHERE id = ?', [userId]);
            if (!player) {
                await this.createPlayer(userId, newState.member?.user.username || oldState.member?.user.username);
            }

            // 음성 채널 입장
            if (!oldState.channelId && newState.channelId) {
                this.voiceSessions.set(userId, {
                    channelId: newState.channelId,
                    startTime: Date.now()
                });
            }
            // 음성 채널 퇴장 또는 이동
            else if (oldState.channelId && !newState.channelId) {
                await this.endVoiceSession(userId);
            }
            // 채널 이동
            else if (oldState.channelId !== newState.channelId && newState.channelId) {
                await this.endVoiceSession(userId);
                this.voiceSessions.set(userId, {
                    channelId: newState.channelId,
                    startTime: Date.now()
                });
            }

        } catch (error) {
            console.error('음성 상태 업데이트 오류:', error);
        }
    }

    async endVoiceSession(userId) {
        const session = this.voiceSessions.get(userId);
        if (!session) return;

        const duration = Math.floor((Date.now() - session.startTime) / 60000); // 분 단위
        if (duration < 1) return; // 1분 미만은 무시

        try {
            // 음성 활동 기록
            await this.recordVoiceActivity(userId, session.channelId, duration);

            // 보상 지급
            const reward = this.calculateVoiceReward(duration);
            await this.giveReward(userId, reward);

            // 업적 및 도전과제 체크
            await this.checkAchievements(userId, 'voice');
            await this.updateChallengeProgress(userId, 'voice_minutes', duration);

            // 음성채팅 보상 알림 (개인 메시지로 전송)
            if (reward.money > 0 || reward.experience > 0) {
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('🎤 음성채팅 보상!')
                    .setDescription(`${duration}분 동안 음성채팅을 하여 보상을 받았습니다!\n\n` +
                                   `💰 ${reward.money}원 획득\n` +
                                   `⭐ 경험치 +${reward.experience}`)
                    .setTimestamp();

                try {
                    const user = await this.getUserById(userId);
                    if (user) {
                        await user.send({ embeds: [embed] });
                    }
                } catch (error) {
                    console.log(`사용자 ${userId}에게 음성채팅 보상 DM을 보낼 수 없습니다.`);
                }
            }

            this.voiceSessions.delete(userId);

        } catch (error) {
            console.error('음성 세션 종료 오류:', error);
        }
    }

    async getUserById(userId) {
        try {
            if (this.client) {
                return await this.client.users.fetch(userId);
            }
            return null;
        } catch (error) {
            console.error('사용자 정보 가져오기 오류:', error);
            return null;
        }
    }

    async createPlayer(userId, username) {
        const startingStats = this.config.game.startingStats;
        
        // 플레이어 생성
        await this.db.run(`
            INSERT INTO players (id, username, money, level, experience)
            VALUES (?, ?, ?, 1, 0)
        `, [userId, username, this.config.game.startingMoney]);

        // 스탯 생성
        await this.db.run(`
            INSERT INTO player_stats (player_id, health, happiness, education, charm, luck, intelligence, strength, agility)
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
    }

    async recordChatActivity(userId, channelId) {
        const today = new Date().toISOString().split('T')[0];
        
        // 기존 기록 확인
        const existing = await this.db.get(`
            SELECT * FROM chat_activity 
            WHERE player_id = ? AND channel_id = ? AND date = ?
        `, [userId, channelId, today]);

        if (existing) {
            // 기존 기록 업데이트
            await this.db.run(`
                UPDATE chat_activity 
                SET message_count = message_count + 1, last_reward_time = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [existing.id]);
        } else {
            // 새 기록 생성
            await this.db.run(`
                INSERT INTO chat_activity (player_id, channel_id, message_count, last_reward_time, date)
                VALUES (?, ?, 1, CURRENT_TIMESTAMP, ?)
            `, [userId, channelId, today]);
        }
    }

    async recordVoiceActivity(userId, channelId, duration) {
        const today = new Date().toISOString().split('T')[0];
        
        // 기존 기록 확인
        const existing = await this.db.get(`
            SELECT * FROM voice_activity 
            WHERE player_id = ? AND channel_id = ? AND date = ?
        `, [userId, channelId, today]);

        if (existing) {
            // 기존 기록 업데이트
            await this.db.run(`
                UPDATE voice_activity 
                SET duration_minutes = duration_minutes + ?, last_update = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [duration, existing.id]);
        } else {
            // 새 기록 생성
            await this.db.run(`
                INSERT INTO voice_activity (player_id, channel_id, duration_minutes, last_update, date)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)
            `, [userId, channelId, duration, today]);
        }
    }

    calculateChatReward() {
        const config = this.config.game.chatRewards;
        const money = Math.floor(Math.random() * (config.maxMoney - config.minMoney + 1)) + config.minMoney;
        const experience = config.experiencePerMessage;

        return { money, experience };
    }

    calculateVoiceReward(duration) {
        const config = this.config.game.voiceRewards;
        const money = duration * config.moneyPerMinute;
        const experience = duration * config.experiencePerMinute;

        return { money, experience };
    }

    async giveReward(userId, reward) {
        // 돈과 경험치 지급
        await this.db.run(`
            UPDATE players 
            SET money = money + ?, experience = experience + ?, last_active = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [reward.money, reward.experience, userId]);

        // 레벨업 체크
        await this.checkLevelUp(userId);

        // 거래 내역 기록
        await this.db.run(`
            INSERT INTO transactions (player_id, type, amount, description)
            VALUES (?, 'reward', ?, '활동 보상')
        `, [userId, reward.money]);
    }

    async checkLevelUp(userId) {
        const player = await this.db.get('SELECT level, experience FROM players WHERE id = ?', [userId]);
        if (!player) return;

        const requiredExp = this.calculateRequiredExp(player.level);
        
        if (player.experience >= requiredExp) {
            const newLevel = player.level + 1;
            await this.db.run(`
                UPDATE players 
                SET level = ?, experience = experience - ?
                WHERE id = ?
            `, [newLevel, requiredExp, userId]);

            // 레벨업 보상
            const levelUpReward = newLevel * 1000;
            await this.db.run(`
                UPDATE players 
                SET money = money + ?
                WHERE id = ?
            `, [levelUpReward, userId]);

            console.log(`플레이어 ${userId} 레벨업: ${newLevel}`);
        }
    }

    calculateRequiredExp(level) {
        return level * 100 + level * level * 10;
    }

    async checkAchievements(userId, activityType) {
        // 업적 체크 로직은 복잡하므로 기본적인 것만 구현
        const player = await this.db.get('SELECT * FROM players WHERE id = ?', [userId]);
        if (!player) return;

        // 돈 관련 업적
        if (player.money >= 1000000) {
            await this.unlockAchievement(userId, 2); // 백만장자 업적
        }

        // 레벨 관련 업적
        if (player.level >= 10) {
            await this.unlockAchievement(userId, 3); // 레벨 10 달성
        }
    }

    async unlockAchievement(userId, achievementId) {
        // 이미 획득했는지 확인
        const existing = await this.db.get(`
            SELECT * FROM player_achievements 
            WHERE player_id = ? AND achievement_id = ?
        `, [userId, achievementId]);

        if (existing) return;

        // 업적 획득
        await this.db.run(`
            INSERT INTO player_achievements (player_id, achievement_id)
            VALUES (?, ?)
        `, [userId, achievementId]);

        // 보상 지급
        const achievement = await this.db.get('SELECT * FROM achievements WHERE id = ?', [achievementId]);
        if (achievement && achievement.reward_type === 'money') {
            const rewardAmount = parseInt(achievement.reward_value);
            await this.db.run(`
                UPDATE players SET money = money + ? WHERE id = ?
            `, [rewardAmount, userId]);
        }

        console.log(`플레이어 ${userId} 업적 획득: ${achievementId}`);
    }

    async updateChallengeProgress(userId, conditionType, progress) {
        const today = new Date().toISOString().split('T')[0];
        
        // 오늘의 도전과제들 가져오기
        const challenges = await this.db.all(`
            SELECT pc.*, c.* FROM player_challenges pc
            JOIN challenges c ON pc.challenge_id = c.id
            WHERE pc.player_id = ? AND c.condition_type = ? AND pc.completed = FALSE
            AND DATE(c.start_date) <= ? AND (c.end_date IS NULL OR DATE(c.end_date) >= ?)
        `, [userId, conditionType, today, today]);

        for (const challenge of challenges) {
            const newProgress = challenge.progress + progress;
            const targetValue = parseInt(challenge.condition_value);

            if (newProgress >= targetValue) {
                // 도전과제 완료
                await this.db.run(`
                    UPDATE player_challenges 
                    SET progress = ?, completed = TRUE, completed_date = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [newProgress, challenge.id]);

                // 보상 지급
                if (challenge.reward_type === 'money') {
                    const rewardAmount = parseInt(challenge.reward_value);
                    await this.db.run(`
                        UPDATE players SET money = money + ? WHERE id = ?
                    `, [rewardAmount, userId]);
                }

                console.log(`플레이어 ${userId} 도전과제 완료: ${challenge.name}`);
            } else {
                // 진행도 업데이트
                await this.db.run(`
                    UPDATE player_challenges SET progress = ? WHERE id = ?
                `, [newProgress, challenge.id]);
            }
        }
    }
}

module.exports = ActivityTracker;
