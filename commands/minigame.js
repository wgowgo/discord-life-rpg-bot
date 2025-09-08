const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const MinigameSystem = require('../systems/MinigameSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('미니게임')
        .setDescription('다양한 미니게임을 즐깁니다')
        .addSubcommand(subcommand =>
            subcommand
                .setName('주사위')
                .setDescription('주사위 게임을 합니다 (회원가입 필요)')
                .addIntegerOption(option =>
                    option.setName('베팅금액')
                        .setDescription('베팅할 금액 (1,000원 ~ 1,000,000원)')
                        .setRequired(true)
                        .setMinValue(1000)
                        .setMaxValue(1000000)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('로또')
                .setDescription('로또를 구매합니다 (회원가입 필요, 10,000원)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('숫자맞추기')
                .setDescription('숫자 맞추기 게임을 시작합니다 (회원가입 필요)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('가위바위보')
                .setDescription('가위바위보 게임을 합니다 (회원가입 필요)')
                .addStringOption(option =>
                    option.setName('선택')
                        .setDescription('가위, 바위, 보 중 선택')
                        .setRequired(true)
                        .addChoices(
                            { name: '✂️ 가위', value: '가위' },
                            { name: '🗿 바위', value: '바위' },
                            { name: '📄 보', value: '보' }
                        ))
                .addIntegerOption(option =>
                    option.setName('베팅금액')
                        .setDescription('베팅할 금액 (1,000원 ~ 500,000원)')
                        .setRequired(true)
                        .setMinValue(1000)
                        .setMaxValue(500000)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('슬롯머신')
                .setDescription('슬롯머신 게임을 합니다 (회원가입 필요)')
                .addIntegerOption(option =>
                    option.setName('베팅금액')
                        .setDescription('베팅할 금액 (5,000원 ~ 100,000원)')
                        .setRequired(true)
                        .setMinValue(5000)
                        .setMaxValue(100000)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('통계')
                .setDescription('내 미니게임 통계를 확인합니다 (회원가입 필요)')),

    async execute(interaction, client) {
        const minigameSystem = client.minigameSystem;
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            switch (subcommand) {
                case '주사위':
                    await this.handleDice(interaction, minigameSystem, userId);
                    break;
                case '로또':
                    await this.handleLotto(interaction, minigameSystem, userId);
                    break;
                case '숫자맞추기':
                    await this.handleNumberGuess(interaction, minigameSystem, userId);
                    break;
                case '가위바위보':
                    await this.handleRockPaperScissors(interaction, minigameSystem, userId);
                    break;
                case '슬롯머신':
                    await this.handleSlotMachine(interaction, minigameSystem, userId);
                    break;
                case '통계':
                    await this.handleStats(interaction, minigameSystem, userId);
                    break;
            }
        } catch (error) {
            console.error('미니게임 명령어 오류:', error);
            await interaction.reply({ 
                content: '미니게임 실행 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleDice(interaction, minigameSystem, userId) {
        const betAmount = interaction.options.getInteger('베팅금액');
        
        const result = await minigameSystem.playDice(userId, betAmount);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#0099ff' : '#ff0000')
            .setTitle('🎲 주사위 게임')
            .setTimestamp();

        if (result.success) {
            const resultColor = result.result === '승리' ? '#00ff00' : 
                               result.result === '패배' ? '#ff0000' : '#ffff00';
            
            embed.setColor(resultColor)
                .addFields(
                    {
                        name: '🎯 결과',
                        value: `당신: ${result.playerDice}\n봇: ${result.botDice}`,
                        inline: true
                    },
                    {
                        name: '🏆 승부',
                        value: result.result,
                        inline: true
                    },
                    {
                        name: '💰 손익',
                        value: result.winAmount >= 0 ? 
                            `+${result.winAmount.toLocaleString()}원` : 
                            `${result.winAmount.toLocaleString()}원`,
                        inline: true
                    }
                );
        } else {
            embed.setDescription(result.message);
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleLotto(interaction, minigameSystem, userId) {
        await interaction.deferReply();
        
        const result = await minigameSystem.playLotto(userId);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#0099ff' : '#ff0000')
            .setTitle('🎫 로또')
            .setTimestamp();

        if (result.success) {
            const winColor = result.prize > 0 ? '#00ff00' : '#ffff00';
            
            embed.setColor(winColor)
                .addFields(
                    {
                        name: '🎯 내 번호',
                        value: result.playerNumbers.join(' - '),
                        inline: false
                    },
                    {
                        name: '🏆 당첨 번호',
                        value: result.winningNumbers.join(' - '),
                        inline: false
                    },
                    {
                        name: '📊 결과',
                        value: `일치 개수: ${result.matches}개\n등급: ${result.rank}`,
                        inline: true
                    }
                );

            if (result.prize > 0) {
                embed.addFields({
                    name: '💰 당첨금',
                    value: `${result.prize.toLocaleString()}원`,
                    inline: true
                });
            }
        } else {
            embed.setDescription(result.message);
        }

        await interaction.editReply({ embeds: [embed] });
    },

    async handleNumberGuess(interaction, minigameSystem, userId) {
        const gameResult = await minigameSystem.startNumberGuess(userId, interaction);
        
        await interaction.reply({ 
            embeds: [gameResult.embed], 
            components: [gameResult.row] 
        });

        // 버튼 상호작용 처리
        const filter = i => i.user.id === userId && i.customId.startsWith('number_');
        const collector = interaction.channel.createMessageComponentCollector({ 
            filter, 
            time: 300000 // 5분
        });

        collector.on('collect', async i => {
            if (i.customId.includes('quit')) {
                await i.update({ 
                    content: '게임을 포기했습니다.', 
                    embeds: [], 
                    components: [] 
                });
                return;
            }

            // 숫자 입력 모달 (실제로는 간단한 텍스트 입력으로 대체)
            await i.reply({ 
                content: '1부터 100 사이의 숫자를 입력하세요 (다음 메시지로):', 
                ephemeral: true 
            });

            const messageFilter = m => m.author.id === userId && !isNaN(m.content) && 
                                     parseInt(m.content) >= 1 && parseInt(m.content) <= 100;
            
            try {
                const collected = await interaction.channel.awaitMessages({ 
                    filter: messageFilter, 
                    max: 1, 
                    time: 30000 
                });

                const guess = parseInt(collected.first().content);
                const guessResult = await minigameSystem.processNumberGuess(gameResult.gameId, guess);

                if (guessResult.success) {
                    let description = '';
                    let color = '#0099ff';

                    if (guessResult.gameOver) {
                        if (guessResult.won) {
                            description = `🎉 정답입니다! 숫자는 ${guessResult.targetNumber}이었습니다!\n💰 보상: 100,000원을 획득했습니다!`;
                            color = '#00ff00';
                        } else {
                            description = `😢 실패! 정답은 ${guessResult.targetNumber}이었습니다.\n💰 위로금: 10,000원을 받았습니다.`;
                            color = '#ff0000';
                        }
                    } else {
                        description = `${guess}... ${guessResult.hint}\n남은 기회: ${guessResult.maxAttempts - guessResult.attempts}번`;
                    }

                    const resultEmbed = new EmbedBuilder()
                        .setColor(color)
                        .setTitle('🎯 숫자 맞추기 게임')
                        .setDescription(description);

                    if (guessResult.gameOver) {
                        await interaction.editOriginalReply({ 
                            embeds: [resultEmbed], 
                            components: [] 
                        });
                    } else {
                        await interaction.editOriginalReply({ 
                            embeds: [resultEmbed], 
                            components: [gameResult.row] 
                        });
                    }
                }

                collected.first().delete().catch(() => {});

            } catch (error) {
                await i.followUp({ 
                    content: '시간이 초과되었습니다.', 
                    ephemeral: true 
                });
            }
        });
    },

    async handleRockPaperScissors(interaction, minigameSystem, userId) {
        try {
            const choice = interaction.options.getString('선택');
            const betAmount = interaction.options.getInteger('베팅금액');
            
            // 플레이어 존재 확인
            const player = await minigameSystem.db.get('SELECT * FROM players WHERE id = ?', [userId]);
            if (!player) {
                await interaction.reply({ 
                    content: '먼저 게임을 시작해주세요. `/프로필 회원가입` 명령어를 사용하세요.', 
                    ephemeral: true 
                });
                return;
            }
            
            const result = await minigameSystem.playRockPaperScissors(userId, choice, betAmount);
            
            const embed = new EmbedBuilder()
                .setColor(result.success ? '#0099ff' : '#ff0000')
                .setTitle('✂️🗿📄 가위바위보')
                .setTimestamp();

            if (result.success) {
                const resultColor = result.result === '승리' ? '#00ff00' : 
                                   result.result === '패배' ? '#ff0000' : '#ffff00';
                
                const choiceEmojis = { '가위': '✂️', '바위': '🗿', '보': '📄' };
                
                embed.setColor(resultColor)
                    .addFields(
                        {
                            name: '🎯 선택',
                            value: `당신: ${choiceEmojis[result.playerChoice]} ${result.playerChoice}\n봇: ${choiceEmojis[result.botChoice]} ${result.botChoice}`,
                            inline: true
                        },
                        {
                            name: '🏆 결과',
                            value: result.result,
                            inline: true
                        },
                        {
                            name: '💰 손익',
                            value: result.winAmount >= 0 ? 
                                `+${result.winAmount.toLocaleString()}원` : 
                                `${result.winAmount.toLocaleString()}원`,
                            inline: true
                        }
                    );
            } else {
                embed.setDescription(result.message);
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('가위바위보 오류:', error);
            await interaction.reply({ 
                content: '가위바위보 게임 실행 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleSlotMachine(interaction, minigameSystem, userId) {
        try {
            const betAmount = interaction.options.getInteger('베팅금액');
            
            // 플레이어 존재 확인
            const player = await minigameSystem.db.get('SELECT * FROM players WHERE id = ?', [userId]);
            if (!player) {
                await interaction.reply({ 
                    content: '먼저 게임을 시작해주세요. `/프로필 회원가입` 명령어를 사용하세요.', 
                    ephemeral: true 
                });
                return;
            }
            
            const result = await minigameSystem.playSlotMachine(userId, betAmount);
            
            const embed = new EmbedBuilder()
                .setColor(result.success ? '#0099ff' : '#ff0000')
                .setTitle('🎰 슬롯머신')
                .setTimestamp();

            if (result.success) {
                const resultColor = result.winAmount > 0 ? '#00ff00' : '#ff0000';
                
                embed.setColor(resultColor)
                    .addFields(
                        {
                            name: '🎯 결과',
                            value: `${result.reels.join(' | ')}`,
                            inline: false
                        },
                        {
                            name: '🏆 판정',
                            value: result.result,
                            inline: true
                        },
                        {
                            name: '💰 손익',
                            value: result.winAmount >= 0 ? 
                                `+${result.winAmount.toLocaleString()}원` : 
                                `${result.winAmount.toLocaleString()}원`,
                            inline: true
                        }
                    );

                if (result.multiplier > 0) {
                    embed.addFields({
                        name: '📊 배수',
                        value: `${result.multiplier}x`,
                        inline: true
                    });
                }
            } else {
                embed.setDescription(result.message);
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('슬롯머신 오류:', error);
            await interaction.reply({ 
                content: '슬롯머신 게임 실행 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleStats(interaction, minigameSystem, userId) {
        const stats = await minigameSystem.getGameStats(userId);
        const player = await minigameSystem.db.get('SELECT username FROM players WHERE id = ?', [userId]);
        
        if (!stats || !player) {
            await interaction.reply({ 
                content: '통계를 불러올 수 없습니다.', 
                ephemeral: true 
            });
            return;
        }

        const embed = minigameSystem.createGameStatsEmbed(stats, player.username);
        await interaction.reply({ embeds: [embed] });
    }
};

