const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Player = require('../systems/Player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('프로필')
        .setDescription('프로필 관련 명령어')
        .addSubcommand(subcommand =>
            subcommand
                .setName('보기')
                .setDescription('내 프로필을 확인합니다')
                .addUserOption(option =>
                    option.setName('유저')
                        .setDescription('프로필을 볼 유저 (기본값: 자신)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('초기화')
                .setDescription('내 프로필 데이터를 초기화합니다')),

    async execute(interaction, db, personalChannelSystem) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const player = new Player(db);

        try {
            switch (subcommand) {
                case '보기':
                    await this.handleViewProfile(interaction, db, personalChannelSystem);
                    break;
                case '초기화':
                    await this.handleResetProfile(interaction, db, userId);
                    break;
            }
        } catch (error) {
            console.error('프로필 명령어 오류:', error);
            await interaction.reply({ 
                content: '프로필 명령어 실행 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleViewProfile(interaction, db, personalChannelSystem) {
        const targetUser = interaction.options.getUser('유저') || interaction.user;
        const player = new Player(db);

        try {
            // 프로필 데이터 가져오기 (없으면 생성)
            const profileData = await player.getProfile(
                targetUser.id, 
                targetUser.displayName || targetUser.username
            );
            if (!profileData) {
                await interaction.reply({ 
                    content: '프로필을 생성할 수 없습니다. 나중에 다시 시도해주세요.', 
                    ephemeral: true 
                });
                return;
            }

            const isNewPlayer = profileData.isNewPlayer || false;
            
            // 프로필 임베드 생성
            const embed = await player.createProfileEmbed(profileData);

            // 먼저 프로필 응답
            await interaction.reply({ embeds: [embed] });

            // 새 플레이어인 경우 개인 채널 생성
            if (isNewPlayer && targetUser.id === interaction.user.id && personalChannelSystem) {
                try {
                    const personalChannel = await personalChannelSystem.createPersonalChannel(
                        interaction.guildId,
                        targetUser.id,
                        targetUser.displayName || targetUser.username
                    );

                    if (personalChannel) {
                        // 추가 안내 메시지
                        await interaction.followUp({
                            content: `🎉 **환영합니다!** ${targetUser}님의 개인 채널 <#${personalChannel.id}>이 생성되었습니다!\n\n` +
                                   `💡 **개인 채널에서는:**\n` +
                                   `• 던전 탐험 진행상황\n` +
                                   `• 상세한 게임 정보\n` +
                                   `• 개인적인 알림들\n` +
                                   `을 확인할 수 있습니다!\n\n` +
                                   `🚀 **시작하기:** 개인 채널에서 게임을 본격적으로 즐겨보세요!`,
                            ephemeral: true
                        });

                        console.log(`새 플레이어 ${targetUser.tag}를 위한 개인 채널 생성됨: ${personalChannel.name}`);
                    }
                } catch (channelError) {
                    console.error('개인 채널 생성 오류:', channelError);
                    // 채널 생성 실패시 안내 메시지
                    await interaction.followUp({
                        content: '⚠️ 개인 채널 생성에 실패했습니다. 관리자에게 문의해주세요.',
                        ephemeral: true
                    });
                }
            }

        } catch (error) {
            console.error('프로필 보기 오류:', error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: '프로필을 불러오는 중 오류가 발생했습니다.', 
                    ephemeral: true 
                });
            } else {
                await interaction.followUp({ 
                    content: '프로필을 불러오는 중 오류가 발생했습니다.', 
                    ephemeral: true 
                });
            }
        }
    },

    async handleResetProfile(interaction, db, userId) {
        // 1단계: 확인 메시지
        const confirmEmbed = new EmbedBuilder()
            .setColor(0xFF6B6B)
            .setTitle('⚠️ 프로필 초기화 확인')
            .setDescription('**정말로 데이터를 초기화시키겠습니까?**\n\n' +
                           '이 작업은 **되돌릴 수 없습니다**!\n' +
                           '다음 데이터가 모두 삭제됩니다:\n' +
                           '• 모든 게임 진행 상황\n' +
                           '• 보유한 돈과 아이템\n' +
                           '• 직업과 경험치\n' +
                           '• 업적과 칭호\n' +
                           '• 펫과 부동산\n' +
                           '• 주식 투자 내역\n' +
                           '• 모든 게임 기록')
            .setFooter({ text: '신중하게 결정해주세요!' });

        const confirmRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('reset_confirm')
                    .setLabel('예, 초기화합니다')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('reset_cancel')
                    .setLabel('아니요, 취소합니다')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({
            embeds: [confirmEmbed],
            components: [confirmRow],
            ephemeral: true
        });

        // 버튼 상호작용 수집기
        const collector = interaction.channel.createMessageComponentCollector({
            filter: (btnInteraction) => btnInteraction.user.id === userId,
            time: 60000 // 1분
        });

        collector.on('collect', async (btnInteraction) => {
            if (btnInteraction.customId === 'reset_confirm') {
                await this.handleResetConfirmation(btnInteraction, db, userId);
            } else if (btnInteraction.customId === 'reset_cancel') {
                const cancelEmbed = new EmbedBuilder()
                    .setColor(0x4CAF50)
                    .setTitle('✅ 초기화 취소됨')
                    .setDescription('프로필 초기화가 취소되었습니다.\n데이터는 그대로 유지됩니다.');

                await btnInteraction.update({
                    embeds: [cancelEmbed],
                    components: []
                });
            }
            collector.stop();
        });

        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setColor(0xFF9800)
                    .setTitle('⏰ 시간 초과')
                    .setDescription('응답 시간이 초과되어 초기화가 취소되었습니다.');

                try {
                    await interaction.editReply({
                        embeds: [timeoutEmbed],
                        components: []
                    });
                } catch (error) {
                    console.error('타임아웃 메시지 업데이트 오류:', error);
                }
            }
        });
    },

    async handleResetConfirmation(interaction, db, userId) {
        // 2단계: 최종 확인
        const finalEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('🔥 최종 확인')
            .setDescription('**데이터 초기화를 위해 다음을 입력하시오:**\n\n' +
                           '`초기화 하겠다`\n\n' +
                           '⚠️ **경고:** 이 작업은 되돌릴 수 없습니다!')
            .setFooter({ text: '정확히 위의 문구를 입력해주세요' });

        await interaction.update({
            embeds: [finalEmbed],
            components: []
        });

        // 메시지 수집기 (정확한 문구 입력 대기)
        const messageCollector = interaction.channel.createMessageCollector({
            filter: (message) => message.author.id === userId && message.content === '초기화 하겠다',
            time: 120000, // 2분
            max: 1
        });

        messageCollector.on('collect', async (message) => {
            try {
                // 데이터 초기화 실행
                await this.performDataReset(db, userId);
                
                const successEmbed = new EmbedBuilder()
                    .setColor(0x4CAF50)
                    .setTitle('✅ 초기화 완료')
                    .setDescription('프로필 데이터가 성공적으로 초기화되었습니다!\n\n' +
                                   '**새로운 캐릭터가 자동으로 생성되었습니다!**\n' +
                                   '`/프로필` 명령어로 새 캐릭터를 확인해보세요! 🎮')
                    .addFields(
                        {
                            name: '🚀 다음 단계',
                            value: '1. `/프로필` - 새 캐릭터 확인\n2. `/직업 목록` - 직업 구하기\n3. `/도움말` - 게임 가이드 보기',
                            inline: false
                        }
                    )
                    .setFooter({ text: '새로운 모험을 시작해보세요!' });

                await message.reply({
                    embeds: [successEmbed]
                });

                // 개인 채널에서도 안내 메시지 전송
                try {
                    const personalChannelSystem = require('../systems/PersonalChannelSystem');
                    const channelSystem = new personalChannelSystem(interaction.client);
                    const personalChannel = await channelSystem.findPersonalChannel(interaction.guild.id, userId);
                    
                    if (personalChannel) {
                        const channelEmbed = new EmbedBuilder()
                            .setColor(0x00BFFF)
                            .setTitle('🎉 새로운 시작!')
                            .setDescription('프로필이 초기화되어 새로운 캐릭터로 시작합니다!')
                            .addFields(
                                {
                                    name: '🎮 게임 시작하기',
                                    value: '`/프로필` - 새 캐릭터 확인\n`/직업 목록` - 직업 구하기\n`/도움말` - 게임 가이드',
                                    inline: false
                                },
                                {
                                    name: '💡 초보자 팁',
                                    value: '• 채팅으로 돈과 경험치 획득\n• 직업을 구해 안정적인 수입 확보\n• 던전 탐험으로 아이템 획득',
                                    inline: false
                                }
                            )
                            .setFooter({ text: '새로운 모험을 즐겨보세요! 🚀' });

                        await personalChannel.send({ embeds: [channelEmbed] });
                    }
                } catch (error) {
                    console.error('개인 채널 안내 메시지 전송 오류:', error);
                }

                console.log(`플레이어 ${userId}의 데이터가 초기화되었습니다.`);
            } catch (error) {
                console.error('데이터 초기화 오류:', error);
                
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('❌ 초기화 실패')
                    .setDescription('데이터 초기화 중 오류가 발생했습니다.\n관리자에게 문의해주세요.');

                await message.reply({
                    embeds: [errorEmbed]
                });
            }
        });

        messageCollector.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setColor(0xFF9800)
                    .setTitle('⏰ 시간 초과')
                    .setDescription('입력 시간이 초과되어 초기화가 취소되었습니다.');

                try {
                    await interaction.followUp({
                        embeds: [timeoutEmbed],
                        ephemeral: true
                    });
                } catch (error) {
                    console.error('타임아웃 메시지 전송 오류:', error);
                }
            }
        });
    },

    async performDataReset(db, userId) {
        // 모든 플레이어 관련 데이터 삭제
        const tablesToReset = [
            'player_achievements',
            'player_titles', 
            'player_inventory',
            'player_pets',
            'player_properties',
            'player_stocks',
            'player_jobs',
            'player_dungeon_clears',
            'player_challenges',
            'player_businesses',
            'player_education',
            'player_romance',
            'player_farming',
            'chat_activity',
            'voice_activity',
            'transactions',
            'friendships',
            'marriages',
            'player_stats',
            'players'
        ];

        for (const table of tablesToReset) {
            try {
                await db.run(`DELETE FROM ${table} WHERE player_id = ?`, [userId]);
            } catch (error) {
                console.error(`${table} 테이블 초기화 오류:`, error);
            }
        }

        // 새로운 플레이어 데이터 생성
        const Player = require('../systems/Player');
        const player = new Player(db);
        await player.createPlayer(userId, '플레이어');
    }
};

