const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const StockMarket = require('../systems/StockMarket');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('주식')
        .setDescription('주식 관련 명령어')
        .addSubcommand(subcommand =>
            subcommand
                .setName('시장')
                .setDescription('주식 시장 현황을 확인합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('매수')
                .setDescription('주식을 매수합니다')
                .addStringOption(option =>
                    option.setName('종목')
                        .setDescription('매수할 주식 종목 코드')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('수량')
                        .setDescription('매수할 주식 수량')
                        .setRequired(true)
                        .setMinValue(1)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('매도')
                .setDescription('주식을 매도합니다')
                .addStringOption(option =>
                    option.setName('종목')
                        .setDescription('매도할 주식 종목 코드')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('수량')
                        .setDescription('매도할 주식 수량')
                        .setRequired(true)
                        .setMinValue(1)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('포트폴리오')
                .setDescription('내 주식 포트폴리오를 확인합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('정보')
                .setDescription('특정 주식의 상세 정보를 확인합니다')
                .addStringOption(option =>
                    option.setName('종목')
                        .setDescription('정보를 볼 주식 종목 코드')
                        .setRequired(true))),

    async execute(interaction, db) {
        const stockMarket = new StockMarket(db);
        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case '시장':
                    await this.handleMarket(interaction, stockMarket);
                    break;
                case '매수':
                    await this.handleBuy(interaction, stockMarket);
                    break;
                case '매도':
                    await this.handleSell(interaction, stockMarket);
                    break;
                case '포트폴리오':
                    await this.handlePortfolio(interaction, stockMarket);
                    break;
                case '정보':
                    await this.handleInfo(interaction, stockMarket);
                    break;
            }
        } catch (error) {
            console.error('주식 명령어 오류:', error);
            await interaction.reply({ 
                content: '주식 명령어 실행 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleMarket(interaction, stockMarket) {
        const marketData = await stockMarket.getMarketData();
        const topMovers = await stockMarket.getTopMovers();

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📈 주식 시장 현황')
            .setTimestamp();

        // 상승폭 상위 종목
        if (topMovers.gainers.length > 0) {
            const gainersText = topMovers.gainers.map(stock => 
                `${stock.name} (${stock.symbol}): ${stock.current_price.toLocaleString()}원 (+${stock.change_percent.toFixed(2)}%)`
            ).join('\n');
            
            embed.addFields({
                name: '📈 상승률 TOP 5',
                value: gainersText,
                inline: false
            });
        }

        // 하락폭 상위 종목
        if (topMovers.losers.length > 0) {
            const losersText = topMovers.losers.map(stock => 
                `${stock.name} (${stock.symbol}): ${stock.current_price.toLocaleString()}원 (${stock.change_percent.toFixed(2)}%)`
            ).join('\n');
            
            embed.addFields({
                name: '📉 하락률 TOP 5',
                value: losersText,
                inline: false
            });
        }

        // 전체 종목 요약
        const allStocksText = marketData.slice(0, 10).map(stock => {
            const changeIcon = stock.change_percent >= 0 ? '📈' : '📉';
            const changeText = stock.change_percent >= 0 ? `+${stock.change_percent.toFixed(2)}%` : `${stock.change_percent.toFixed(2)}%`;
            return `${changeIcon} ${stock.name}: ${stock.current_price.toLocaleString()}원 (${changeText})`;
        }).join('\n');

        embed.addFields({
            name: '📊 주요 종목',
            value: allStocksText,
            inline: false
        });

        await interaction.reply({ embeds: [embed] });
    },

    async handleBuy(interaction, stockMarket) {
        const symbol = interaction.options.getString('종목').toUpperCase();
        const quantity = interaction.options.getInteger('수량');
        const userId = interaction.user.id;

        const result = await stockMarket.buyStock(userId, symbol, quantity);

        const embed = new EmbedBuilder()
            .setColor(result.success ? '#00ff00' : '#ff0000')
            .setTitle(result.success ? '✅ 매수 완료' : '❌ 매수 실패')
            .setDescription(result.message);

        if (result.success) {
            embed.addFields({
                name: '거래 정보',
                value: `총 구매금액: ${result.totalCost.toLocaleString()}원`,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleSell(interaction, stockMarket) {
        const symbol = interaction.options.getString('종목').toUpperCase();
        const quantity = interaction.options.getInteger('수량');
        const userId = interaction.user.id;

        const result = await stockMarket.sellStock(userId, symbol, quantity);

        const embed = new EmbedBuilder()
            .setColor(result.success ? '#00ff00' : '#ff0000')
            .setTitle(result.success ? '✅ 매도 완료' : '❌ 매도 실패')
            .setDescription(result.message);

        if (result.success) {
            const profitColor = result.profit >= 0 ? '+' : '';
            embed.addFields({
                name: '거래 정보',
                value: `총 매도금액: ${result.totalRevenue.toLocaleString()}원\n손익: ${profitColor}${result.profit.toLocaleString()}원`,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handlePortfolio(interaction, stockMarket) {
        const userId = interaction.user.id;
        const portfolio = await stockMarket.getPortfolio(userId);

        if (!portfolio || portfolio.stocks.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#ffff00')
                .setTitle('📊 내 포트폴리오')
                .setDescription('보유한 주식이 없습니다.');

            await interaction.reply({ embeds: [embed] });
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📊 내 포트폴리오')
            .setTimestamp();

        // 포트폴리오 요약
        const summaryColor = portfolio.summary.totalProfitLoss >= 0 ? '+' : '';
        embed.addFields({
            name: '💼 포트폴리오 요약',
            value: [
                `총 평가금액: ${portfolio.summary.totalValue.toLocaleString()}원`,
                `총 투자금액: ${portfolio.summary.totalPurchaseValue.toLocaleString()}원`,
                `총 손익: ${summaryColor}${portfolio.summary.totalProfitLoss.toLocaleString()}원 (${portfolio.summary.totalProfitRate.toFixed(2)}%)`
            ].join('\n'),
            inline: false
        });

        // 보유 종목 목록
        const stocksText = portfolio.stocks.map(stock => {
            const profitColor = stock.profit_loss >= 0 ? '+' : '';
            return [
                `**${stock.name} (${stock.stock_symbol})**`,
                `보유: ${stock.quantity}주 | 현재가: ${stock.current_price.toLocaleString()}원`,
                `평가금액: ${stock.current_value.toLocaleString()}원`,
                `손익: ${profitColor}${stock.profit_loss.toLocaleString()}원 (${stock.profit_rate.toFixed(2)}%)`
            ].join('\n');
        }).join('\n\n');

        embed.addFields({
            name: '📈 보유 종목',
            value: stocksText.length > 1024 ? stocksText.substring(0, 1020) + '...' : stocksText,
            inline: false
        });

        await interaction.reply({ embeds: [embed] });
    },

    async handleInfo(interaction, stockMarket) {
        const symbol = interaction.options.getString('종목').toUpperCase();
        const stockInfo = await stockMarket.getStockInfo(symbol);

        if (!stockInfo) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ 오류')
                .setDescription('해당 주식을 찾을 수 없습니다.');

            await interaction.reply({ embeds: [embed] });
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`📊 ${stockInfo.name} (${stockInfo.symbol})`)
            .setTimestamp();

        const changeIcon = stockInfo.change_percent >= 0 ? '📈' : '📉';
        const changeText = stockInfo.change_percent >= 0 ? `+${stockInfo.change_percent.toFixed(2)}%` : `${stockInfo.change_percent.toFixed(2)}%`;

        embed.addFields(
            {
                name: '💰 현재가',
                value: `${stockInfo.current_price.toLocaleString()}원`,
                inline: true
            },
            {
                name: '📊 등락률',
                value: `${changeIcon} ${changeText}`,
                inline: true
            },
            {
                name: '🏭 섹터',
                value: stockInfo.sector,
                inline: true
            }
        );

        // 최근 거래 내역
        if (stockInfo.recentTrades && stockInfo.recentTrades.length > 0) {
            const tradesText = stockInfo.recentTrades.slice(0, 5).map(trade => {
                const tradeType = trade.type === 'buy' ? '매수' : '매도';
                const time = new Date(trade.timestamp).toLocaleString('ko-KR');
                return `${trade.username}: ${tradeType} ${trade.quantity}주 @ ${trade.price.toLocaleString()}원 (${time})`;
            }).join('\n');

            embed.addFields({
                name: '📋 최근 거래',
                value: tradesText,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    }
};

