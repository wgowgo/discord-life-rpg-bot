const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const PaginationSystem = require('../systems/PaginationSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('직업')
        .setDescription('직업 관련 명령어')
        .addSubcommand(subcommand =>
            subcommand
                .setName('목록')
                .setDescription('구할 수 있는 직업 목록을 확인합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('지원')
                .setDescription('원하는 직업에 지원합니다')
                .addIntegerOption(option =>
                    option.setName('직업id')
                        .setDescription('지원할 직업의 ID')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('퇴사')
                .setDescription('현재 직장에서 퇴사합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('급여')
                .setDescription('이번 달 급여를 받습니다')),

    async execute(interaction, db) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            switch (subcommand) {
                case '목록':
                    await this.handleJobList(interaction, db);
                    break;
                case '지원':
                    await this.handleApply(interaction, db, userId);
                    break;
                case '퇴사':
                    await this.handleQuit(interaction, db, userId);
                    break;
                case '급여':
                    await this.handleSalary(interaction, db, userId);
                    break;
            }
        } catch (error) {
            console.error('직업 명령어 오류:', error);
            await interaction.reply({ 
                content: '직업 명령어 실행 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleJobList(interaction, db) {
        const jobs = await db.all(`
            SELECT * FROM jobs ORDER BY required_education ASC, base_salary DESC
        `);

        if (jobs.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('💼 구인중인 직업')
                .setDescription('현재 구인중인 직업이 없습니다.')
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const paginationSystem = new PaginationSystem();
        const categoryEmojis = {
            '서비스': '🏪',
            'IT': '💻',
            '전문직': '👨‍⚕️',
            '경영': '👔',
            '금융': '💰',
            '교육': '📚',
            '연구': '🔬',
            '예술': '🎨',
            '일반': '💼',
            '스포츠': '⚽',
            '미디어': '📺',
            '요리': '🍳',
            '1차산업': '🌾',
            '패션': '👗',
            '뷰티': '💄',
            '부동산': '🏠',
            '건설': '🏗️',
            '운송': '🚗',
            '물류': '📦',
            '과학': '🧪'
        };

        const paginatedData = paginationSystem.createPaginatedEmbed(
            jobs,
            paginationSystem.formatJob.bind(paginationSystem),
            {
                title: '💼 구인중인 직업',
                color: 0x0099ff,
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
                    jobs, 
                    paginationSystem.formatJob.bind(paginationSystem),
                    {
                        title: '💼 구인중인 직업',
                        color: 0x0099ff,
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

    async handleApply(interaction, db, userId) {
        const jobId = interaction.options.getInteger('직업id');

        // 플레이어 정보 확인
        const player = await db.get('SELECT * FROM players WHERE id = ?', [userId]);
        if (!player) {
            await interaction.reply({ content: '먼저 게임을 시작해주세요. `/프로필` 명령어를 사용하세요.', ephemeral: true });
            return;
        }

        // 직업 정보 확인
        const job = await db.get('SELECT * FROM jobs WHERE id = ?', [jobId]);
        if (!job) {
            await interaction.reply({ content: '존재하지 않는 직업입니다.', ephemeral: true });
            return;
        }

        // 현재 직업 확인
        const currentJob = await db.get(`
            SELECT * FROM player_jobs WHERE player_id = ? AND is_current = TRUE
        `, [userId]);

        if (currentJob) {
            await interaction.reply({ content: '이미 직업을 가지고 있습니다. 먼저 퇴사해주세요.', ephemeral: true });
            return;
        }

        // 플레이어 스탯 확인
        const stats = await db.get('SELECT * FROM player_stats WHERE player_id = ?', [userId]);
        
        // 교육 수준 확인
        if (stats.education < job.required_education) {
            await interaction.reply({ 
                content: `교육 수준이 부족합니다. 필요: ${job.required_education}년, 현재: ${stats.education}년`, 
                ephemeral: true 
            });
            return;
        }

        // 면접 성공 확률 계산 (스탯 기반)
        const successRate = Math.min(90, 50 + (stats.intelligence / 2) + (stats.charm / 2));
        const success = Math.random() * 100 < successRate;

        if (!success) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ 면접 불합격')
                .setDescription(`${job.name} 면접에서 불합격했습니다.\n다시 도전해보세요!`)
                .addFields({
                    name: '합격 확률',
                    value: `${successRate.toFixed(1)}%`,
                    inline: true
                });

            await interaction.reply({ embeds: [embed] });
            return;
        }

        // 직업 배정
        const salary = Math.floor(job.base_salary * (0.8 + Math.random() * 0.4)); // ±20% 변동
        
        await db.run(`
            INSERT INTO player_jobs (player_id, job_id, salary, is_current)
            VALUES (?, ?, ?, TRUE)
        `, [userId, jobId, salary]);

        // 첫 직장 업적 체크
        const jobCount = await db.get(`
            SELECT COUNT(*) as count FROM player_jobs WHERE player_id = ?
        `, [userId]);

        if (jobCount.count === 1) {
            // 첫 직장 업적 달성
            await db.run(`
                INSERT OR IGNORE INTO player_achievements (player_id, achievement_id)
                VALUES (?, 1)
            `, [userId]);
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🎉 취업 성공!')
            .setDescription(`${job.name}에 취업했습니다!`)
            .addFields(
                {
                    name: '💰 월급',
                    value: `${salary.toLocaleString()}원`,
                    inline: true
                },
                {
                    name: '🏢 직종',
                    value: job.category,
                    inline: true
                },
                {
                    name: '📝 업무 내용',
                    value: job.description,
                    inline: false
                }
            );

        await interaction.reply({ embeds: [embed] });
    },

    async handleQuit(interaction, db, userId) {
        // 현재 직업 확인
        const currentJob = await db.get(`
            SELECT pj.*, j.name as job_name 
            FROM player_jobs pj
            JOIN jobs j ON pj.job_id = j.id
            WHERE pj.player_id = ? AND pj.is_current = TRUE
        `, [userId]);

        if (!currentJob) {
            await interaction.reply({ content: '현재 직업이 없습니다.', ephemeral: true });
            return;
        }

        // 퇴사 처리
        await db.run(`
            UPDATE player_jobs 
            SET is_current = FALSE, end_date = CURRENT_TIMESTAMP
            WHERE player_id = ? AND is_current = TRUE
        `, [userId]);

        // 퇴직금 지급 (근무일수 기반)
        const workDays = Math.floor((Date.now() - new Date(currentJob.start_date).getTime()) / (1000 * 60 * 60 * 24));
        const severancePay = Math.floor((currentJob.salary / 30) * Math.min(workDays, 30)); // 최대 1개월치

        await db.run(`
            UPDATE players SET money = money + ? WHERE id = ?
        `, [severancePay, userId]);

        await db.run(`
            INSERT INTO transactions (player_id, type, amount, description)
            VALUES (?, 'severance', ?, '퇴직금')
        `, [userId, severancePay]);

        const embed = new EmbedBuilder()
            .setColor('#ffff00')
            .setTitle('👋 퇴사 완료')
            .setDescription(`${currentJob.job_name}에서 퇴사했습니다.`)
            .addFields({
                name: '💰 퇴직금',
                value: `${severancePay.toLocaleString()}원`,
                inline: true
            });

        await interaction.reply({ embeds: [embed] });
    },

    async handleSalary(interaction, db, userId) {
        // 현재 직업 확인
        const currentJob = await db.get(`
            SELECT pj.*, j.name as job_name 
            FROM player_jobs pj
            JOIN jobs j ON pj.job_id = j.id
            WHERE pj.player_id = ? AND pj.is_current = TRUE
        `, [userId]);

        if (!currentJob) {
            await interaction.reply({ content: '현재 직업이 없습니다.', ephemeral: true });
            return;
        }

        // 마지막 급여 수령일 확인
        const lastSalary = await db.get(`
            SELECT * FROM transactions 
            WHERE player_id = ? AND type = 'salary'
            ORDER BY timestamp DESC LIMIT 1
        `, [userId]);

        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        if (lastSalary && new Date(lastSalary.timestamp) > oneMonthAgo) {
            const nextSalaryDate = new Date(lastSalary.timestamp);
            nextSalaryDate.setMonth(nextSalaryDate.getMonth() + 1);
            
            await interaction.reply({ 
                content: `이미 이번 달 급여를 받았습니다. 다음 급여일: ${nextSalaryDate.toLocaleDateString('ko-KR')}`, 
                ephemeral: true 
            });
            return;
        }

        // 급여 지급
        const salary = currentJob.salary;
        
        await db.run(`
            UPDATE players SET money = money + ? WHERE id = ?
        `, [salary, userId]);

        await db.run(`
            INSERT INTO transactions (player_id, type, amount, description)
            VALUES (?, 'salary', ?, ?)
        `, [userId, salary, `${currentJob.job_name} 급여`]);

        // 행복도 증가
        await db.run(`
            UPDATE player_stats 
            SET happiness = CASE WHEN happiness + 10 > 100 THEN 100 ELSE happiness + 10 END
            WHERE player_id = ?
        `, [userId]);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('💰 급여 지급')
            .setDescription(`${currentJob.job_name}에서 급여를 받았습니다!`)
            .addFields({
                name: '💵 지급 금액',
                value: `${salary.toLocaleString()}원`,
                inline: true
            });

        await interaction.reply({ embeds: [embed] });
    }
};

