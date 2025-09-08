const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const GamblingSystem = require('../systems/GamblingSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('도박')
        .setDescription('다양한 도박 게임을 즐길 수 있습니다')
        .addSubcommand(subcommand =>
            subcommand
                .setName('동전던지기')
                .setDescription('동전을 던져 앞면/뒷면을 맞춥니다 (1:1 배당)')
                .addIntegerOption(option =>
                    option.setName('베팅금액')
                        .setDescription('베팅할 금액 (100원 ~ 100,000원)')
                        .setRequired(true)
                        .setMinValue(100)
                        .setMaxValue(100000))
                .addStringOption(option =>
                    option.setName('선택')
                        .setDescription('앞면 또는 뒷면 선택')
                        .setRequired(true)
                        .addChoices(
                            { name: '앞면', value: '앞면' },
                            { name: '뒷면', value: '뒷면' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('주사위')
                .setDescription('주사위를 굴려 숫자를 맞춥니다 (5:1 배당)')
                .addIntegerOption(option =>
                    option.setName('베팅금액')
                        .setDescription('베팅할 금액 (100원 ~ 100,000원)')
                        .setRequired(true)
                        .setMinValue(100)
                        .setMaxValue(100000))
                .addIntegerOption(option =>
                    option.setName('숫자')
                        .setDescription('맞출 숫자 (1-6)')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(6)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('슬롯머신')
                .setDescription('슬롯머신을 돌려 심볼을 맞춥니다')
                .addIntegerOption(option =>
                    option.setName('베팅금액')
                        .setDescription('베팅할 금액 (100원 ~ 100,000원)')
                        .setRequired(true)
                        .setMinValue(100)
                        .setMaxValue(100000)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('카드게임')
                .setDescription('블랙잭 스타일 카드 게임을 합니다')
                .addIntegerOption(option =>
                    option.setName('베팅금액')
                        .setDescription('베팅할 금액 (100원 ~ 100,000원)')
                        .setRequired(true)
                        .setMinValue(100)
                        .setMaxValue(100000)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('통계')
                .setDescription('내 도박 통계를 확인합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('순위')
                .setDescription('도박 순위를 확인합니다')),

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const gamblingSystem = client.gamblingSystem;

        try {
            switch (subcommand) {
                case '동전던지기':
                    await this.handleCoinFlip(interaction, gamblingSystem, userId);
                    break;
                case '주사위':
                    await this.handleDiceRoll(interaction, gamblingSystem, userId);
                    break;
                case '슬롯머신':
                    await this.handleSlotMachine(interaction, gamblingSystem, userId);
                    break;
                case '카드게임':
                    await this.handleCardGame(interaction, gamblingSystem, userId);
                    break;
                case '통계':
                    await this.handleStats(interaction, gamblingSystem, userId);
                    break;
                case '순위':
                    await this.handleRankings(interaction, gamblingSystem);
                    break;
            }
        } catch (error) {
            console.error('도박 명령어 오류:', error);
            await interaction.reply({ 
                content: '도박 명령어 실행 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleCoinFlip(interaction, gamblingSystem, userId) {
        const betAmount = interaction.options.getInteger('베팅금액');
        const choice = interaction.options.getString('선택');

        const result = await gamblingSystem.coinFlip(userId, betAmount, choice);

        if (!result.success) {
            await interaction.reply({ 
                content: result.message, 
                ephemeral: true 
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(result.won ? 0x00FF00 : 0xFF0000)
            .setTitle('🪙 동전 던지기 결과')
            .setDescription(`**${result.result}**이(가) 나왔습니다!`)
            .addFields(
                { name: '🎯 당신의 선택', value: result.choice, inline: true },
                { name: '💰 베팅 금액', value: `${betAmount.toLocaleString()}원`, inline: true },
                { name: '🏆 결과', value: result.won ? '승리!' : '패배...', inline: true }
            );

        if (result.won) {
            embed.addFields(
                { name: '🎉 획득 금액', value: `+${result.winAmount.toLocaleString()}원`, inline: true },
                { name: '💳 현재 자산', value: `${result.newMoney.toLocaleString()}원`, inline: true }
            );
        } else {
            embed.addFields(
                { name: '💸 손실 금액', value: `-${betAmount.toLocaleString()}원`, inline: true },
                { name: '💳 현재 자산', value: `${result.newMoney.toLocaleString()}원`, inline: true }
            );
        }

        embed.setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async handleDiceRoll(interaction, gamblingSystem, userId) {
        const betAmount = interaction.options.getInteger('베팅금액');
        const guess = interaction.options.getInteger('숫자');

        const result = await gamblingSystem.diceRoll(userId, betAmount, guess);

        if (!result.success) {
            await interaction.reply({ 
                content: result.message, 
                ephemeral: true 
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(result.won ? 0x00FF00 : 0xFF0000)
            .setTitle('🎲 주사위 게임 결과')
            .setDescription(`**${result.result}**이(가) 나왔습니다!`)
            .addFields(
                { name: '🎯 당신의 예측', value: result.guess.toString(), inline: true },
                { name: '💰 베팅 금액', value: `${betAmount.toLocaleString()}원`, inline: true },
                { name: '🏆 결과', value: result.won ? '승리!' : '패배...', inline: true }
            );

        if (result.won) {
            embed.addFields(
                { name: '🎉 획득 금액', value: `+${result.winAmount.toLocaleString()}원 (5:1 배당)`, inline: true },
                { name: '💳 현재 자산', value: `${result.newMoney.toLocaleString()}원`, inline: true }
            );
        } else {
            embed.addFields(
                { name: '💸 손실 금액', value: `-${betAmount.toLocaleString()}원`, inline: true },
                { name: '💳 현재 자산', value: `${result.newMoney.toLocaleString()}원`, inline: true }
            );
        }

        embed.setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async handleSlotMachine(interaction, gamblingSystem, userId) {
        const betAmount = interaction.options.getInteger('베팅금액');

        const result = await gamblingSystem.slotMachine(userId, betAmount);

        if (!result.success) {
            await interaction.reply({ 
                content: result.message, 
                ephemeral: true 
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(result.won ? 0x00FF00 : 0xFF0000)
            .setTitle('🎰 슬롯머신 결과')
            .setDescription(`**${result.reels.join(' | ')}**`)
            .addFields(
                { name: '💰 베팅 금액', value: `${betAmount.toLocaleString()}원`, inline: true },
                { name: '🏆 결과', value: result.won ? '승리!' : '패배...', inline: true }
            );

        if (result.won) {
            embed.addFields(
                { name: '🎉 획득 금액', value: `+${result.winAmount.toLocaleString()}원`, inline: true },
                { name: '📈 배수', value: `${result.multiplier}배`, inline: true },
                { name: '💳 현재 자산', value: `${result.newMoney.toLocaleString()}원`, inline: true }
            );
        } else {
            embed.addFields(
                { name: '💸 손실 금액', value: `-${betAmount.toLocaleString()}원`, inline: true },
                { name: '💳 현재 자산', value: `${result.newMoney.toLocaleString()}원`, inline: true }
            );
        }

        embed.setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async handleCardGame(interaction, gamblingSystem, userId) {
        const betAmount = interaction.options.getInteger('베팅금액');

        const result = await gamblingSystem.cardGame(userId, betAmount);

        if (!result.success) {
            await interaction.reply({ 
                content: result.message, 
                ephemeral: true 
            });
            return;
        }

        const playerCardsText = result.playerCards.map(card => `${card.rank}${card.suit}`).join(' ');
        const dealerCardsText = result.dealerCards.map(card => `${card.rank}${card.suit}`).join(' ');

        const embed = new EmbedBuilder()
            .setColor(result.winAmount > betAmount ? 0x00FF00 : result.winAmount === betAmount ? 0xFFFF00 : 0xFF0000)
            .setTitle('🃏 카드 게임 결과')
            .setDescription(`**${result.result}**`)
            .addFields(
                { name: '🃏 당신의 카드', value: `${playerCardsText} (${result.playerValue})`, inline: false },
                { name: '🃏 딜러의 카드', value: `${dealerCardsText} (${result.dealerValue})`, inline: false },
                { name: '💰 베팅 금액', value: `${betAmount.toLocaleString()}원`, inline: true },
                { name: '🏆 결과', value: result.result, inline: true }
            );

        if (result.winAmount > betAmount) {
            embed.addFields(
                { name: '🎉 획득 금액', value: `+${result.winAmount.toLocaleString()}원`, inline: true },
                { name: '💳 현재 자산', value: `${result.newMoney.toLocaleString()}원`, inline: true }
            );
        } else if (result.winAmount === betAmount) {
            embed.addFields(
                { name: '🤝 무승부', value: '베팅 금액 반환', inline: true },
                { name: '💳 현재 자산', value: `${result.newMoney.toLocaleString()}원`, inline: true }
            );
        } else {
            embed.addFields(
                { name: '💸 손실 금액', value: `-${betAmount.toLocaleString()}원`, inline: true },
                { name: '💳 현재 자산', value: `${result.newMoney.toLocaleString()}원`, inline: true }
            );
        }

        embed.setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async handleStats(interaction, gamblingSystem, userId) {
        const stats = await gamblingSystem.getGamblingStats(userId);

        const winRate = stats.total_games > 0 ? ((stats.wins / stats.total_games) * 100).toFixed(1) : 0;
        const netResult = stats.total_win;

        const embed = new EmbedBuilder()
            .setColor(netResult >= 0 ? 0x00FF00 : 0xFF0000)
            .setTitle('📊 도박 통계')
            .setDescription(`${interaction.user.displayName}님의 도박 기록입니다`)
            .addFields(
                { name: '🎮 총 게임 수', value: `${stats.total_games}게임`, inline: true },
                { name: '🏆 승리 횟수', value: `${stats.wins}회`, inline: true },
                { name: '💔 패배 횟수', value: `${stats.losses}회`, inline: true },
                { name: '📈 승률', value: `${winRate}%`, inline: true },
                { name: '💰 총 베팅 금액', value: `${stats.total_bet.toLocaleString()}원`, inline: true },
                { name: '💎 순수익', value: `${netResult >= 0 ? '+' : ''}${netResult.toLocaleString()}원`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async handleRankings(interaction, gamblingSystem) {
        const rankings = await gamblingSystem.getGamblingRankings(10);

        if (rankings.length === 0) {
            await interaction.reply({ 
                content: '아직 도박 기록이 없습니다.', 
                ephemeral: true 
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(0x9932CC)
            .setTitle('🏆 도박 순위')
            .setDescription('순수익 기준 상위 10명입니다')
            .setTimestamp();

        let description = '';
        for (let i = 0; i < rankings.length; i++) {
            const rank = i + 1;
            const player = rankings[i];
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
            
            description += `${medal} **${player.username}** - ${player.total_win >= 0 ? '+' : ''}${player.total_win.toLocaleString()}원 (${player.total_games}게임)\n`;
        }

        embed.setDescription(description);

        await interaction.reply({ embeds: [embed] });
    }
};
