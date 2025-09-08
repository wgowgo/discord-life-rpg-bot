const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Player = require('../systems/Player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('프로필')
        .setDescription('프로필 관련 명령어')
        .addSubcommand(subcommand =>
            subcommand
                .setName('등록')
                .setDescription('게임에 참여하기 위해 프로필을 등록합니다'))
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
                case '등록':
                    await this.handleRegisterProfile(interaction, db, personalChannelSystem);
                    break;
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

    async handleRegisterProfile(interaction, db, personalChannelSystem) {
        const targetUser = interaction.user;
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

            // 새 플레이어인 경우 등록 완료 메시지 추가
            if (isNewPlayer) {
                embed.setTitle('🎉 프로필 등록 완료!');
                embed.setDescription('**Discord Life RPG에 오신 것을 환영합니다!**\n\n' + 
                                   '새로운 캐릭터가 생성되었습니다. 이제 게임을 시작할 수 있습니다!');
                embed.addFields(
                    {
                        name: '🚀 다음 단계',
                        value: '1. `/직업 목록` - 직업 구하기\n2. `/도움말` - 게임 가이드 보기\n3. 채팅으로 돈과 경험치 획득',
                        inline: false
                    }
                );
            } else {
                embed.setTitle('👤 프로필 정보');
                embed.setDescription('이미 등록된 프로필입니다.');
            }

            // 먼저 프로필 응답
            await interaction.reply({ embeds: [embed] });

            // 새 플레이어인 경우 개인 채널 생성
            if (isNewPlayer && personalChannelSystem) {
                try {
                    const personalChannel = await personalChannelSystem.createPersonalChannel(
                        interaction.guildId,
                        targetUser.id,
                        targetUser.displayName || targetUser.username
                    );

                    if (personalChannel) {
                        console.log(`새 플레이어 ${targetUser.username}의 개인 채널 생성됨: ${personalChannel.name}`);
                    }
                } catch (error) {
                    console.error('개인 채널 생성 오류:', error);
                }
            }

        } catch (error) {
            console.error('프로필 등록 오류:', error);
            await interaction.reply({ 
                content: '프로필 등록 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleViewProfile(interaction, db, personalChannelSystem) {
        const targetUser = interaction.options.getUser('유저') || interaction.user;
        const player = new Player(db);

        try {
            // 프로필 데이터 가져오기 (기존 플레이어만)
            const profileData = await player.getProfile(
                targetUser.id, 
                targetUser.displayName || targetUser.username,
                false // 새 플레이어 생성하지 않음
            );
            
            if (!profileData) {
                await interaction.reply({ 
                    content: '등록된 프로필이 없습니다. `/프로필 등록` 명령어로 먼저 등록해주세요.', 
                    ephemeral: true 
                });
                return;
            }

            // 프로필 임베드 생성
            const embed = await player.createProfileEmbed(profileData);
            embed.setTitle('👤 프로필 정보');

            // 프로필 응답
            await interaction.reply({ embeds: [embed] });

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
                           '• 모든 게임 기록\n' +
                           '• **기존 개인 채널**')
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
                // 바로 초기화 실행 (2단계 제거)
                try {
                    await this.performDataReset(db, userId, interaction);
                    
                    const successEmbed = new EmbedBuilder()
                        .setColor(0x4CAF50)
                        .setTitle('✅ 초기화 완료')
                        .setDescription('프로필 데이터가 성공적으로 초기화되었습니다!\n\n' +
                                       '**다음이 완료되었습니다:**\n' +
                                       '• 기존 개인 채널 삭제\n' +
                                       '• 모든 게임 데이터 초기화\n' +
                                       '• 새로운 캐릭터 생성\n\n' +
                                       '`/프로필 등록` 명령어로 새 캐릭터를 확인하고 개인 채널을 다시 생성하세요! 🎮')
                        .addFields(
                            {
                                name: '🚀 다음 단계',
                                value: '1. `/프로필 등록` - 새 캐릭터 확인 및 개인 채널 생성\n2. `/직업 목록` - 직업 구하기\n3. `/도움말` - 게임 가이드 보기',
                                inline: false
                            }
                        )
                        .setFooter({ text: '새로운 모험을 시작해보세요!' });

                    await btnInteraction.update({
                        embeds: [successEmbed],
                        components: []
                    });

                    console.log(`플레이어 ${userId}의 데이터가 초기화되었습니다.`);
                } catch (error) {
                    console.error('데이터 초기화 오류:', error);
                    
                    const errorEmbed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('❌ 초기화 실패')
                        .setDescription('데이터 초기화 중 오류가 발생했습니다.\n관리자에게 문의해주세요.');

                    await btnInteraction.update({
                        embeds: [errorEmbed],
                        components: []
                    });
                }
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


    async performDataReset(db, userId, interaction) {
        // 기존 개인 채널 삭제
        try {
            const PersonalChannelSystem = require('../systems/PersonalChannelSystem');
            const personalChannelSystem = new PersonalChannelSystem(interaction.client);
            const existingChannel = await personalChannelSystem.findPersonalChannel(interaction.guild.id, userId);
            
            if (existingChannel) {
                await existingChannel.delete('프로필 초기화로 인한 개인 채널 삭제');
                console.log(`기존 개인 채널 삭제됨: ${existingChannel.name} (${userId})`);
            }
        } catch (error) {
            console.error('개인 채널 삭제 오류:', error);
        }

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

