const { SlashCommandBuilder } = require('discord.js');
const PropertySystem = require('../systems/PropertySystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('부동산')
        .setDescription('부동산 관련 명령어')
        .addSubcommand(subcommand =>
            subcommand
                .setName('시장')
                .setDescription('부동산 시장을 확인합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('구매')
                .setDescription('부동산을 구매합니다')
                .addIntegerOption(option =>
                    option.setName('부동산id')
                        .setDescription('구매할 부동산의 ID')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('매각')
                .setDescription('부동산을 매각합니다')
                .addIntegerOption(option =>
                    option.setName('부동산id')
                        .setDescription('매각할 부동산의 ID')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('포트폴리오')
                .setDescription('내 부동산 포트폴리오를 확인합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('임대료')
                .setDescription('이번 달 임대료를 수령합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('업그레이드')
                .setDescription('부동산을 업그레이드합니다')
                .addIntegerOption(option =>
                    option.setName('부동산id')
                        .setDescription('업그레이드할 부동산의 ID')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('랭킹')
                .setDescription('부동산 보유 랭킹을 확인합니다')),

    async execute(interaction, db) {
        const propertySystem = new PropertySystem(db);
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        // 부동산 시스템 초기화 (최초 1회)
        await propertySystem.initializePropertySystem();

        try {
            switch (subcommand) {
                case '시장':
                    await this.handleMarket(interaction, propertySystem);
                    break;
                case '구매':
                    await this.handleBuy(interaction, propertySystem, userId);
                    break;
                case '매각':
                    await this.handleSell(interaction, propertySystem, userId);
                    break;
                case '포트폴리오':
                    await this.handlePortfolio(interaction, propertySystem, userId);
                    break;
                case '임대료':
                    await this.handleRent(interaction, propertySystem, userId);
                    break;
                case '업그레이드':
                    await this.handleUpgrade(interaction, propertySystem, userId);
                    break;
                case '랭킹':
                    await this.handleRanking(interaction, propertySystem);
                    break;
            }
        } catch (error) {
            console.error('부동산 명령어 오류:', error);
            await interaction.reply({ 
                content: '부동산 명령어 실행 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleMarket(interaction, propertySystem) {
        const properties = await propertySystem.getPropertyMarket();
        const embed = propertySystem.createMarketEmbed(properties);
        
        await interaction.reply({ embeds: [embed] });
    },

    async handleBuy(interaction, propertySystem, userId) {
        const propertyId = interaction.options.getInteger('부동산id');
        
        const result = await propertySystem.buyProperty(userId, propertyId);
        
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor(result.success ? '#00ff00' : '#ff0000')
            .setTitle(result.success ? '🏠 부동산 구매 완료!' : '❌ 구매 실패')
            .setDescription(result.message);

        if (result.success) {
            embed.addFields(
                {
                    name: '💰 구매 가격',
                    value: `${result.cost.toLocaleString()}원`,
                    inline: true
                },
                {
                    name: '💸 월 임대료',
                    value: `${result.monthlyIncome.toLocaleString()}원`,
                    inline: true
                }
            );
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleSell(interaction, propertySystem, userId) {
        const propertyId = interaction.options.getInteger('부동산id');
        
        const result = await propertySystem.sellProperty(userId, propertyId);
        
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor(result.success ? '#ffff00' : '#ff0000')
            .setTitle(result.success ? '🏠 부동산 매각 완료!' : '❌ 매각 실패')
            .setDescription(result.message);

        if (result.success) {
            const profitColor = result.profit >= 0 ? '+' : '';
            embed.addFields(
                {
                    name: '💰 매각 가격',
                    value: `${result.salePrice.toLocaleString()}원`,
                    inline: true
                },
                {
                    name: '💸 거래 수수료',
                    value: `${result.fee.toLocaleString()}원`,
                    inline: true
                },
                {
                    name: '💵 실수령액',
                    value: `${result.finalAmount.toLocaleString()}원`,
                    inline: true
                },
                {
                    name: '📈 손익',
                    value: `${profitColor}${result.profit.toLocaleString()}원`,
                    inline: true
                }
            );
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handlePortfolio(interaction, propertySystem, userId) {
        const properties = await propertySystem.getPlayerProperties(userId);
        const embed = propertySystem.createPortfolioEmbed(properties);
        
        await interaction.reply({ embeds: [embed] });
    },

    async handleRent(interaction, propertySystem, userId) {
        const result = await propertySystem.collectRent(userId);
        
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor(result.success ? '#00ff00' : '#ff0000')
            .setTitle(result.success ? '💸 임대료 수령 완료!' : '❌ 수령 실패')
            .setDescription(result.success ? 
                `총 ${result.totalRent.toLocaleString()}원의 임대료를 수령했습니다!` : 
                result.message);

        if (result.success && result.properties) {
            const rentText = result.properties.map(property => 
                `${property.name}: ${property.rent.toLocaleString()}원`
            ).join('\n');

            embed.addFields({
                name: '🏠 부동산별 임대료',
                value: rentText,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleUpgrade(interaction, propertySystem, userId) {
        const propertyId = interaction.options.getInteger('부동산id');
        
        const result = await propertySystem.upgradeProperty(userId, propertyId);
        
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor(result.success ? '#00ff00' : '#ff0000')
            .setTitle(result.success ? '⬆️ 부동산 업그레이드 완료!' : '❌ 업그레이드 실패')
            .setDescription(result.message);

        if (result.success) {
            embed.addFields(
                {
                    name: '💰 업그레이드 비용',
                    value: `${result.cost.toLocaleString()}원`,
                    inline: true
                },
                {
                    name: '📈 임대료 변화',
                    value: `${result.oldIncome.toLocaleString()}원 → ${result.newIncome.toLocaleString()}원`,
                    inline: true
                }
            );
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleRanking(interaction, propertySystem) {
        const rankings = await propertySystem.getPropertyRankings();
        
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor('#gold')
            .setTitle('🏆 부동산 보유 랭킹')
            .setTimestamp();

        if (rankings.length === 0) {
            embed.setDescription('아직 부동산을 소유한 플레이어가 없습니다.');
        } else {
            const rankingText = rankings.map((rank, index) => {
                const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
                return [
                    `${medal} **${rank.username}**`,
                    `🏠 보유 부동산: ${rank.property_count}개`,
                    `💰 총 가치: ${rank.total_value.toLocaleString()}원`,
                    `💸 월 임대수익: ${rank.total_monthly_income.toLocaleString()}원`
                ].join('\n');
            }).join('\n\n');
            
            embed.setDescription(rankingText);
        }

        await interaction.reply({ embeds: [embed] });
    }
};

