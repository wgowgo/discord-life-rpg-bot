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
                .setDescription('내 농장 상태를 확인합니다 (회원가입 필요)')),

    async execute(interaction, db) {
        const farmingSystem = new FarmingSystem(db);
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
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
    }
};
