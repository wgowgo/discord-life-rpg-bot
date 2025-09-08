const { ChannelType, PermissionFlagsBits } = require('discord.js');

class PersonalChannelSystem {
    constructor(client) {
        this.client = client;
        this.channelPrefix = '개인채널-';
        this.categoryName = '🔒 개인 채널';
    }

    /**
     * 새 플레이어를 위한 개인 채널 생성
     */
    async createPersonalChannel(guildId, userId, username) {
        try {
            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) {
                console.error('길드를 찾을 수 없습니다:', guildId);
                return null;
            }

            // 개인 채널 카테고리 찾기 또는 생성
            let category = guild.channels.cache.find(
                channel => channel.type === ChannelType.GuildCategory && 
                          channel.name === this.categoryName
            );

            if (!category) {
                category = await guild.channels.create({
                    name: this.categoryName,
                    type: ChannelType.GuildCategory,
                    position: 0, // 최상단에 위치
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                });
                console.log('개인 채널 카테고리 생성됨:', category.name);
            }

            // 개인 채널 생성
            const channelName = `${this.channelPrefix}${username}`.toLowerCase()
                .replace(/[^a-z0-9가-힣\-]/g, '-')
                .replace(/-+/g, '-')
                .substring(0, 90); // 디스코드 채널명 길이 제한

            const personalChannel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: category.id,
                topic: `${username}님의 개인 전용 채널 🎮`,
                permissionOverwrites: [
                    // 모든 사람 접근 차단
                    {
                        id: guild.roles.everyone,
                        deny: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    // 해당 유저만 모든 권한 허용
                    {
                        id: userId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.AttachFiles,
                            PermissionFlagsBits.EmbedLinks,
                            PermissionFlagsBits.UseExternalEmojis,
                            PermissionFlagsBits.AddReactions
                        ]
                    },
                    // 봇도 접근 가능
                    {
                        id: this.client.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageMessages,
                            PermissionFlagsBits.EmbedLinks,
                            PermissionFlagsBits.AttachFiles
                        ]
                    }
                ]
            });

            // 환영 메시지 전송
            await this.sendWelcomeMessage(personalChannel, userId, username);

            console.log(`개인 채널 생성됨: ${personalChannel.name} (${userId})`);
            return personalChannel;

        } catch (error) {
            console.error('개인 채널 생성 오류:', error);
            return null;
        }
    }

    /**
     * 환영 메시지 전송
     */
    async sendWelcomeMessage(channel, userId, username) {
        try {
            const welcomeEmbed = {
                title: '🎉 개인 채널에 오신 것을 환영합니다!',
                description: `안녕하세요, **${username}**님! 이곳은 당신만의 전용 채널입니다.`,
                color: 0x00ff00,
                fields: [
                    {
                        name: '🔒 개인 채널이란?',
                        value: '오직 당신만 볼 수 있는 비공개 채널입니다.\n던전 탐험, 개인 정보 확인 등에 활용하세요!',
                        inline: false
                    },
                    {
                        name: '🎮 주요 활용법',
                        value: '• 던전 탐험 시 실시간 진행상황\n• 개인 통계 및 상세 정보\n• 긴 결과 메시지들\n• 개인적인 게임 알림',
                        inline: false
                    },
                    {
                        name: '🚀 시작하기',
                        value: '`/프로필`로 당신의 캐릭터를 확인해보세요!\n`/던전 목록`으로 모험을 시작할 수 있습니다.',
                        inline: false
                    },
                    {
                        name: '💡 팁',
                        value: '이 채널은 삭제되지 않으니 언제든 돌아와서 활용하세요!',
                        inline: false
                    }
                ],
                footer: {
                    text: 'Discord Life RPG • 즐거운 게임 되세요! 🎮'
                },
                timestamp: new Date().toISOString()
            };

            await channel.send({ 
                content: `<@${userId}>`, 
                embeds: [welcomeEmbed] 
            });

            // 추가 안내 메시지
            await channel.send({
                content: '📋 **자주 사용하는 명령어들:**\n' +
                        '```\n' +
                        '/프로필 - 내 캐릭터 정보\n' +
                        '/던전 목록 - 던전 목록 확인\n' +
                        '/상점 목록 - 아이템 상점\n' +
                        '/주식 시장 - 주식 투자\n' +
                        '/펫 상점 - 펫 구매\n' +
                        '/업적 목록 - 내 업적 확인\n' +
                        '```'
            });

        } catch (error) {
            console.error('환영 메시지 전송 오류:', error);
        }
    }

    /**
     * 사용자의 개인 채널 찾기
     */
    async findPersonalChannel(guildId, userId) {
        try {
            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) return null;

            const user = await guild.members.fetch(userId);
            if (!user) return null;

            const username = user.displayName || user.user.username;
            const expectedChannelName = `${this.channelPrefix}${username}`.toLowerCase()
                .replace(/[^a-z0-9가-힣\-]/g, '-')
                .replace(/-+/g, '-')
                .substring(0, 90);

            return guild.channels.cache.find(channel => 
                channel.name === expectedChannelName && 
                channel.permissionOverwrites.cache.has(userId)
            );

        } catch (error) {
            console.error('개인 채널 찾기 오류:', error);
            return null;
        }
    }

    /**
     * 개인 채널에 메시지 전송
     */
    async sendToPersonalChannel(guildId, userId, content, options = {}) {
        try {
            const channel = await this.findPersonalChannel(guildId, userId);
            if (!channel) {
                console.log('개인 채널을 찾을 수 없음:', userId);
                return false;
            }

            await channel.send({ content, ...options });
            return true;

        } catch (error) {
            console.error('개인 채널 메시지 전송 오류:', error);
            return false;
        }
    }

    /**
     * 개인 채널 정리 (오래된 채널들)
     */
    async cleanupInactiveChannels(guildId, daysThreshold = 30) {
        try {
            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) return;

            const category = guild.channels.cache.find(
                channel => channel.type === ChannelType.GuildCategory && 
                          channel.name === this.categoryName
            );

            if (!category) return;

            const personalChannels = guild.channels.cache.filter(
                channel => channel.parent?.id === category.id && 
                          channel.name.startsWith(this.channelPrefix)
            );

            const threshold = Date.now() - (daysThreshold * 24 * 60 * 60 * 1000);

            for (const [channelId, channel] of personalChannels) {
                try {
                    // 마지막 메시지 확인
                    const messages = await channel.messages.fetch({ limit: 1 });
                    const lastMessage = messages.first();

                    if (!lastMessage || lastMessage.createdTimestamp < threshold) {
                        // 사용자에게 채널 삭제 예고 알림
                        await channel.send({
                            embeds: [{
                                title: '⚠️ 채널 삭제 예고',
                                description: `이 채널은 ${daysThreshold}일 이상 사용되지 않아 곧 삭제될 예정입니다.\n계속 사용하시려면 아무 메시지나 보내주세요!`,
                                color: 0xff9900,
                                footer: { text: '24시간 후 자동 삭제됩니다.' }
                            }]
                        });

                        // 24시간 후 삭제 스케줄링
                        setTimeout(async () => {
                            try {
                                const recentMessages = await channel.messages.fetch({ limit: 1 });
                                const newestMessage = recentMessages.first();
                                
                                // 알림 이후 새 메시지가 없으면 삭제
                                if (!newestMessage || newestMessage.createdTimestamp < Date.now() - (24 * 60 * 60 * 1000)) {
                                    await channel.delete('비활성 개인 채널 정리');
                                    console.log(`비활성 개인 채널 삭제됨: ${channel.name}`);
                                }
                            } catch (deleteError) {
                                console.error('채널 삭제 오류:', deleteError);
                            }
                        }, 24 * 60 * 60 * 1000); // 24시간
                    }
                } catch (messageError) {
                    console.error('메시지 확인 오류:', messageError);
                }
            }

        } catch (error) {
            console.error('개인 채널 정리 오류:', error);
        }
    }

    /**
     * 모든 개인 채널 통계
     */
    async getChannelStats(guildId) {
        try {
            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) return null;

            const category = guild.channels.cache.find(
                channel => channel.type === ChannelType.GuildCategory && 
                          channel.name === this.categoryName
            );

            if (!category) return { total: 0, active: 0 };

            const personalChannels = guild.channels.cache.filter(
                channel => channel.parent?.id === category.id && 
                          channel.name.startsWith(this.channelPrefix)
            );

            let activeCount = 0;
            const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

            for (const [channelId, channel] of personalChannels) {
                try {
                    const messages = await channel.messages.fetch({ limit: 1 });
                    const lastMessage = messages.first();
                    
                    if (lastMessage && lastMessage.createdTimestamp > weekAgo) {
                        activeCount++;
                    }
                } catch (error) {
                    // 메시지 접근 오류는 무시
                }
            }

            return {
                total: personalChannels.size,
                active: activeCount
            };

        } catch (error) {
            console.error('채널 통계 조회 오류:', error);
            return null;
        }
    }
}

module.exports = PersonalChannelSystem;


