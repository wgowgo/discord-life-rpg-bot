
const { EmbedBuilder } = require('discord.js');

class EducationSystem {
    constructor(database) {
        this.db = database;
        this.courses = [
            // 기본 교육
            {
                name: '초등교육',
                category: 'basic',
                cost: 0,
                duration_days: 30,
                required_education: 0,
                education_gain: 1,
                stats_bonus: JSON.stringify({ intelligence: 5 }),
                description: '기초 교육 과정'
            },
            {
                name: '중등교육',
                category: 'basic',
                cost: 500000,
                duration_days: 45,
                required_education: 1,
                education_gain: 2,
                stats_bonus: JSON.stringify({ intelligence: 10, charm: 5 }),
                description: '중학교 교육 과정'
            },
            {
                name: '고등교육',
                category: 'basic',
                cost: 1000000,
                duration_days: 60,
                required_education: 3,
                education_gain: 3,
                stats_bonus: JSON.stringify({ intelligence: 15, charm: 10 }),
                description: '고등학교 교육 과정'
            },
            {
                name: '대학교육',
                category: 'basic',
                cost: 5000000,
                duration_days: 120,
                required_education: 6,
                education_gain: 4,
                stats_bonus: JSON.stringify({ intelligence: 25, charm: 15, luck: 10 }),
                description: '대학교 교육 과정'
            },
            {
                name: '대학원 석사',
                category: 'basic',
                cost: 8000000,
                duration_days: 180,
                required_education: 10,
                education_gain: 3,
                stats_bonus: JSON.stringify({ intelligence: 30, charm: 20 }),
                description: '대학원 석사 과정'
            },
            {
                name: '박사 과정',
                category: 'basic',
                cost: 15000000,
                duration_days: 360,
                required_education: 13,
                education_gain: 5,
                stats_bonus: JSON.stringify({ intelligence: 45, charm: 25, luck: 15 }),
                description: '박사 학위 과정'
            },
            
            // 전문 기술
            {
                name: '프로그래밍 부트캠프',
                category: 'tech',
                cost: 2000000,
                duration_days: 90,
                required_education: 6,
                education_gain: 2,
                stats_bonus: JSON.stringify({ intelligence: 30 }),
                description: '소프트웨어 개발 집중 과정'
            },
            {
                name: '디자인 스쿨',
                category: 'creative',
                cost: 1500000,
                duration_days: 60,
                required_education: 3,
                education_gain: 1,
                stats_bonus: JSON.stringify({ charm: 25, intelligence: 10 }),
                description: '그래픽 디자인 전문 과정'
            },
            {
                name: '요리 학교',
                category: 'practical',
                cost: 1000000,
                duration_days: 45,
                required_education: 3,
                education_gain: 1,
                stats_bonus: JSON.stringify({ charm: 15, health: 10 }),
                description: '전문 요리사 양성 과정'
            },
            {
                name: 'AI/머신러닝 과정',
                category: 'tech',
                cost: 4000000,
                duration_days: 120,
                required_education: 10,
                education_gain: 3,
                stats_bonus: JSON.stringify({ intelligence: 40, luck: 10 }),
                description: '인공지능 및 머신러닝 전문가 과정'
            },
            {
                name: '사이버보안 전문가',
                category: 'tech',
                cost: 3500000,
                duration_days: 90,
                required_education: 8,
                education_gain: 2,
                stats_bonus: JSON.stringify({ intelligence: 35, agility: 15 }),
                description: '사이버보안 및 해킹 방어 전문 과정'
            },
            {
                name: '블록체인 개발자',
                category: 'tech',
                cost: 3000000,
                duration_days: 75,
                required_education: 8,
                education_gain: 2,
                stats_bonus: JSON.stringify({ intelligence: 32, luck: 18 }),
                description: '블록체인 기술 및 암호화폐 개발 과정'
            },
            {
                name: '영상 제작 스쿨',
                category: 'creative',
                cost: 2500000,
                duration_days: 90,
                required_education: 6,
                education_gain: 2,
                stats_bonus: JSON.stringify({ charm: 30, intelligence: 15 }),
                description: '영화/드라마 제작 전문 과정'
            },
            {
                name: '음악 프로듀서',
                category: 'creative',
                cost: 2000000,
                duration_days: 75,
                required_education: 6,
                education_gain: 1,
                stats_bonus: JSON.stringify({ charm: 35, happiness: 20 }),
                description: '음악 제작 및 프로듀싱 전문 과정'
            },
            {
                name: '패션 디자인',
                category: 'creative',
                cost: 2200000,
                duration_days: 80,
                required_education: 6,
                education_gain: 2,
                stats_bonus: JSON.stringify({ charm: 40, intelligence: 10 }),
                description: '패션 디자인 전문가 과정'
            },
            {
                name: '게임 개발 스쿨',
                category: 'tech',
                cost: 2800000,
                duration_days: 100,
                required_education: 6,
                education_gain: 2,
                stats_bonus: JSON.stringify({ intelligence: 28, charm: 12 }),
                description: '게임 개발 전문가 양성 과정'
            },
            
            // 실무 기술
            {
                name: '자동차 정비 기술',
                category: 'practical',
                cost: 1200000,
                duration_days: 60,
                required_education: 3,
                education_gain: 1,
                stats_bonus: JSON.stringify({ strength: 20, intelligence: 15 }),
                description: '자동차 정비 전문 기술 과정'
            },
            {
                name: '미용 기술 스쿨',
                category: 'practical',
                cost: 800000,
                duration_days: 45,
                required_education: 3,
                education_gain: 1,
                stats_bonus: JSON.stringify({ charm: 25, agility: 10 }),
                description: '헤어/메이크업 전문 기술 과정'
            },
            {
                name: '건축 설계',
                category: 'practical',
                cost: 3500000,
                duration_days: 150,
                required_education: 8,
                education_gain: 3,
                stats_bonus: JSON.stringify({ intelligence: 35, strength: 15 }),
                description: '건축 설계 전문가 과정'
            },
            {
                name: '마케팅 전문가',
                category: 'business',
                cost: 2200000,
                duration_days: 75,
                required_education: 6,
                education_gain: 2,
                stats_bonus: JSON.stringify({ charm: 30, intelligence: 20 }),
                description: '디지털 마케팅 전문가 과정'
            },
            {
                name: '부동산 중개사',
                category: 'business',
                cost: 1800000,
                duration_days: 60,
                required_education: 6,
                education_gain: 1,
                stats_bonus: JSON.stringify({ charm: 25, luck: 20 }),
                description: '부동산 중개 전문가 과정'
            },
            
            // 고급 과정
            {
                name: 'MBA',
                category: 'business',
                cost: 10000000,
                duration_days: 180,
                required_education: 8,
                education_gain: 3,
                stats_bonus: JSON.stringify({ intelligence: 35, charm: 25, luck: 15 }),
                description: '경영학 석사 과정'
            },
            {
                name: '의학 전문의',
                category: 'medical',
                cost: 20000000,
                duration_days: 365,
                required_education: 10,
                education_gain: 5,
                stats_bonus: JSON.stringify({ intelligence: 50, charm: 20 }),
                description: '의학 전문의 과정'
            },
            {
                name: '법학전문대학원',
                category: 'legal',
                cost: 12000000,
                duration_days: 180,
                required_education: 10,
                education_gain: 4,
                stats_bonus: JSON.stringify({ intelligence: 40, charm: 30 }),
                description: '로스쿨 법학박사 과정'
            },
            {
                name: '약학 대학',
                category: 'medical',
                cost: 15000000,
                duration_days: 240,
                required_education: 10,
                education_gain: 4,
                stats_bonus: JSON.stringify({ intelligence: 42, health: 20 }),
                description: '약학박사 전문 과정'
            },
            {
                name: '치의학 전문의',
                category: 'medical',
                cost: 18000000,
                duration_days: 300,
                required_education: 10,
                education_gain: 4,
                stats_bonus: JSON.stringify({ intelligence: 45, agility: 25 }),
                description: '치과의학 전문의 과정'
            },
            
            // 특수 기술
            {
                name: '투자 마스터 클래스',
                category: 'finance',
                cost: 5000000,
                duration_days: 30,
                required_education: 8,
                education_gain: 1,
                stats_bonus: JSON.stringify({ intelligence: 20, luck: 25 }),
                description: '고급 투자 전략 과정'
            },
            {
                name: '리더십 아카데미',
                category: 'leadership',
                cost: 3000000,
                duration_days: 60,
                required_education: 6,
                education_gain: 1,
                stats_bonus: JSON.stringify({ charm: 30, intelligence: 15 }),
                description: '리더십 개발 과정'
            },
            {
                name: '협상 전문가',
                category: 'leadership',
                cost: 2500000,
                duration_days: 45,
                required_education: 6,
                education_gain: 1,
                stats_bonus: JSON.stringify({ charm: 35, intelligence: 10 }),
                description: '고급 협상 기술 과정'
            },
            {
                name: '외국어 마스터',
                category: 'language',
                cost: 1800000,
                duration_days: 90,
                required_education: 6,
                education_gain: 1,
                stats_bonus: JSON.stringify({ intelligence: 25, charm: 20 }),
                description: '다국어 전문가 과정'
            },
            {
                name: '스포츠 트레이너',
                category: 'fitness',
                cost: 1500000,
                duration_days: 60,
                required_education: 3,
                education_gain: 1,
                stats_bonus: JSON.stringify({ strength: 30, health: 25 }),
                description: '운동 트레이닝 전문가 과정'
            },
            {
                name: '영양학 전문가',
                category: 'medical',
                cost: 2000000,
                duration_days: 75,
                required_education: 6,
                education_gain: 2,
                stats_bonus: JSON.stringify({ health: 30, intelligence: 20 }),
                description: '영양 및 건강 관리 전문가 과정'
            },
            {
                name: '심리상담사',
                category: 'medical',
                cost: 2800000,
                duration_days: 100,
                required_education: 8,
                education_gain: 2,
                stats_bonus: JSON.stringify({ charm: 35, happiness: 25 }),
                description: '심리상담 및 치료 전문가 과정'
            },
            {
                name: '데이터 사이언티스트',
                category: 'tech',
                cost: 3800000,
                duration_days: 110,
                required_education: 10,
                education_gain: 3,
                stats_bonus: JSON.stringify({ intelligence: 38, luck: 15 }),
                description: '빅데이터 분석 전문가 과정'
            },
            {
                name: '로봇공학 엔지니어',
                category: 'tech',
                cost: 4500000,
                duration_days: 150,
                required_education: 10,
                education_gain: 3,
                stats_bonus: JSON.stringify({ intelligence: 40, strength: 20 }),
                description: '로봇공학 및 자동화 전문가 과정'
            }
        ];
    }

    async initializeEducationSystem() {
        // 교육과정 테이블 생성
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS education_courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                cost REAL NOT NULL,
                duration_days INTEGER NOT NULL,
                required_education INTEGER NOT NULL,
                education_gain INTEGER NOT NULL,
                stats_bonus TEXT,
                description TEXT
            )
        `);

        // 플레이어 교육 진행 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS player_education (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                course_id INTEGER NOT NULL,
                start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                end_date DATETIME,
                progress_days INTEGER DEFAULT 0,
                completed BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (player_id) REFERENCES players(id),
                FOREIGN KEY (course_id) REFERENCES education_courses(id)
            )
        `);

        // 교육과정 데이터 삽입
        for (const course of this.courses) {
            await this.db.run(`
                INSERT OR IGNORE INTO education_courses 
                (name, category, cost, duration_days, required_education, education_gain, stats_bonus, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [course.name, course.category, course.cost, course.duration_days, 
                course.required_education, course.education_gain, course.stats_bonus, course.description]);
        }

        console.log('교육 시스템 초기화 완료');
    }

    async enrollCourse(playerId, courseId) {
        try {
            // 교육과정 정보 확인
            const course = await this.db.get('SELECT * FROM education_courses WHERE id = ?', [courseId]);
            if (!course) {
                return { success: false, message: '존재하지 않는 교육과정입니다.' };
            }

            // 플레이어 정보 확인
            const player = await this.db.get('SELECT * FROM players WHERE id = ?', [playerId]);
            const stats = await this.db.get('SELECT * FROM player_stats WHERE player_id = ?', [playerId]);
            
            if (!player || !stats) {
                return { success: false, message: '플레이어 정보를 찾을 수 없습니다.' };
            }

            // 교육 수준 확인
            if (stats.education < course.required_education) {
                return { 
                    success: false, 
                    message: `교육 수준이 부족합니다. 필요: ${course.required_education}년, 현재: ${stats.education}년` 
                };
            }

            // 자금 확인
            if (player.money < course.cost) {
                return { 
                    success: false, 
                    message: `수강료가 부족합니다. 필요: ${course.cost.toLocaleString()}원` 
                };
            }

            // 이미 진행 중인 교육 확인
            const ongoingEducation = await this.db.get(`
                SELECT * FROM player_education 
                WHERE player_id = ? AND completed = FALSE
            `, [playerId]);

            if (ongoingEducation) {
                return { success: false, message: '이미 진행 중인 교육과정이 있습니다.' };
            }

            // 교육과정 등록
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + course.duration_days);

            await this.db.run(`
                INSERT INTO player_education (player_id, course_id, end_date)
                VALUES (?, ?, ?)
            `, [playerId, courseId, endDate.toISOString()]);

            // 수강료 차감
            await this.db.run('UPDATE players SET money = money - ? WHERE id = ?', [course.cost, playerId]);

            // 거래 내역 기록
            await this.db.run(`
                INSERT INTO transactions (player_id, type, amount, description)
                VALUES (?, 'education', ?, ?)
            `, [playerId, -course.cost, `${course.name} 수강료`]);

            return {
                success: true,
                message: `${course.name} 교육과정에 등록했습니다!`,
                cost: course.cost,
                duration: course.duration_days,
                endDate: endDate
            };

        } catch (error) {
            console.error('교육과정 등록 오류:', error);
            return { success: false, message: '교육과정 등록 중 오류가 발생했습니다.' };
        }
    }

    async dropoutCourse(playerId) {
        try {
            const ongoingEducation = await this.db.get(`
                SELECT pe.*, ec.name as course_name
                FROM player_education pe
                JOIN education_courses ec ON pe.course_id = ec.id
                WHERE pe.player_id = ? AND pe.completed = FALSE
            `, [playerId]);

            if (!ongoingEducation) {
                return { success: false, message: '진행 중인 교육과정이 없습니다.' };
            }

            // 중도 포기 처리
            await this.db.run(`
                UPDATE player_education SET completed = TRUE WHERE id = ?
            `, [ongoingEducation.id]);

            // 행복도 감소
            await this.db.run(`
                UPDATE player_stats 
                SET happiness = CASE WHEN happiness - 15 < 0 THEN 0 ELSE happiness - 15 END
                WHERE player_id = ?
            `, [playerId]);

            return {
                success: true,
                message: `${ongoingEducation.course_name} 교육과정을 중도 포기했습니다.`
            };

        } catch (error) {
            console.error('교육과정 포기 오류:', error);
            return { success: false, message: '교육과정 포기 중 오류가 발생했습니다.' };
        }
    }

    async checkEducationProgress(playerId) {
        try {
            const ongoingEducation = await this.db.get(`
                SELECT pe.*, ec.*
                FROM player_education pe
                JOIN education_courses ec ON pe.course_id = ec.id
                WHERE pe.player_id = ? AND pe.completed = FALSE
            `, [playerId]);

            if (!ongoingEducation) {
                return null;
            }

            const now = new Date();
            const endDate = new Date(ongoingEducation.end_date);
            const startDate = new Date(ongoingEducation.start_date);
            
            const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            const passedDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
            const progressDays = Math.min(passedDays, totalDays);
            
            // 진행도 업데이트
            await this.db.run(`
                UPDATE player_education SET progress_days = ? WHERE id = ?
            `, [progressDays, ongoingEducation.id]);

            // 교육 완료 체크
            if (now >= endDate) {
                await this.completeEducation(playerId, ongoingEducation);
                return { completed: true, course: ongoingEducation };
            }

            return {
                completed: false,
                course: ongoingEducation,
                progress: progressDays,
                total: totalDays,
                percentage: (progressDays / totalDays * 100).toFixed(1)
            };

        } catch (error) {
            console.error('교육 진행도 확인 오류:', error);
            return null;
        }
    }

    async completeEducation(playerId, education) {
        try {
            // 교육 완료 처리
            await this.db.run(`
                UPDATE player_education SET completed = TRUE WHERE id = ?
            `, [education.id]);

            // 교육 수준 증가
            await this.db.run(`
                UPDATE player_stats SET education = education + ? WHERE player_id = ?
            `, [education.education_gain, playerId]);

            // 스탯 보너스 적용
            if (education.stats_bonus) {
                const bonus = JSON.parse(education.stats_bonus);
                const updates = [];
                const values = [];

                for (const [stat, value] of Object.entries(bonus)) {
                    updates.push(`${stat} = CASE WHEN ${stat} + ? > 100 THEN 100 ELSE ${stat} + ? END`);
                    values.push(value, value);
                }

                values.push(playerId);
                await this.db.run(`UPDATE player_stats SET ${updates.join(', ')} WHERE player_id = ?`, values);
            }

            // 경험치 보상
            const expReward = education.education_gain * 200;
            await this.db.run('UPDATE players SET experience = experience + ? WHERE id = ?', [expReward, playerId]);

            // 행복도 증가
            await this.db.run(`
                UPDATE player_stats 
                SET happiness = CASE WHEN happiness + 20 > 100 THEN 100 ELSE happiness + 20 END
                WHERE player_id = ?
            `, [playerId]);

            console.log(`플레이어 ${playerId} 교육 완료: ${education.name}`);

        } catch (error) {
            console.error('교육 완료 처리 오류:', error);
        }
    }

    async getAvailableCourses(playerId) {
        const stats = await this.db.get('SELECT education FROM player_stats WHERE player_id = ?', [playerId]);
        const currentEducation = stats ? stats.education : 0;

        return await this.db.all(`
            SELECT * FROM education_courses 
            WHERE required_education <= ?
            ORDER BY category, required_education, cost
        `, [currentEducation]);
    }

    async getEducationHistory(playerId) {
        return await this.db.all(`
            SELECT 
                pe.*,
                ec.name as course_name,
                ec.category,
                ec.education_gain
            FROM player_education pe
            JOIN education_courses ec ON pe.course_id = ec.id
            WHERE pe.player_id = ? AND pe.completed = TRUE
            ORDER BY pe.start_date DESC
        `, [playerId]);
    }

    async getEducationRankings() {
        return await this.db.all(`
            SELECT 
                p.username,
                ps.education,
                COUNT(pe.id) as completed_courses
            FROM players p
            JOIN player_stats ps ON p.id = ps.player_id
            LEFT JOIN player_education pe ON p.id = pe.player_id AND pe.completed = TRUE
            GROUP BY p.id, p.username, ps.education
            ORDER BY ps.education DESC, completed_courses DESC
            LIMIT 10
        `);
    }

    async studyDaily(playerId) {
        try {
            // 일일 공부 쿨다운 체크 (24시간)
            const lastStudy = await this.db.get(`
                SELECT * FROM transactions 
                WHERE player_id = ? AND type = 'daily_study' AND description = '일일 공부'
                AND datetime(timestamp) > datetime('now', '-24 hours')
            `, [playerId]);

            if (lastStudy) {
                return { success: false, message: '이미 오늘 공부를 했습니다!' };
            }

            // 스탯 증가
            await this.db.run(`
                UPDATE player_stats 
                SET intelligence = CASE WHEN intelligence + 2 > 100 THEN 100 ELSE intelligence + 2 END,
                    education = education + 0.1
                WHERE player_id = ?
            `, [playerId]);

            // 경험치 보상
            await this.db.run('UPDATE players SET experience = experience + 50 WHERE id = ?', [playerId]);

            // 기록
            await this.db.run(`
                INSERT INTO transactions (player_id, type, amount, description)
                VALUES (?, 'daily_study', 0, '일일 공부')
            `, [playerId]);

            return {
                success: true,
                message: '공부를 완료했습니다!',
                rewards: { intelligence: 2, education: 0.1, experience: 50 }
            };

        } catch (error) {
            console.error('일일 공부 오류:', error);
            return { success: false, message: '공부 중 오류가 발생했습니다.' };
        }
    }

    createCourseListEmbed(courses, currentEducation) {
        const embed = new EmbedBuilder()
            .setColor(0x0000FF)
            .setTitle('📚 수강 가능한 교육과정')
            .setDescription(`현재 교육 수준: ${currentEducation}년`)
            .setTimestamp();

        if (courses.length === 0) {
            embed.setDescription('수강 가능한 교육과정이 없습니다.');
            return embed;
        }

        const categories = {};
        courses.forEach(course => {
            if (!categories[course.category]) {
                categories[course.category] = [];
            }
            categories[course.category].push(course);
        });

        const categoryEmojis = {
            'basic': '📖',
            'tech': '💻',
            'creative': '🎨',
            'practical': '🔧',
            'business': '💼',
            'medical': '⚕️',
            'finance': '💰',
            'leadership': '👑'
        };

        for (const [category, categoryCourses] of Object.entries(categories)) {
            const emoji = categoryEmojis[category] || '📚';
            const coursesText = categoryCourses.map(course => {
                return [
                    `**${course.name}** (ID: ${course.id})`,
                    `💰 수강료: ${course.cost.toLocaleString()}원`,
                    `⏰ 기간: ${course.duration_days}일`,
                    `📊 필요 교육: ${course.required_education}년`,
                    `📈 교육 증가: +${course.education_gain}년`,
                    `📝 ${course.description}`
                ].join('\n');
            }).join('\n\n');

            embed.addFields({
                name: `${emoji} ${category.toUpperCase()}`,
                value: coursesText,
                inline: false
            });
        }

        embed.setFooter({ text: '교육과정에 등록하려면 "/교육 등록 과정id:{ID}"를 사용하세요' });
        return embed;
    }

    createProgressEmbed(progress) {
        const embed = new EmbedBuilder()
            .setColor(0xFFFF00)
            .setTitle('📚 교육 진행 상황')
            .setTimestamp();

        if (progress.completed) {
            embed.setColor(0x00FF00)
                .setTitle('🎓 교육 완료!')
                .setDescription(`${progress.course.name} 교육과정을 완료했습니다!`);
        } else {
            const progressBar = this.createProgressBar(progress.progress, progress.total);
            embed.setDescription(`**${progress.course.name}** 진행 중`)
                .addFields(
                    {
                        name: '📊 진행도',
                        value: `${progressBar}\n${progress.progress}/${progress.total}일 (${progress.percentage}%)`,
                        inline: false
                    },
                    {
                        name: '⏰ 예상 완료일',
                        value: new Date(progress.course.end_date).toLocaleDateString('ko-KR'),
                        inline: true
                    }
                );
        }

        return embed;
    }

    createProgressBar(current, total, length = 10) {
        const percentage = Math.min(current / total, 1);
        const filled = Math.floor(percentage * length);
        const empty = length - filled;
        
        return '🟩'.repeat(filled) + '⬜'.repeat(empty);
    }
}

module.exports = EducationSystem;

