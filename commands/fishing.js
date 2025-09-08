const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const FishingSystem = require('../systems/FishingSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('낚시')
        .setDescription('낚시 관련 명령어')
        .addSubcommand(subcommand =>
            subcommand
                .setName('시작')
                .setDescription('낚시를 시작합니다 (회원가입 필요)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('낚시대')
                .setDescription('보유한 낚시대를 확인합니다 (회원가입 필요)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('상점')
                .setDescription('낚시대 상점을 확인합니다 (누구나 사용 가능)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('구매')
                .setDescription('낚시대를 구매합니다 (회원가입 필요)')
                .addStringOption(option =>
                    option.setName('낚시대')
                        .setDescription('구매할 낚시대')
                        .setRequired(true)
                        .addChoices(
                            { name: '기본 낚시대 (10,000원)', value: 'basic_rod' },
                            { name: '대나무 낚시대 (25,000원)', value: 'bamboo_rod' },
                            { name: '강철 낚시대 (50,000원)', value: 'steel_rod' }
                        ))),

    async execute(interaction, client) {
        const fishingSystem = client.fishingSystem;
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            // 상점 명령어는 누구나 사용 가능
            if (subcommand === '상점') {
                await this.handleShop(interaction, fishingSystem);
                return;
            }

            // 다른 명령어들은 회원가입 필요
            const player = await db.get('SELECT * FROM players WHERE id = ?', [userId]);
            if (!player) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ 회원가입 필요')
                    .setDescription('낚시를 하려면 먼저 회원가입을 해주세요!')
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
                case '시작':
                    await this.handleFishing(interaction, fishingSystem, userId);
                    break;
                case '낚시대':
                    await this.handleRods(interaction, fishingSystem, userId);
                    break;
                case '구매':
                    await this.handleBuy(interaction, fishingSystem, userId);
                    break;
            }
        } catch (error) {
            console.error('낚시 명령어 오류:', error);
            await interaction.reply({ 
                content: '낚시 명령어 실행 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleFishing(interaction, fishingSystem, userId) {
        await interaction.deferReply();
        
        const result = await fishingSystem.startFishing(userId);
        const embed = fishingSystem.createFishingResultEmbed(result);
        
        await interaction.editReply({ embeds: [embed] });
    },

    async handleRods(interaction, fishingSystem, userId) {
        const rods = await fishingSystem.getPlayerRods(userId);
        
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎣 보유 낚시대')
            .setTimestamp();

        if (rods.length === 0) {
            embed.setDescription('보유한 낚시대가 없습니다.\n낚시대 상점에서 구매해보세요!');
        } else {
            const rodText = rods.map(rod => {
                const rarityEmoji = {
                    'common': '⚪',
                    'rare': '🔵',
                    'epic': '🟣',
                    'legendary': '🟡',
                    'mythic': '🔴'
                };
                return `${rarityEmoji[rod.rarity]} **${rod.name}**\n📊 성공률: ${rod.success_rate}% | 🎁 희귀 확률: ${rod.rare_chance}%`;
            }).join('\n\n');
            
            embed.setDescription(rodText);
        }
        
        await interaction.reply({ embeds: [embed] });
    },

    async handleShop(interaction, fishingSystem) {
        const shopRods = fishingSystem.getShopRods();
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🏪 낚시대 상점')
            .setTimestamp();

        const rodText = shopRods.map(rod => {
            return `**${rod.name}** - ${rod.price.toLocaleString()}원\n📊 성공률: ${rod.success_rate}% | 🎁 희귀 확률: ${rod.rare_chance}%\n📝 ${rod.description}`;
        }).join('\n\n');
        
        embed.setDescription(rodText);
        
        await interaction.reply({ embeds: [embed] });
    },

    async handleBuy(interaction, fishingSystem, userId) {
        const rodId = interaction.options.getString('낚시대');
        
        const result = await fishingSystem.buyRod(userId, rodId);
        const embed = fishingSystem.createBuyResultEmbed(result);
        
        await interaction.reply({ embeds: [embed] });
    }
};
