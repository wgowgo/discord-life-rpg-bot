const { ChannelType, PermissionFlagsBits } = require('discord.js');

class PrivateChannelSystem {
    constructor(client, database) {
        this.client = client;
        this.db = database;
        this.activeChannels = new Map(); // sessionId -> channelId
        this.channelSessions = new Map(); // channelId -> sessionData
    }

    async initializePrivateChannelSystem() {
        // 개인 채널 정보를 저장할 테이블 생성
        await this.db.query(`
            CREATE TABLE IF NOT EXISTS private_channels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE NOT NULL,
                channel_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                channel_type TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME NOT NULL,
                is_active BOOLEAN DEFAULT 1
            )
        `);

        // 만료된 채널 정리 스케줄러 시작
        this.startChannelCleanup();
        
        console.log('개인 채널 시스템이 초기화되었습니다.');
    }

    async createDungeonChannel(guildId, userId, sessionId, dungeonName) {
        try {
            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) {
                return { success: false, message: '서버를 찾을 수 없습니다.' };
            }

            const user = await this.client.users.fetch(userId);
            if (!user) {
                return { success: false, message: '사용자를 찾을 수 없습니다.' };
            }

            // 던전 카테고리 찾기 또는 생성
            let dungeonCategory = guild.channels.cache.find(
                channel => channel.type === ChannelType.GuildCategory && 
                          channel.name === '🏰-던전-탐험'
            );

            if (!dungeonCategory) {
                dungeonCategory = await guild.channels.create({
                    name: '🏰-던전-탐험',
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                });
            }

            // 개인 던전 채널 생성
            const channelName = `던전-${user.username}-${Date.now().toString().slice(-6)}`;
            const dungeonChannel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: dungeonCategory.id,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    {
                        id: userId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.UseApplicationCommands
                        ]
                    },
                    // 봇 권한
                    {
                        id: this.client.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.ManageMessages
                        ]
                    }
                ]
            });

            // 채널 정보 저장
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30분 후 만료
            
            await this.db.query(`
                INSERT INTO private_channels 
                (session_id, channel_id, user_id, channel_type, expires_at) 
                VALUES (?, ?, ?, ?, ?)
            `, [sessionId, dungeonChannel.id, userId, 'dungeon', expiresAt.toISOString()]);

            // 메모리에 저장
            this.activeChannels.set(sessionId, dungeonChannel.id);
            this.channelSessions.set(dungeonChannel.id, {
                sessionId: sessionId,
                userId: userId,
                dungeonName: dungeonName,
                channelType: 'dungeon',
                createdAt: Date.now(),
                expiresAt: expiresAt.getTime()
            });

            // 환영 메시지 전송
            await this.sendWelcomeMessage(dungeonChannel, user, dungeonName);

            return {
                success: true,
                channelId: dungeonChannel.id,
                channel: dungeonChannel,
                message: `${dungeonName} 전용 채널이 생성되었습니다!`
            };

        } catch (error) {
            console.error('던전 채널 생성 오류:', error);
            return { success: false, message: '채널 생성 중 오류가 발생했습니다.' };
        }
    }

    async sendWelcomeMessage(channel, user, dungeonName) {
        const welcomeEmbed = {
            color: 0x00ff00,
            title: `🏰 ${dungeonName} 개인 탐험실`,
            description: [
                `안녕하세요 ${user.username}님! 던전 탐험을 시작합니다.`,
                '',
                '📋 **이용 안내**',
                '• 이 채널은 당신만의 던전 탐험 공간입니다',
                '• 던전에서 만나는 모든 상황이 여기에 표시됩니다',
                '• 버튼을 클릭하거나 명령어를 입력하여 행동하세요',
                '• 채널은 30분 후 또는 던전 완료 시 자동 삭제됩니다',
                '',
                '⚔️ **기본 명령어**',
                '• `/던전행동 전투` - 몬스터와 전투',
                '• `/던전행동 도망` - 던전에서 도망',
                '• `/던전행동 아이템사용` - 아이템 사용',
                '• `/던전행동 스킬사용` - 스킬 사용',
                '',
                '🎯 **준비가 되면 아래 버튼을 클릭하세요!**'
            ].join('\n'),
            timestamp: new Date().toISOString(),
            footer: {
                text: '던전 탐험을 즐기세요!'
            }
        };

        const actionRow = {
            type: 1,
            components: [
                {
                    type: 2,
                    style: 1,
                    label: '🚀 탐험 시작',
                    emoji: '🏰',
                    custom_id: 'dungeon_start_exploration'
                },
                {
                    type: 2,
                    style: 4,
                    label: '❌ 탐험 종료',
                    emoji: '🚪',
                    custom_id: 'dungeon_end_exploration'
                }
            ]
        };

        await channel.send({
            embeds: [welcomeEmbed],
            components: [actionRow]
        });
    }

    async sendEncounterMessage(channelId, encounter, sessionData = {}) {
        try {
            const channel = this.client.channels.cache.get(channelId);
            if (!channel) return;

            let embed = {
                color: this.getEncounterColor(encounter.type),
                title: this.getEncounterTitle(encounter.type),
                description: encounter.description,
                timestamp: new Date().toISOString()
            };

            // 세션 정보 추가
            if (sessionData.playerHP !== undefined) {
                embed.fields = [
                    {
                        name: '💪 상태',
                        value: [
                            `❤️ 체력: ${sessionData.playerHP}/100`,
                            `💙 마나: ${sessionData.playerMP || 50}/100`,
                            `📍 스테이지: ${sessionData.currentStage || 1}/5`
                        ].join('\n'),
                        inline: true
                    }
                ];
            }

            // 몬스터 정보 추가
            if (encounter.type === 'monster' && encounter.monster) {
                const monster = encounter.monster;
                embed.fields = embed.fields || [];
                embed.fields.push({
                    name: `👹 ${monster.name}`,
                    value: [
                        `❤️ 체력: ${monster.current_hp || monster.hp}/${monster.hp}`,
                        `⚔️ 공격력: ${monster.attack}`,
                        `🛡️ 방어력: ${monster.defense || 0}`
                    ].join('\n'),
                    inline: true
                });
            }

            // 보물 정보 추가
            if (encounter.type === 'treasure' && encounter.treasure) {
                const treasure = encounter.treasure;
                embed.fields = embed.fields || [];
                let treasureInfo = [];
                
                if (treasure.money) treasureInfo.push(`💰 ${treasure.money.toLocaleString()}원`);
                if (treasure.exp) treasureInfo.push(`⭐ ${treasure.exp} 경험치`);
                if (treasure.items && treasure.items.length > 0) {
                    treasureInfo.push(`🎁 아이템: ${treasure.items.join(', ')}`);
                }

                embed.fields.push({
                    name: '🎁 발견한 보물',
                    value: treasureInfo.join('\n'),
                    inline: false
                });
            }

            // 행동 버튼 생성
            const actionButtons = this.createEncounterButtons(encounter);

            await channel.send({
                embeds: [embed],
                components: actionButtons
            });

        } catch (error) {
            console.error('조우 메시지 전송 오류:', error);
        }
    }

    createEncounterButtons(encounter) {
        if (!encounter.options || encounter.options.length === 0) {
            return [];
        }

        const buttons = encounter.options.map(option => ({
            type: 2,
            style: this.getButtonStyle(option.id),
            label: option.label,
            custom_id: `dungeon_action_${option.id}`,
            disabled: false
        }));

        // 버튼을 행으로 나누기 (최대 5개씩)
        const rows = [];
        for (let i = 0; i < buttons.length; i += 5) {
            rows.push({
                type: 1,
                components: buttons.slice(i, i + 5)
            });
        }

        return rows;
    }

    getButtonStyle(actionId) {
        const styles = {
            'fight': 4,      // 빨간색 (위험)
            'flee': 2,       // 회색 (보조)
            'use_item': 1,   // 파란색 (기본)
            'use_skill': 3,  // 초록색 (성공)
            'continue': 1    // 파란색 (기본)
        };
        return styles[actionId] || 1;
    }

    getEncounterColor(type) {
        const colors = {
            'monster': 0xff0000,    // 빨간색
            'treasure': 0xffff00,   // 노란색
            'rest': 0x00ff00,       // 초록색
            'event': 0x0099ff       // 파란색
        };
        return colors[type] || 0x000000;
    }

    getEncounterTitle(type) {
        const titles = {
            'monster': '⚔️ 몬스터 조우!',
            'treasure': '💰 보물 발견!',
            'rest': '🛡️ 휴식 지점',
            'event': '🎭 특별 이벤트'
        };
        return titles[type] || '❓ 알 수 없는 상황';
    }

    async sendActionResult(channelId, result) {
        try {
            const channel = this.client.channels.cache.get(channelId);
            if (!channel) return;

            let embed = {
                color: result.success ? 0x00ff00 : 0xff0000,
                title: result.success ? '✅ 행동 성공' : '❌ 행동 실패',
                description: result.message,
                timestamp: new Date().toISOString()
            };

            // 전투 결과 상세 정보
            if (result.playerAction) {
                embed.fields = embed.fields || [];
                embed.fields.push({
                    name: '⚔️ 전투 결과',
                    value: [
                        result.playerAction,
                        result.monsterAction || ''
                    ].filter(Boolean).join('\n'),
                    inline: false
                });
            }

            // 보상 정보
            if (result.rewards) {
                embed.fields = embed.fields || [];
                let rewardText = [];
                
                if (result.rewards.money) rewardText.push(`💰 ${result.rewards.money.toLocaleString()}원`);
                if (result.rewards.exp) rewardText.push(`⭐ ${result.rewards.exp} 경험치`);
                
                embed.fields.push({
                    name: '🎁 획득 보상',
                    value: rewardText.join('\n'),
                    inline: false
                });
            }

            await channel.send({ embeds: [embed] });

            // 다음 조우가 있으면 전송
            if (result.nextEncounter) {
                setTimeout(() => {
                    this.sendEncounterMessage(channelId, result.nextEncounter, {
                        playerHP: result.playerHP,
                        playerMP: result.playerMP
                    });
                }, 2000); // 2초 후 다음 조우 표시
            }

            // 던전 완료 시 축하 메시지
            if (result.dungeonComplete) {
                await this.sendCompletionMessage(channelId, result);
            }

            // 패배/도망 시 종료 메시지
            if (result.defeat || result.fled) {
                await this.sendEndMessage(channelId, result);
            }

        } catch (error) {
            console.error('행동 결과 전송 오류:', error);
        }
    }

    async sendCompletionMessage(channelId, result) {
        const embed = {
            color: 0x00ff00,
            title: '🎉 던전 완주 축하합니다!',
            description: [
                '훌륭합니다! 던전을 성공적으로 완주했습니다!',
                '',
                '🏆 **완주 보상**'
            ].join('\n'),
            fields: [],
            timestamp: new Date().toISOString()
        };

        if (result.finalRewards) {
            let rewardText = [];
            if (result.finalRewards.money) rewardText.push(`💰 ${result.finalRewards.money.toLocaleString()}원`);
            if (result.finalRewards.exp) rewardText.push(`⭐ ${result.finalRewards.exp} 경험치`);
            if (result.finalRewards.bonus_message) rewardText.push(`✨ ${result.finalRewards.bonus_message}`);
            
            embed.fields.push({
                name: '🎁 최종 보상',
                value: rewardText.join('\n'),
                inline: false
            });
        }

        embed.fields.push({
            name: '📊 탐험 통계',
            value: [
                `👹 처치한 몬스터: ${result.defeated_monsters || 0}마리`,
                `💰 발견한 보물: ${result.treasure_found || 0}개`,
                `⏱️ 소요 시간: 약 ${Math.floor((Date.now() - result.startTime) / 60000)}분`
            ].join('\n'),
            inline: false
        });

        const channel = this.client.channels.cache.get(channelId);
        if (channel) {
            await channel.send({ embeds: [embed] });
            
            // 5초 후 채널 삭제 안내
            setTimeout(async () => {
                await channel.send('🕐 5초 후 이 채널이 자동으로 삭제됩니다...');
                setTimeout(() => {
                    this.deleteChannel(channelId);
                }, 5000);
            }, 2000);
        }
    }

    async sendEndMessage(channelId, result) {
        const embed = {
            color: result.defeat ? 0xff0000 : 0xffaa00,
            title: result.defeat ? '💀 던전 탐험 실패' : '🏃 던전에서 탈출',
            description: result.message,
            timestamp: new Date().toISOString()
        };

        if (result.partialRewards) {
            let rewardText = [];
            if (result.partialRewards.money > 0) rewardText.push(`💰 ${result.partialRewards.money.toLocaleString()}원`);
            if (result.partialRewards.exp > 0) rewardText.push(`⭐ ${result.partialRewards.exp} 경험치`);
            
            if (rewardText.length > 0) {
                embed.fields = [{
                    name: '🎁 부분 보상',
                    value: rewardText.join('\n'),
                    inline: false
                }];
            }
        }

        const channel = this.client.channels.cache.get(channelId);
        if (channel) {
            await channel.send({ embeds: [embed] });
            
            // 3초 후 채널 삭제
            setTimeout(() => {
                this.deleteChannel(channelId);
            }, 3000);
        }
    }

    async deleteChannel(channelId) {
        try {
            const sessionData = this.channelSessions.get(channelId);
            
            // 데이터베이스에서 제거
            await this.db.query(
                'UPDATE private_channels SET is_active = 0 WHERE channel_id = ?',
                [channelId]
            );

            // 메모리에서 제거
            if (sessionData) {
                this.activeChannels.delete(sessionData.sessionId);
            }
            this.channelSessions.delete(channelId);

            // Discord 채널 삭제
            const channel = this.client.channels.cache.get(channelId);
            if (channel) {
                await channel.delete('던전 탐험 완료');
            }

            console.log(`던전 채널 삭제 완료: ${channelId}`);

        } catch (error) {
            console.error('채널 삭제 오류:', error);
        }
    }

    async getChannelBySessionId(sessionId) {
        const channelId = this.activeChannels.get(sessionId);
        if (channelId) {
            return this.client.channels.cache.get(channelId);
        }
        return null;
    }

    async getSessionByChannelId(channelId) {
        return this.channelSessions.get(channelId);
    }

    startChannelCleanup() {
        // 5분마다 만료된 채널 정리
        setInterval(async () => {
            await this.cleanupExpiredChannels();
        }, 5 * 60 * 1000);
    }

    async cleanupExpiredChannels() {
        try {
            const now = new Date().toISOString();
            
            // 만료된 채널 조회
            const expiredChannels = await this.db.query(
                'SELECT * FROM private_channels WHERE expires_at < ? AND is_active = 1',
                [now]
            );

            for (const channelData of expiredChannels) {
                await this.deleteChannel(channelData.channel_id);
                console.log(`만료된 채널 정리: ${channelData.channel_id}`);
            }

        } catch (error) {
            console.error('채널 정리 오류:', error);
        }
    }

    async handleChannelInteraction(interaction) {
        const channelId = interaction.channel.id;
        const sessionData = this.channelSessions.get(channelId);
        
        if (!sessionData) {
            await interaction.reply({
                content: '이 채널의 세션 정보를 찾을 수 없습니다.',
                ephemeral: true
            });
            return;
        }

        const customId = interaction.customId;
        
        if (customId === 'dungeon_start_exploration') {
            await interaction.reply({
                content: '던전 탐험이 시작됩니다! 잠시만 기다려주세요...',
                ephemeral: true
            });
            
            // DungeonSystem을 통해 실제 탐험 시작
            // 이는 명령어 핸들러에서 처리될 예정
            
        } else if (customId === 'dungeon_end_exploration') {
            await interaction.reply({
                content: '던전 탐험을 종료합니다.',
                ephemeral: true
            });
            
            await this.deleteChannel(channelId);
            
        } else if (customId.startsWith('dungeon_action_')) {
            const action = customId.replace('dungeon_action_', '');
            
            await interaction.reply({
                content: `"${action}" 행동을 실행합니다...`,
                ephemeral: true
            });
            
            // 실제 던전 행동 처리는 DungeonSystem을 통해 수행
            // 이는 명령어 핸들러에서 처리될 예정
        }
    }
}

module.exports = PrivateChannelSystem;



