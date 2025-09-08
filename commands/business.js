const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const BusinessSystem = require('../systems/BusinessSystem');
const PaginationSystem = require('../systems/PaginationSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('사업')
        .setDescription('사업/창업 관련 명령어')
        .addSubcommand(subcommand =>
            subcommand
                .setName('종류')
                .setDescription('창업 가능한 사업 종류를 확인합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('창업')
                .setDescription('새로운 사업을 시작합니다')
                .addIntegerOption(option =>
                    option.setName('사업종류id')
                        .setDescription('시작할 사업 종류의 ID')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('사업명')
                        .setDescription('사업의 이름')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('목록')
                .setDescription('내 사업 목록을 확인합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('직원채용')
                .setDescription('사업에 직원을 채용합니다')
                .addIntegerOption(option =>
                    option.setName('사업id')
                        .setDescription('직원을 채용할 사업의 ID')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('직원수')
                        .setDescription('채용할 직원 수')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(10)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('업그레이드')
                .setDescription('사업을 업그레이드합니다')
                .addIntegerOption(option =>
                    option.setName('사업id')
                        .setDescription('업그레이드할 사업의 ID')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('수익정산')
                .setDescription('이번 달 사업 수익을 정산합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('매각')
                .setDescription('사업을 매각합니다')
                .addIntegerOption(option =>
                    option.setName('사업id')
                        .setDescription('매각할 사업의 ID')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('랭킹')
                .setDescription('사업 수익 랭킹을 확인합니다')),

    async execute(interaction, client) {
        const businessSystem = client.businessSystem;
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            // 종류와 랭킹 명령어는 누구나 사용 가능
            if (subcommand === '종류' || subcommand === '랭킹') {
                // 사업 시스템 초기화 (최초 1회)
                await businessSystem.initializeBusinessTypes();
                
                if (subcommand === '종류') {
                    await this.handleTypes(interaction, businessSystem);
                } else {
                    await this.handleRanking(interaction, businessSystem);
                }
                return;
            }

            // 다른 명령어들은 회원가입 필요
            const player = await db.get('SELECT * FROM players WHERE id = ?', [userId]);
            if (!player) {
                const embed = new (require('discord.js').EmbedBuilder)()
                    .setColor('#ff0000')
                    .setTitle('❌ 회원가입 필요')
                    .setDescription('사업을 운영하려면 먼저 회원가입을 해주세요!')
                    .addFields({
                        name: '💡 도움말',
                        value: '`/프로필 회원가입` 명령어로 회원가입을 진행하세요.',
                        inline: false
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            // 사업 시스템 초기화 (최초 1회)
            await businessSystem.initializeBusinessTypes();

            switch (subcommand) {
                case '창업':
                    await this.handleStart(interaction, businessSystem, userId);
                    break;
                case '목록':
                    await this.handleList(interaction, businessSystem, userId);
                    break;
                case '직원채용':
                    await this.handleHire(interaction, businessSystem, userId);
                    break;
                case '업그레이드':
                    await this.handleUpgrade(interaction, businessSystem, userId);
                    break;
                case '수익정산':
                    await this.handleProfit(interaction, businessSystem, userId);
                    break;
                case '매각':
                    await this.handleSell(interaction, businessSystem, userId);
                    break;
            }
        } catch (error) {
            console.error('사업 명령어 오류:', error);
            await interaction.reply({ 
                content: '사업 명령어 실행 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleTypes(interaction, businessSystem) {
        const businessTypes = await businessSystem.getBusinessTypes();

        if (businessTypes.length === 0) {
            const embed = businessSystem.createBusinessTypesEmbed(businessTypes);
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const paginationSystem = new PaginationSystem();
        const categoryEmojis = {
            'retail': '🏪',
            'restaurant': '🍽️',
            'service': '🔧',
            'tech': '💻',
            'manufacturing': '🏭',
            'entertainment': '🎭',
            'education': '📚',
            'healthcare': '🏥',
            'finance': '💰',
            'real_estate': '🏢'
        };

        const paginatedData = paginationSystem.createPaginatedEmbed(
            businessTypes,
            paginationSystem.formatBusinessType.bind(paginationSystem),
            {
                title: '🏢 사업 종류',
                color: 0x00FF00,
                itemsPerPage: 8,
                category: 'category',
                categoryEmojis: categoryEmojis
            }
        );

        const response = {
            embeds: [paginatedData.embed],
            components: paginatedData.components
        };

        if (paginatedData.components.length > 0) {
            const collector = interaction.channel.createMessageComponentCollector({
                filter: (btnInteraction) => btnInteraction.user.id === interaction.user.id,
                time: 300000
            });

            collector.on('collect', async (btnInteraction) => {
                await paginationSystem.handlePaginationInteraction(
                    btnInteraction, 
                    businessTypes, 
                    paginationSystem.formatBusinessType.bind(paginationSystem),
                    {
                        title: '🏢 사업 종류',
                        color: 0x00FF00,
                        itemsPerPage: 8,
                        category: 'category',
                        categoryEmojis: categoryEmojis
                    }
                );
            });

            collector.on('end', () => {
                const disabledComponents = paginatedData.components.map(row => {
                    return ActionRowBuilder.from(row).setComponents(
                        row.components.map(component => 
                            ButtonBuilder.from(component).setDisabled(true)
                        )
                    );
                });
                
                interaction.editReply({ components: disabledComponents }).catch(() => {});
            });
        }

        await interaction.reply(response);
    },

    async handleStart(interaction, businessSystem, userId) {
        const businessTypeId = interaction.options.getInteger('사업종류id');
        const businessName = interaction.options.getString('사업명');
        
        const result = await businessSystem.startBusiness(userId, businessTypeId, businessName);
        
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor(result.success ? '#00ff00' : '#ff0000')
            .setTitle(result.success ? '🎉 창업 성공!' : '❌ 창업 실패')
            .setDescription(result.message);

        if (result.success) {
            embed.addFields({
                name: '💰 투자 금액',
                value: `${result.cost.toLocaleString()}원`,
                inline: true
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleList(interaction, businessSystem, userId) {
        const businesses = await businessSystem.getBusinessList(userId);
        const embed = businessSystem.createBusinessListEmbed(businesses);
        
        await interaction.reply({ embeds: [embed] });
    },

    async handleHire(interaction, businessSystem, userId) {
        const businessId = interaction.options.getInteger('사업id');
        const staffCount = interaction.options.getInteger('직원수');
        
        const result = await businessSystem.hireStaff(userId, businessId, staffCount);
        
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor(result.success ? '#00ff00' : '#ff0000')
            .setTitle(result.success ? '👥 직원 채용 완료!' : '❌ 채용 실패')
            .setDescription(result.message);

        if (result.success) {
            embed.addFields(
                {
                    name: '💰 채용 비용',
                    value: `${result.cost.toLocaleString()}원`,
                    inline: true
                },
                {
                    name: '👥 총 직원 수',
                    value: `${result.newStaffCount}명`,
                    inline: true
                }
            );
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleUpgrade(interaction, businessSystem, userId) {
        const businessId = interaction.options.getInteger('사업id');
        
        const result = await businessSystem.upgradeBusiness(userId, businessId);
        
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor(result.success ? '#00ff00' : '#ff0000')
            .setTitle(result.success ? '⬆️ 업그레이드 완료!' : '❌ 업그레이드 실패')
            .setDescription(result.message);

        if (result.success) {
            embed.addFields(
                {
                    name: '💰 업그레이드 비용',
                    value: `${result.cost.toLocaleString()}원`,
                    inline: true
                },
                {
                    name: '📊 새 레벨',
                    value: `${result.newLevel}`,
                    inline: true
                }
            );
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleProfit(interaction, businessSystem, userId) {
        const result = await businessSystem.collectMonthlyProfit(userId);
        
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor(result.success ? '#00ff00' : '#ff0000')
            .setTitle(result.success ? '💰 수익 정산 완료!' : '❌ 정산 실패')
            .setDescription(result.success ? 
                `총 ${result.totalProfit.toLocaleString()}원의 수익을 정산했습니다!` : 
                result.message);

        if (result.success && result.businesses) {
            const businessText = result.businesses.map(business => 
                `${business.name}: ${business.profit >= 0 ? '+' : ''}${business.profit.toLocaleString()}원`
            ).join('\n');

            embed.addFields({
                name: '📊 사업별 수익',
                value: businessText,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleSell(interaction, businessSystem, userId) {
        const businessId = interaction.options.getInteger('사업id');
        
        const result = await businessSystem.sellBusiness(userId, businessId);
        
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor(result.success ? '#ffff00' : '#ff0000')
            .setTitle(result.success ? '🏪 사업 매각 완료!' : '❌ 매각 실패')
            .setDescription(result.message);

        if (result.success) {
            embed.addFields({
                name: '💰 매각 대금',
                value: `${result.sellPrice.toLocaleString()}원`,
                inline: true
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleRanking(interaction, businessSystem) {
        const rankings = await businessSystem.getBusinessRankings();
        
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor('#gold')
            .setTitle('🏆 사업 수익 랭킹')
            .setTimestamp();

        if (rankings.length === 0) {
            embed.setDescription('아직 운영 중인 사업이 없습니다.');
        } else {
            const rankingText = rankings.map((rank, index) => {
                const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
                const profitColor = rank.monthly_profit >= 0 ? '+' : '';
                return [
                    `${medal} **${rank.username}** - ${rank.business_name}`,
                    `🏭 ${rank.business_type} (Lv.${rank.level})`,
                    `💰 월수익: ${profitColor}${rank.monthly_profit.toLocaleString()}원`,
                    `⭐ 평판: ${rank.reputation}/100`
                ].join('\n');
            }).join('\n\n');
            
            embed.setDescription(rankingText);
        }

        await interaction.reply({ embeds: [embed] });
    }
};

