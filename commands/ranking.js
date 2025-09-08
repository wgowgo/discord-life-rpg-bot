const { SlashCommandBuilder } = require('discord.js');
const Player = require('../systems/Player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('랭킹')
        .setDescription('각종 랭킹을 확인합니다')
        .addStringOption(option =>
            option.setName('카테고리')
                .setDescription('확인할 랭킹 카테고리')
                .setRequired(false)
                .addChoices(
                    { name: '💰 부자 랭킹', value: 'wealth' },
                    { name: '📊 레벨 랭킹', value: 'level' },
                    { name: '🏆 업적 랭킹', value: 'achievements' }
                )),

    async execute(interaction, db) {
        const category = interaction.options.getString('카테고리') || 'wealth';
        const player = new Player(db);

        try {
            const rankings = await player.getRankings(category, 10);
            const embed = await player.createRankingEmbed(category, rankings);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('랭킹 명령어 오류:', error);
            await interaction.reply({ 
                content: '랭킹을 불러오는 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },
};

