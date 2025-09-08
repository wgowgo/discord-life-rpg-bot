const { SlashCommandBuilder } = require('discord.js');
const EducationSystem = require('../systems/EducationSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('교육')
        .setDescription('교육/학습 관련 명령어')
        .addSubcommand(subcommand =>
            subcommand
                .setName('과정목록')
                .setDescription('수강 가능한 교육과정을 확인합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('등록')
                .setDescription('교육과정에 등록합니다')
                .addIntegerOption(option =>
                    option.setName('과정id')
                        .setDescription('등록할 교육과정의 ID')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('진행상황')
                .setDescription('현재 교육 진행 상황을 확인합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('포기')
                .setDescription('현재 교육과정을 포기합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('이력')
                .setDescription('내 교육 이력을 확인합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('공부')
                .setDescription('일일 공부를 합니다 (24시간 쿨다운)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('랭킹')
                .setDescription('교육 수준 랭킹을 확인합니다')),

    async execute(interaction, db) {
        const educationSystem = new EducationSystem(db);
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            // 랭킹 명령어는 누구나 사용 가능
            if (subcommand === '랭킹') {
                await this.handleRanking(interaction, educationSystem);
                return;
            }

            // 다른 명령어들은 회원가입 필요
            const player = await db.get('SELECT * FROM players WHERE id = ?', [userId]);
            if (!player) {
                const embed = new (require('discord.js').EmbedBuilder)()
                    .setColor('#ff0000')
                    .setTitle('❌ 회원가입 필요')
                    .setDescription('교육을 받으려면 먼저 회원가입을 해주세요!')
                    .addFields({
                        name: '💡 도움말',
                        value: '`/프로필 회원가입` 명령어로 회원가입을 진행하세요.',
                        inline: false
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            // 교육 시스템 초기화 (최초 1회)
            await educationSystem.initializeEducationSystem();

            switch (subcommand) {
                case '과정목록':
                    await this.handleCourseList(interaction, educationSystem, userId);
                    break;
                case '등록':
                    await this.handleEnroll(interaction, educationSystem, userId);
                    break;
                case '진행상황':
                    await this.handleProgress(interaction, educationSystem, userId);
                    break;
                case '포기':
                    await this.handleDropout(interaction, educationSystem, userId);
                    break;
                case '이력':
                    await this.handleHistory(interaction, educationSystem, userId);
                    break;
                case '공부':
                    await this.handleDailyStudy(interaction, educationSystem, userId);
                    break;
            }
        } catch (error) {
            console.error('교육 명령어 오류:', error);
            await interaction.reply({ 
                content: '교육 명령어 실행 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleCourseList(interaction, educationSystem, userId) {
        const courses = await educationSystem.getAvailableCourses(userId);
        const stats = await educationSystem.db.get('SELECT education FROM player_stats WHERE player_id = ?', [userId]);
        const currentEducation = stats ? stats.education : 0;
        
        const embed = educationSystem.createCourseListEmbed(courses, currentEducation);
        await interaction.reply({ embeds: [embed] });
    },

    async handleEnroll(interaction, educationSystem, userId) {
        const courseId = interaction.options.getInteger('과정id');
        
        const result = await educationSystem.enrollCourse(userId, courseId);
        
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor(result.success ? '#00ff00' : '#ff0000')
            .setTitle(result.success ? '📚 교육과정 등록 완료!' : '❌ 등록 실패')
            .setDescription(result.message);

        if (result.success) {
            embed.addFields(
                {
                    name: '💰 수강료',
                    value: `${result.cost.toLocaleString()}원`,
                    inline: true
                },
                {
                    name: '⏰ 교육 기간',
                    value: `${result.duration}일`,
                    inline: true
                },
                {
                    name: '🎓 완료 예정일',
                    value: result.endDate.toLocaleDateString('ko-KR'),
                    inline: true
                }
            );
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleProgress(interaction, educationSystem, userId) {
        const progress = await educationSystem.checkEducationProgress(userId);
        
        if (!progress) {
            const embed = new (require('discord.js').EmbedBuilder)()
                .setColor('#ffff00')
                .setTitle('📚 교육 진행 상황')
                .setDescription('현재 진행 중인 교육과정이 없습니다.');
            
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const embed = educationSystem.createProgressEmbed(progress);
        await interaction.reply({ embeds: [embed] });
    },

    async handleDropout(interaction, educationSystem, userId) {
        const result = await educationSystem.dropoutCourse(userId);
        
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor(result.success ? '#ffff00' : '#ff0000')
            .setTitle(result.success ? '📚 교육과정 포기' : '❌ 포기 실패')
            .setDescription(result.message);

        await interaction.reply({ embeds: [embed] });
    },

    async handleHistory(interaction, educationSystem, userId) {
        const history = await educationSystem.getEducationHistory(userId);
        
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor('#blue')
            .setTitle('🎓 내 교육 이력')
            .setTimestamp();

        if (history.length === 0) {
            embed.setDescription('완료한 교육과정이 없습니다.');
        } else {
            const historyText = history.map(edu => {
                const startDate = new Date(edu.start_date).toLocaleDateString('ko-KR');
                return [
                    `**${edu.course_name}**`,
                    `📂 카테고리: ${edu.category}`,
                    `📈 교육 증가: +${edu.education_gain}년`,
                    `📅 완료일: ${startDate}`
                ].join('\n');
            }).join('\n\n');

            embed.setDescription(historyText);
            embed.setFooter({ text: `총 ${history.length}개 과정 완료` });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleDailyStudy(interaction, educationSystem, userId) {
        const result = await educationSystem.studyDaily(userId);
        
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor(result.success ? '#00ff00' : '#ff0000')
            .setTitle(result.success ? '📖 공부 완료!' : '❌ 공부 실패')
            .setDescription(result.message);

        if (result.success) {
            const rewardTexts = [];
            if (result.rewards.intelligence) rewardTexts.push(`🧠 지능 +${result.rewards.intelligence}`);
            if (result.rewards.education) rewardTexts.push(`📚 교육 +${result.rewards.education}`);
            if (result.rewards.experience) rewardTexts.push(`⭐ 경험치 +${result.rewards.experience}`);

            embed.addFields({
                name: '🎁 획득 보상',
                value: rewardTexts.join('\n'),
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleRanking(interaction, educationSystem) {
        const rankings = await educationSystem.getEducationRankings();
        
        const embed = new (require('discord.js').EmbedBuilder)()
            .setColor('#gold')
            .setTitle('🎓 교육 수준 랭킹')
            .setTimestamp();

        if (rankings.length === 0) {
            embed.setDescription('랭킹 데이터가 없습니다.');
        } else {
            const rankingText = rankings.map((rank, index) => {
                const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
                return [
                    `${medal} **${rank.username}**`,
                    `📚 교육 수준: ${rank.education}년`,
                    `🎓 완료 과정: ${rank.completed_courses}개`
                ].join('\n');
            }).join('\n\n');
            
            embed.setDescription(rankingText);
        }

        await interaction.reply({ embeds: [embed] });
    }
};

