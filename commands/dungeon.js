const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const DungeonSystem = require('../systems/DungeonSystem');
const PaginationSystem = require('../systems/PaginationSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('던전')
        .setDescription('던전 관련 명령어')
        .addSubcommand(subcommand =>
            subcommand
                .setName('목록')
                .setDescription('던전 목록을 확인합니다')
                .addStringOption(option =>
                    option.setName('타입')
                        .setDescription('던전 타입')
                        .setRequired(false)
                        .addChoices(
                            { name: '📅 일상 던전', value: 'daily' },
                            { name: '⚔️ 모험 던전', value: 'adventure' },
                            { name: '✨ 특별 던전', value: 'special' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('입장')
                .setDescription('던전에 입장합니다')
                .addIntegerOption(option =>
                    option.setName('던전id')
                        .setDescription('입장할 던전의 ID')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('랭킹')
                .setDescription('던전 랭킹을 확인합니다')
                .addIntegerOption(option =>
                    option.setName('던전id')
                        .setDescription('랭킹을 볼 던전의 ID')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('기록')
                .setDescription('내 던전 클리어 기록을 확인합니다')),

    async execute(interaction, db) {
        const dungeonSystem = new DungeonSystem(db);
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            switch (subcommand) {
                case '목록':
                    await this.handleList(interaction, dungeonSystem);
                    break;
                case '입장':
                    await this.handleEnter(interaction, dungeonSystem, userId);
                    break;
                case '랭킹':
                    await this.handleRanking(interaction, dungeonSystem);
                    break;
                case '기록':
                    await this.handleRecord(interaction, dungeonSystem, userId);
                    break;
            }
        } catch (error) {
            console.error('던전 명령어 오류:', error);
            await interaction.reply({ 
                content: '던전 명령어 실행 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleList(interaction, dungeonSystem) {
        const type = interaction.options.getString('타입');
        const dungeons = await dungeonSystem.getDungeonList(type);

        if (dungeons.length === 0) {
            const embed = dungeonSystem.createDungeonListEmbed(dungeons, type);
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const paginationSystem = new PaginationSystem();
        const typeEmojis = {
            'daily': '📅',
            'adventure': '⚔️',
            'special': '✨',
            'career': '💼'
        };

        const paginatedData = paginationSystem.createPaginatedEmbed(
            dungeons,
            paginationSystem.formatDungeon.bind(paginationSystem),
            {
                title: '🏰 던전 목록',
                color: 0x9932CC,
                itemsPerPage: 6,
                category: 'type',
                categoryEmojis: typeEmojis
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
                    dungeons, 
                    paginationSystem.formatDungeon.bind(paginationSystem),
                    {
                        title: '🏰 던전 목록',
                        color: 0x9932CC,
                        itemsPerPage: 6,
                        category: 'type',
                        categoryEmojis: typeEmojis
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

    async handleEnter(interaction, dungeonSystem, userId) {
        const dungeonId = interaction.options.getInteger('던전id');
        
        await interaction.deferReply();
        
        const result = await dungeonSystem.enterDungeon(userId, dungeonId);
        const dungeon = await dungeonSystem.db.get('SELECT name FROM dungeons WHERE id = ?', [dungeonId]);
        const dungeonName = dungeon ? dungeon.name : '알 수 없는 던전';
        
        const embed = dungeonSystem.createBattleResultEmbed(result, dungeonName);
        
        await interaction.editReply({ embeds: [embed] });
    },

    async handleRanking(interaction, dungeonSystem) {
        const dungeonId = interaction.options.getInteger('던전id');
        
        const dungeon = await dungeonSystem.db.get('SELECT name FROM dungeons WHERE id = ?', [dungeonId]);
        if (!dungeon) {
            await interaction.reply({ content: '존재하지 않는 던전입니다.', ephemeral: true });
            return;
        }
        
        const rankings = await dungeonSystem.getDungeonRankings(dungeonId, 10);
        
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor('#gold')
            .setTitle(`🏆 ${dungeon.name} 랭킹`)
            .setTimestamp();

        if (rankings.length === 0) {
            embed.setDescription('아직 클리어한 플레이어가 없습니다.');
        } else {
            const rankingText = rankings.map((rank, index) => {
                const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
                const date = new Date(rank.clear_time).toLocaleDateString('ko-KR');
                return `${medal} ${rank.username} - ${rank.score}점 (${date})`;
            }).join('\n');
            
            embed.setDescription(rankingText);
        }
        
        await interaction.reply({ embeds: [embed] });
    },

    async handleRecord(interaction, dungeonSystem, userId) {
        const playerStats = await dungeonSystem.getPlayerDungeonStats(userId);
        
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor('#0099ff')
            .setTitle('📊 내 던전 기록')
            .setTimestamp();

        if (playerStats.stats.total_clears === 0) {
            embed.setDescription('아직 클리어한 던전이 없습니다.\n던전에 도전해보세요!');
        } else {
            embed.addFields(
                {
                    name: '📈 통계',
                    value: [
                        `총 클리어: ${playerStats.stats.total_clears}회`,
                        `클리어한 던전: ${playerStats.stats.unique_dungeons}개`,
                        `최고 점수: ${Math.floor(playerStats.stats.best_score)}점`,
                        `평균 점수: ${Math.floor(playerStats.stats.avg_score)}점`
                    ].join('\n'),
                    inline: false
                }
            );

            if (playerStats.recentClears.length > 0) {
                const recentText = playerStats.recentClears.map(clear => {
                    const date = new Date(clear.clear_time).toLocaleDateString('ko-KR');
                    return `${clear.name}: ${clear.score}점 (${date})`;
                }).join('\n');

                embed.addFields({
                    name: '📋 최근 클리어',
                    value: recentText,
                    inline: false
                });
            }
        }
        
        await interaction.reply({ embeds: [embed] });
    }
};

