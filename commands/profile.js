const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Player = require('../systems/Player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('프로필')
        .setDescription('프로필 관련 명령어')
        .addSubcommand(subcommand =>
            subcommand
                .setName('회원가입')
                .setDescription('게임에 참여하기 위해 회원가입합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('확인')
                .setDescription('내 프로필을 확인합니다')
                .addUserOption(option =>
                    option.setName('유저')
                        .setDescription('프로필을 볼 유저 (기본값: 자신)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('초기화')
                .setDescription('내 프로필 데이터를 초기화합니다')),

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const player = client.player;

        try {
            switch (subcommand) {
                case '회원가입':
                    await this.handleRegisterProfile(interaction, client);
                    break;
                case '확인':
                    await this.handleViewProfile(interaction, client);
                    break;
                case '초기화':
                    await this.handleResetProfile(interaction, client, userId);
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

    async handleRegisterProfile(interaction, client) {
        const targetUser = interaction.user;
        const player = client.player;

        try {
            // 먼저 기존 플레이어가 있는지 직접 확인
            const existingPlayer = await client.db.get(`
                SELECT * FROM players WHERE id = ?
            `, [targetUser.id]);
            
            // 이미 등록된 플레이어인 경우
            if (existingPlayer) {
                const embed = new (require('discord.js').EmbedBuilder)()
                    .setColor(0xff6b6b) // 빨간색
                    .setTitle('❌ 이미 회원가입된 계정')
                    .setDescription(`${targetUser.displayName || targetUser.username}님은 이미 회원가입된 계정입니다.`)
                    .addFields({
                        name: '💡 도움말',
                        value: '프로필을 확인하려면 `/프로필` 명령어를 사용하세요.',
                        inline: false
                    })
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            // 새 플레이어인 경우 - 프로필 생성
            console.log(`새 플레이어 생성 시도 - 사용자: ${targetUser.username} (${targetUser.id})`);
            
            const profileData = await player.getProfile(
                targetUser.id, 
                targetUser.displayName || targetUser.username,
                true // 새 플레이어 생성
            );
            
            if (!profileData) {
                console.log(`프로필 생성 실패 - 사용자: ${targetUser.username}`);
                await interaction.reply({ 
                    content: '프로필을 생성할 수 없습니다. 나중에 다시 시도해주세요.', 
                    ephemeral: true 
                });
                return;
            }

            const isNewPlayer = profileData.isNewPlayer || false;
            
            console.log(`회원가입 체크 - 사용자: ${targetUser.username}, isNewPlayer: ${isNewPlayer}`);
            console.log(`플레이어 데이터:`, profileData.player ? '존재함' : '없음');
            
            // 프로필 임베드 생성
            const embed = await player.createProfileEmbed(profileData);

            // 새 플레이어인 경우 회원가입 완료 메시지 추가
            if (isNewPlayer) {
                embed.setTitle('🎉 회원가입 완료!');
                embed.setDescription('**Discord Life RPG에 오신 것을 환영합니다!**\n\n' + 
                                   '새로운 캐릭터가 생성되었습니다. 이제 게임을 시작할 수 있습니다!');
                embed.addFields(
                    {
                        name: '🚀 다음 단계',
                        value: '1. **`/직업 목록`** - 직업 구하기\n2. **`/직업 급여`** - 일주일에 한번 주급 받기\n3. **`/도움말`** - 게임 가이드 보기\n4. **`/상점 목록`** - 아이템 구매\n5. **`/미니게임`** - 재미있는 게임\n6. **채팅** - 돈과 경험치 획득',
                        inline: false
                    },
                    {
                        name: '💡 팁',
                        value: '• 개인 채널에서 더 자세한 가이드를 확인하세요!\n• 직업을 구하면 일주일에 한번 주급을 받을 수 있습니다!\n• 매일 로그인하면 보너스를 받을 수 있습니다!',
                        inline: false
                    }
                );
                embed.setColor(0x00FF00); // 초록색
            } else {
                embed.setTitle('👤 프로필 정보');
                embed.setDescription('이미 회원가입된 계정입니다.');
                embed.setColor(0x5865F2); // Discord 블루
            }

            // 먼저 프로필 응답
            await interaction.reply({ embeds: [embed] });

            // 새 플레이어인 경우 개인 채널 생성
            if (isNewPlayer && client.personalChannelSystem) {
                try {
                    const personalChannel = await client.personalChannelSystem.createPersonalChannel(
                        interaction.guildId,
                        targetUser.id,
                        targetUser.displayName || targetUser.username
                    );

                    if (personalChannel) {
                        console.log(`새 플레이어 ${targetUser.username}의 개인 채널 생성됨: ${personalChannel.name}`);
                        
                        // 개인 채널 생성 완료 안내
                        setTimeout(async () => {
                            try {
                                const followUpEmbed = new EmbedBuilder()
                                    .setTitle('🎯 개인 채널 생성 완료!')
                                    .setDescription(`**${personalChannel.name}** 채널이 생성되었습니다!\n\n` +
                                                   '이 채널에서 더 자세한 게임 가이드와 개인 통계를 확인할 수 있습니다.')
                                    .addFields(
                                        {
                                            name: '📋 개인 채널 기능',
                                            value: '• 상세한 게임 가이드\n• 개인 통계 및 성취도\n• 개인 설정 및 알림\n• 게임 팁 및 공략',
                                            inline: false
                                        }
                                    )
                                    .setColor(0x9932CC)
                                    .setTimestamp();

                                await interaction.followUp({ 
                                    embeds: [followUpEmbed], 
                                    ephemeral: true 
                                });
                            } catch (error) {
                                console.error('개인 채널 안내 메시지 오류:', error);
                            }
                        }, 2000); // 2초 후 전송
                    }
                } catch (error) {
                    console.error('개인 채널 생성 오류:', error);
                }
            }

        } catch (error) {
            console.error('회원가입 오류:', error);
            await interaction.reply({ 
                content: '회원가입 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleViewProfile(interaction, client) {
        const targetUser = interaction.options.getUser('유저') || interaction.user;
        const player = client.player;

        try {
            // 프로필 데이터 가져오기 (기존 플레이어만)
            const profileData = await player.getProfile(
                targetUser.id, 
                targetUser.displayName || targetUser.username,
                false // 새 플레이어 생성하지 않음
            );
            
            if (!profileData) {
                await interaction.reply({ 
                    content: '등록된 프로필이 없습니다. `/프로필 회원가입` 명령어로 먼저 회원가입해주세요.', 
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

    async handleResetProfile(interaction, client, userId) {
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
            flags: 64 // MessageFlags.Ephemeral
        });

        // 버튼 상호작용 수집기
        const collector = interaction.channel.createMessageComponentCollector({
            filter: (btnInteraction) => btnInteraction.user.id === userId,
            time: 60000 // 1분
        });

        collector.on('collect', async (btnInteraction) => {
            if (btnInteraction.customId === 'reset_confirm') {
                // 2단계 확인: 채팅으로 "프로필초기화" 입력 요구
                const secondConfirmEmbed = new EmbedBuilder()
                    .setColor(0xFF4444)
                    .setTitle('⚠️ 최종 확인 필요')
                    .setDescription('**정말로 초기화하시겠습니까?**\n\n' +
                                   '이번이 **마지막 기회**입니다!\n' +
                                   '정말로 초기화하려면 아래 문구를 **정확히** 입력해주세요:\n\n' +
                                   '**`프로필초기화`**\n\n' +
                                   '⏰ **30초 내에 입력하지 않으면 자동으로 취소됩니다.**')
                    .setFooter({ text: '이 작업은 되돌릴 수 없습니다!' });

                await btnInteraction.update({
                    embeds: [secondConfirmEmbed],
                    components: []
                });

                // 채팅 메시지 수집기 (30초)
                const messageCollector = interaction.channel.createMessageCollector({
                    filter: (message) => message.author.id === userId && message.content === '프로필초기화',
                    time: 30000, // 30초
                    max: 1
                });

                messageCollector.on('collect', async (message) => {
                    try {
                        await this.performDataReset(client, userId, interaction);
                        
                        const successEmbed = new EmbedBuilder()
                            .setColor(0x4CAF50)
                            .setTitle('✅ 초기화 완료')
                            .setDescription('프로필 데이터가 성공적으로 초기화되었습니다!\n\n' +
                                           '**다음이 완료되었습니다:**\n' +
                                           '• 기존 개인 채널 삭제\n' +
                                           '• 모든 게임 데이터 초기화\n' +
                                           '• 새로운 캐릭터 생성\n\n' +
                                           '`/프로필 회원가입` 명령어로 새 캐릭터를 확인하고 개인 채널을 다시 생성하세요! 🎮')
                            .addFields(
                                {
                                    name: '🚀 다음 단계',
                                    value: '1. `/프로필 회원가입` - 새 캐릭터 확인 및 개인 채널 생성\n2. `/직업 목록` - 직업 구하기\n3. `/도움말` - 게임 가이드 보기',
                                    inline: false
                                }
                            )
                            .setFooter({ text: '새로운 모험을 시작해보세요!' });

                        await interaction.editReply({
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

                        await interaction.editReply({
                            embeds: [errorEmbed],
                            components: []
                        });
                    }
                });

                messageCollector.on('end', async (collected) => {
                    if (collected.size === 0) {
                        const timeoutEmbed = new EmbedBuilder()
                            .setColor(0x808080)
                            .setTitle('⏰ 시간 초과')
                            .setDescription('30초 내에 확인 문구를 입력하지 않아 초기화가 취소되었습니다.')
                            .setTimestamp();
                        
                        await interaction.editReply({
                            embeds: [timeoutEmbed],
                            components: []
                        });
                    }
                });
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


    async performDataReset(client, userId, interaction) {
        // 기존 개인 채널 삭제
        try {
            const PersonalChannelSystem = require('../systems/PersonalChannelSystem');
            const existingChannel = await client.personalChannelSystem.findPersonalChannel(interaction.guild.id, userId);
            
            if (existingChannel) {
                await existingChannel.delete('프로필 초기화로 인한 개인 채널 삭제');
                console.log(`기존 개인 채널 삭제됨: ${existingChannel.name} (${userId})`);
            }
        } catch (error) {
            console.error('개인 채널 삭제 오류:', error);
        }

        // 모든 플레이어 관련 데이터 삭제 (실제 존재하는 테이블만)
        const tablesToReset = [
            { table: 'player_achievements', column: 'player_id' },
            { table: 'player_titles', column: 'player_id' },
            { table: 'player_inventory', column: 'player_id' },
            { table: 'player_pets', column: 'player_id' },
            { table: 'player_properties', column: 'player_id' },
            { table: 'player_stocks', column: 'player_id' },
            { table: 'player_jobs', column: 'player_id' },
            { table: 'player_dungeon_clears', column: 'player_id' },
            { table: 'player_challenges', column: 'player_id' },
            { table: 'player_businesses', column: 'player_id' },
            { table: 'player_education', column: 'player_id' },
            { table: 'chat_activity', column: 'player_id' },
            { table: 'voice_activity', column: 'player_id' },
            { table: 'transactions', column: 'player_id' },
            { table: 'player_stats', column: 'player_id' },
            { table: 'players', column: 'id' }
        ];

        for (const { table, column } of tablesToReset) {
            try {
                await client.db.run(`DELETE FROM ${table} WHERE ${column} = ?`, [userId]);
            } catch (error) {
                console.error(`${table} 테이블 초기화 오류:`, error);
            }
        }

        // friendships와 marriages 테이블은 두 컬럼 모두 확인
        try {
            await client.db.run(`DELETE FROM friendships WHERE player1_id = ? OR player2_id = ?`, [userId, userId]);
        } catch (error) {
            console.error('friendships 테이블 초기화 오류:', error);
        }

        try {
            await client.db.run(`DELETE FROM marriages WHERE player1_id = ? OR player2_id = ?`, [userId, userId]);
        } catch (error) {
            console.error('marriages 테이블 초기화 오류:', error);
        }

        // 기존 플레이어가 완전히 삭제되었는지 확인
        try {
            const existingPlayer = await client.db.get('SELECT * FROM players WHERE id = ?', [userId]);
            if (existingPlayer) {
                // 기존 플레이어가 남아있다면 강제 삭제
                await client.db.run('DELETE FROM players WHERE id = ?', [userId]);
                console.log(`기존 플레이어 ${userId} 강제 삭제 완료`);
            }
            
            // 새로운 플레이어는 생성하지 않음 (회원가입 시에만 생성)
            console.log(`플레이어 ${userId} 초기화 완료 - 회원가입 대기 중`);
        } catch (error) {
            console.error('플레이어 초기화 오류:', error);
            throw error;
        }
    }
};

