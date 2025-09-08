const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const PaginationSystem = require('../systems/PaginationSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('업적')
        .setDescription('업적 관련 명령어')
        .addSubcommand(subcommand =>
            subcommand
                .setName('목록')
                .setDescription('내 업적 목록을 확인합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('전체')
                .setDescription('모든 업적 목록을 확인합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('칭호')
                .setDescription('내 칭호를 관리합니다')
                .addStringOption(option =>
                    option.setName('액션')
                        .setDescription('수행할 액션')
                        .setRequired(true)
                        .addChoices(
                            { name: '목록 보기', value: 'list' },
                            { name: '칭호 장착', value: 'equip' }
                        ))
                .addIntegerOption(option =>
                    option.setName('칭호id')
                        .setDescription('장착할 칭호 ID (장착 시에만 필요)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('도전과제')
                .setDescription('현재 진행 중인 도전과제를 확인합니다')),

    async execute(interaction, db) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            switch (subcommand) {
                case '목록':
                    await this.handleMyAchievements(interaction, db, userId);
                    break;
                case '전체':
                    await this.handleAllAchievements(interaction, db, userId);
                    break;
                case '칭호':
                    await this.handleTitles(interaction, db, userId);
                    break;
                case '도전과제':
                    await this.handleChallenges(interaction, db, userId);
                    break;
            }
        } catch (error) {
            console.error('업적 명령어 오류:', error);
            await interaction.reply({ 
                content: '업적 명령어 실행 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleMyAchievements(interaction, db, userId) {
        const achievements = await db.all(`
            SELECT 
                a.*,
                pa.unlocked_date
            FROM player_achievements pa
            JOIN achievements a ON pa.achievement_id = a.id
            WHERE pa.player_id = ?
            ORDER BY pa.unlocked_date DESC
        `, [userId]);

        const embed = new EmbedBuilder()
            .setColor('#gold')
            .setTitle('🏆 내 업적')
            .setTimestamp();

        if (achievements.length === 0) {
            embed.setDescription('아직 달성한 업적이 없습니다.\n다양한 활동을 통해 업적을 달성해보세요!');
            await interaction.reply({ embeds: [embed] });
            return;
        }

        // 카테고리별로 정리
        const categories = {};
        achievements.forEach(achievement => {
            if (!categories[achievement.category]) {
                categories[achievement.category] = [];
            }
            categories[achievement.category].push(achievement);
        });

        const categoryEmojis = {
            'career': '💼',
            'wealth': '💰',
            'investment': '📈',
            'social': '👥',
            'adventure': '⚔️',
            'special': '✨'
        };

        for (const [category, categoryAchievements] of Object.entries(categories)) {
            const emoji = categoryEmojis[category] || '🏆';
            const achievementsText = categoryAchievements.map(achievement => {
                const rarityEmoji = this.getRarityEmoji(achievement.rarity);
                const date = new Date(achievement.unlocked_date).toLocaleDateString('ko-KR');
                return `${rarityEmoji} **${achievement.name}**\n📝 ${achievement.description}\n📅 ${date}`;
            }).join('\n\n');

            embed.addFields({
                name: `${emoji} ${category.toUpperCase()}`,
                value: achievementsText,
                inline: false
            });
        }

        embed.setFooter({ text: `총 ${achievements.length}개 달성` });

        await interaction.reply({ embeds: [embed] });
    },

    async handleAllAchievements(interaction, db, userId) {
        const allAchievements = await db.all(`
            SELECT 
                a.*,
                CASE WHEN pa.player_id IS NOT NULL THEN 1 ELSE 0 END as unlocked
            FROM achievements a
            LEFT JOIN player_achievements pa ON a.id = pa.achievement_id AND pa.player_id = ?
            ORDER BY a.category, a.rarity, a.name
        `, [userId]);

        if (allAchievements.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('📋 모든 업적')
                .setDescription('업적이 없습니다.')
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const paginationSystem = new PaginationSystem();
        
        // 달성/미달성 통계
        const unlockedCount = allAchievements.filter(a => a.unlocked).length;
        const totalCount = allAchievements.length;
        const percentage = ((unlockedCount / totalCount) * 100).toFixed(1);

        const categoryEmojis = {
            'career': '💼',
            'wealth': '💰',
            'investment': '📈',
            'education': '📚',
            'fitness': '💪',
            'social': '👥',
            'romance': '💕',
            'pets': '🐾',
            'adventure': '⚔️',
            'activity': '🎯',
            'collection': '📦',
            'special': '✨'
        };

        const paginatedData = paginationSystem.createPaginatedEmbed(
            allAchievements,
            paginationSystem.formatAchievement.bind(paginationSystem),
            {
                title: `📋 모든 업적 (달성률: ${unlockedCount}/${totalCount} - ${percentage}%)`,
                color: 0x0099ff,
                itemsPerPage: 10,
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
                    allAchievements, 
                    paginationSystem.formatAchievement.bind(paginationSystem),
                    {
                        title: `📋 모든 업적 (달성률: ${unlockedCount}/${totalCount} - ${percentage}%)`,
                        color: 0x0099ff,
                        itemsPerPage: 10,
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

    async handleTitles(interaction, db, userId) {
        const action = interaction.options.getString('액션');
        const titleId = interaction.options.getInteger('칭호id');

        if (action === 'list') {
            const titles = await db.all(`
                SELECT 
                    t.*,
                    pt.is_active,
                    pt.unlocked_date
                FROM player_titles pt
                JOIN titles t ON pt.title_id = t.id
                WHERE pt.player_id = ?
                ORDER BY pt.is_active DESC, pt.unlocked_date DESC
            `, [userId]);

            const embed = new EmbedBuilder()
                .setColor('#purple')
                .setTitle('👑 내 칭호')
                .setTimestamp();

            if (titles.length === 0) {
                embed.setDescription('보유한 칭호가 없습니다.\n업적을 달성하여 칭호를 획득해보세요!');
                await interaction.reply({ embeds: [embed] });
                return;
            }

            const titlesText = titles.map(title => {
                const rarityEmoji = this.getRarityEmoji(title.rarity);
                const activeEmoji = title.is_active ? '⭐' : '';
                const date = new Date(title.unlocked_date).toLocaleDateString('ko-KR');
                return [
                    `${activeEmoji} ${rarityEmoji} **${title.name}** (ID: ${title.id})`,
                    `📝 ${title.description}`,
                    `📅 획득일: ${date}`
                ].join('\n');
            }).join('\n\n');

            embed.setDescription(titlesText);
            embed.setFooter({ text: '칭호를 장착하려면 "/업적 칭호 액션:장착 칭호id:{ID}"를 사용하세요' });

            await interaction.reply({ embeds: [embed] });

        } else if (action === 'equip') {
            if (!titleId) {
                await interaction.reply({ content: '장착할 칭호 ID를 입력해주세요.', ephemeral: true });
                return;
            }

            // 칭호 보유 확인
            const title = await db.get(`
                SELECT t.*, pt.* FROM player_titles pt
                JOIN titles t ON pt.title_id = t.id
                WHERE pt.player_id = ? AND pt.title_id = ?
            `, [userId, titleId]);

            if (!title) {
                await interaction.reply({ content: '해당 칭호를 보유하고 있지 않습니다.', ephemeral: true });
                return;
            }

            // 기존 활성 칭호 해제
            await db.run(`
                UPDATE player_titles SET is_active = FALSE WHERE player_id = ?
            `, [userId]);

            // 새 칭호 활성화
            await db.run(`
                UPDATE player_titles SET is_active = TRUE WHERE player_id = ? AND title_id = ?
            `, [userId, titleId]);

            const embed = new EmbedBuilder()
                .setColor('#gold')
                .setTitle('👑 칭호 장착 완료')
                .setDescription(`"${title.name}" 칭호를 장착했습니다!`)
                .addFields({
                    name: '✨ 효과',
                    value: title.description,
                    inline: false
                });

            await interaction.reply({ embeds: [embed] });
        }
    },

    async handleChallenges(interaction, db, userId) {
        const challenges = await db.all(`
            SELECT 
                c.*,
                pc.progress,
                pc.completed,
                pc.completed_date
            FROM player_challenges pc
            JOIN challenges c ON pc.challenge_id = c.id
            WHERE pc.player_id = ? AND pc.completed = FALSE
            ORDER BY c.type, c.name
        `, [userId]);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🎯 진행 중인 도전과제')
            .setTimestamp();

        if (challenges.length === 0) {
            embed.setDescription('현재 진행 중인 도전과제가 없습니다.');
            await interaction.reply({ embeds: [embed] });
            return;
        }

        // 타입별로 정리
        const types = {
            'daily': '📅 일일 도전과제',
            'weekly': '📊 주간 도전과제',
            'monthly': '📈 월간 도전과제'
        };

        const typeGroups = {};
        challenges.forEach(challenge => {
            if (!typeGroups[challenge.type]) {
                typeGroups[challenge.type] = [];
            }
            typeGroups[challenge.type].push(challenge);
        });

        for (const [type, typeChallenges] of Object.entries(typeGroups)) {
            const typeName = types[type] || type;
            const challengesText = typeChallenges.map(challenge => {
                const targetValue = parseInt(challenge.condition_value);
                const progressBar = this.createProgressBar(challenge.progress, targetValue);
                const rewardText = challenge.reward_type === 'money' ? 
                    `${parseInt(challenge.reward_value).toLocaleString()}원` : 
                    challenge.reward_value;

                return [
                    `**${challenge.name}**`,
                    `📝 ${challenge.description}`,
                    `📊 진행도: ${progressBar} (${challenge.progress}/${targetValue})`,
                    `🎁 보상: ${rewardText}`
                ].join('\n');
            }).join('\n\n');

            embed.addFields({
                name: typeName,
                value: challengesText,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    getRarityEmoji(rarity) {
        const rarityEmojis = {
            'common': '⚪',
            'rare': '🔵',
            'epic': '🟣',
            'legendary': '🟡'
        };
        return rarityEmojis[rarity] || '⚪';
    },

    createProgressBar(current, target, length = 10) {
        const percentage = Math.min(current / target, 1);
        const filled = Math.floor(percentage * length);
        const empty = length - filled;
        
        return '🟩'.repeat(filled) + '⬜'.repeat(empty) + ` ${(percentage * 100).toFixed(1)}%`;
    }
};
