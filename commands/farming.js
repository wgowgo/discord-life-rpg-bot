const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const FarmingSystem = require('../systems/FarmingSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('농사')
        .setDescription('농사 관련 명령어')
        .addSubcommand(subcommand =>
            subcommand
                .setName('씨앗구매')
                .setDescription('씨앗을 구매합니다 (회원가입 필요)')
                .addStringOption(option =>
                    option.setName('작물')
                        .setDescription('구매할 작물')
                        .setRequired(true)
                        .addChoices(
                            { name: '밀 (50원)', value: 'wheat' },
                            { name: '감자 (40원)', value: 'potato' },
                            { name: '당근 (35원)', value: 'carrot' },
                            { name: '양파 (42원)', value: 'onion' },
                            { name: '상추 (30원)', value: 'lettuce' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('심기')
                .setDescription('씨앗을 심습니다 (회원가입 필요)')
                .addStringOption(option =>
                    option.setName('작물')
                        .setDescription('심을 작물')
                        .setRequired(true)
                        .addChoices(
                            { name: '밀', value: 'wheat' },
                            { name: '감자', value: 'potato' },
                            { name: '당근', value: 'carrot' },
                            { name: '양파', value: 'onion' },
                            { name: '상추', value: 'lettuce' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('수확')
                .setDescription('작물을 수확합니다 (회원가입 필요)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('농장')
                .setDescription('내 농장 상태를 확인합니다 (회원가입 필요)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('상점')
                .setDescription('씨앗 상점을 확인합니다 (누구나 사용 가능)')),

    async execute(interaction, db) {
        const farmingSystem = new FarmingSystem(db);
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            // 상점 명령어는 누구나 사용 가능
            if (subcommand === '상점') {
                await this.handleShop(interaction, farmingSystem);
                return;
            }

            // 다른 명령어들은 회원가입 필요
            const player = await db.get('SELECT * FROM players WHERE id = ?', [userId]);
            if (!player) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ 회원가입 필요')
                    .setDescription('농사를 하려면 먼저 회원가입을 해주세요!')
                    .addFields({
                        name: '💡 도움말',
                        value: '`/프로필 회원가입` 명령어로 회원가입을 진행하세요.',
                        inline: false
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            switch (subcommand) {
                case '씨앗구매':
                    await this.handleBuySeeds(interaction, farmingSystem, userId);
                    break;
                case '심기':
                    await this.handlePlant(interaction, farmingSystem, userId);
                    break;
                case '수확':
                    await this.handleHarvest(interaction, farmingSystem, userId);
                    break;
                case '농장':
                    await this.handleFarm(interaction, farmingSystem, userId);
                    break;
            }
        } catch (error) {
            console.error('농사 명령어 오류:', error);
            await interaction.reply({ 
                content: '농사 명령어 실행 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleBuySeeds(interaction, farmingSystem, userId) {
        const cropId = interaction.options.getString('작물');
        
        const result = await farmingSystem.buySeeds(userId, cropId);
        const embed = farmingSystem.createBuyResultEmbed(result);
        
        await interaction.reply({ embeds: [embed] });
    },

    async handlePlant(interaction, farmingSystem, userId) {
        const cropId = interaction.options.getString('작물');
        
        const result = await farmingSystem.plantCrop(userId, cropId);
        const embed = farmingSystem.createPlantResultEmbed(result);
        
        await interaction.reply({ embeds: [embed] });
    },

    async handleHarvest(interaction, farmingSystem, userId) {
        const result = await farmingSystem.harvestCrops(userId);
        const embed = farmingSystem.createHarvestResultEmbed(result);
        
        await interaction.reply({ embeds: [embed] });
    },

    async handleFarm(interaction, farmingSystem, userId) {
        const farmData = await farmingSystem.getFarmStatus(userId);
        const embed = farmingSystem.createFarmStatusEmbed(farmData);
        
        await interaction.reply({ embeds: [embed] });
    },

    async handleShop(interaction, farmingSystem) {
        const shopCrops = farmingSystem.getShopCrops();
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🌱 씨앗 상점')
            .setTimestamp();

        const cropText = shopCrops.map(crop => {
            return `**${crop.name}** - ${crop.seeds_cost}원\n📊 성장시간: ${crop.growth_time}분 | 가치: ${crop.value}원\n📝 ${crop.description}`;
        }).join('\n\n');
        
        embed.setDescription(cropText);
        
        await interaction.reply({ embeds: [embed] });
    }
};
