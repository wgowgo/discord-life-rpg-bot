const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const RomanceSystem = require('../systems/RomanceSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('연애')
        .setDescription('연애/결혼 관련 명령어')
        .addSubcommand(subcommand =>
            subcommand
                .setName('고백')
                .setDescription('상대방에게 고백합니다')
                .addUserOption(option =>
                    option.setName('상대방')
                        .setDescription('고백할 상대방')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('프로포즈')
                .setDescription('연인에게 프로포즈합니다')
                .addUserOption(option =>
                    option.setName('상대방')
                        .setDescription('프로포즈할 상대방')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('이혼')
                .setDescription('현재 배우자와 이혼합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('상태')
                .setDescription('내 연애 상태를 확인합니다')
                .addUserOption(option =>
                    option.setName('유저')
                        .setDescription('상태를 확인할 유저 (기본값: 자신)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('선물')
                .setDescription('상대방에게 선물을 보냅니다')
                .addUserOption(option =>
                    option.setName('상대방')
                        .setDescription('선물받을 상대방')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('선물')
                        .setDescription('보낼 선물 종류')
                        .setRequired(true)
                        .addChoices(
                            { name: '🌹 꽃다발 (1만원)', value: 'flower' },
                            { name: '🍫 초콜릿 (2만원)', value: 'chocolate' },
                            { name: '💎 보석 (10만원)', value: 'jewelry' },
                            { name: '🚗 자동차 (500만원)', value: 'car' }
                        ))
                .addIntegerOption(option =>
                    option.setName('수량')
                        .setDescription('선물 수량')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(10)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('결혼랭킹')
                .setDescription('결혼 기간 랭킹을 확인합니다')),

    async execute(interaction, db) {
        const romanceSystem = new RomanceSystem(db);
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            switch (subcommand) {
                case '고백':
                    await this.handleConfess(interaction, romanceSystem, userId);
                    break;
                case '프로포즈':
                    await this.handlePropose(interaction, romanceSystem, userId);
                    break;
                case '이혼':
                    await this.handleDivorce(interaction, romanceSystem, userId);
                    break;
                case '상태':
                    await this.handleStatus(interaction, romanceSystem);
                    break;
                case '선물':
                    await this.handleGift(interaction, romanceSystem, userId);
                    break;
                case '결혼랭킹':
                    await this.handleMarriageRanking(interaction, romanceSystem);
                    break;
            }
        } catch (error) {
            console.error('연애 명령어 오류:', error);
            await interaction.reply({ 
                content: '연애 명령어 실행 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleConfess(interaction, romanceSystem, userId) {
        const target = interaction.options.getUser('상대방');
        
        if (target.bot) {
            await interaction.reply({ content: '봇에게는 고백할 수 없습니다!', ephemeral: true });
            return;
        }

        const result = await romanceSystem.confess(userId, target.id);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#ff69b4' : '#ff0000')
            .setTitle(result.success ? '💕 고백 성공!' : '💔 고백 실패')
            .setDescription(result.message)
            .addFields({
                name: '📊 성공 확률',
                value: `${result.successRate.toFixed(1)}%`,
                inline: true
            });

        if (result.success) {
            embed.addFields({
                name: '💖 관계',
                value: '연인 관계가 되었습니다!',
                inline: true
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handlePropose(interaction, romanceSystem, userId) {
        const target = interaction.options.getUser('상대방');
        
        const result = await romanceSystem.propose(userId, target.id);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#gold' : '#ff0000')
            .setTitle(result.success ? '💒 결혼 성공!' : '💔 프로포즈 실패')
            .setDescription(result.message);

        if (result.success) {
            embed.addFields(
                {
                    name: '💰 결혼 비용',
                    value: `${result.cost.toLocaleString()}원`,
                    inline: true
                },
                {
                    name: '🎁 축하금',
                    value: `${result.gift.toLocaleString()}원 (각자)`,
                    inline: true
                }
            );
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleDivorce(interaction, romanceSystem, userId) {
        const result = await romanceSystem.divorce(userId);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#ffff00' : '#ff0000')
            .setTitle(result.success ? '💔 이혼 완료' : '❌ 이혼 실패')
            .setDescription(result.message);

        if (result.success) {
            embed.addFields({
                name: '💸 위자료',
                value: `${result.alimony.toLocaleString()}원`,
                inline: true
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleStatus(interaction, romanceSystem) {
        const targetUser = interaction.options.getUser('유저') || interaction.user;
        const status = await romanceSystem.getRelationshipStatus(targetUser.id);
        
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`💕 ${targetUser.username}의 연애 상태`)
            .setTimestamp();

        switch (status.status) {
            case 'married':
                embed.addFields(
                    {
                        name: '💒 결혼 상태',
                        value: '기혼',
                        inline: true
                    },
                    {
                        name: '👤 배우자',
                        value: status.partner,
                        inline: true
                    },
                    {
                        name: '📅 결혼 기간',
                        value: `${status.duration}일`,
                        inline: true
                    }
                );
                break;
            
            case 'dating':
                embed.addFields(
                    {
                        name: '💕 연애 상태',
                        value: '연인',
                        inline: true
                    },
                    {
                        name: '👤 연인',
                        value: status.partner,
                        inline: true
                    },
                    {
                        name: '📅 연애 기간',
                        value: `${status.duration}일`,
                        inline: true
                    }
                );
                break;
            
            case 'single':
                embed.setDescription('💔 솔로입니다.\n누군가에게 고백해보세요!');
                break;
            
            default:
                embed.setDescription('❓ 연애 상태를 알 수 없습니다.');
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleGift(interaction, romanceSystem, userId) {
        const target = interaction.options.getUser('상대방');
        const giftType = interaction.options.getString('선물');
        const amount = interaction.options.getInteger('수량') || 1;
        
        if (target.bot) {
            await interaction.reply({ content: '봇에게는 선물을 보낼 수 없습니다!', ephemeral: true });
            return;
        }

        const result = await romanceSystem.sendGift(userId, target.id, giftType, amount);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#ff69b4' : '#ff0000')
            .setTitle(result.success ? '🎁 선물 전송 완료!' : '❌ 선물 전송 실패')
            .setDescription(result.message);

        if (result.success) {
            embed.addFields(
                {
                    name: '💰 비용',
                    value: `${result.cost.toLocaleString()}원`,
                    inline: true
                },
                {
                    name: '😊 상대방 행복도',
                    value: `+${result.happinessGain}`,
                    inline: true
                }
            );
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleMarriageRanking(interaction, romanceSystem) {
        const rankings = await romanceSystem.getMarriageRankings();
        
        const embed = new EmbedBuilder()
            .setColor('#gold')
            .setTitle('💒 결혼 기간 랭킹')
            .setTimestamp();

        if (rankings.length === 0) {
            embed.setDescription('아직 결혼한 커플이 없습니다.');
        } else {
            const rankingText = rankings.map((couple, index) => {
                const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
                const date = new Date(couple.marriage_date).toLocaleDateString('ko-KR');
                return `${medal} ${couple.player1_name} ❤️ ${couple.player2_name}\n` +
                       `📅 ${date} (${couple.days_married}일)`;
            }).join('\n\n');
            
            embed.setDescription(rankingText);
        }

        await interaction.reply({ embeds: [embed] });
    }
};

