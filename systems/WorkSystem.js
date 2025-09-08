const { EmbedBuilder } = require('discord.js');

class WorkSystem {
    constructor(database) {
        this.db = database;
    }

    async initializeJobs() {
        // 직업 데이터 초기화
        const jobs = [
            // === 기본 직업 (낮은 요구사항) ===
            {
                name: '편의점 알바',
                category: '서비스',
                base_salary: 500000,
                required_education: 0,
                required_stats: JSON.stringify({ intelligence: 30, charm: 40 }),
                description: '편의점에서 근무하는 아르바이트'
            },
            {
                name: '배달원',
                category: '서비스',
                base_salary: 600000,
                required_education: 0,
                required_stats: JSON.stringify({ agility: 60, strength: 50 }),
                description: '음식 배달을 담당하는 직업'
            },
            {
                name: '청소원',
                category: '서비스',
                base_salary: 450000,
                required_education: 0,
                required_stats: JSON.stringify({ strength: 45, health: 60 }),
                description: '건물 청소를 담당하는 직업'
            },
            {
                name: '공장 근무자',
                category: '제조업',
                base_salary: 700000,
                required_education: 0,
                required_stats: JSON.stringify({ strength: 70, health: 65 }),
                description: '공장에서 제품 생산을 담당하는 직업'
            },
            {
                name: '건설 현장 인부',
                category: '건설',
                base_salary: 800000,
                required_education: 0,
                required_stats: JSON.stringify({ strength: 80, health: 75 }),
                description: '건설 현장에서 육체 노동을 담당하는 직업'
            },

            // === 중급 직업 (중간 요구사항) ===
            {
                name: '카페 바리스타',
                category: '서비스',
                base_salary: 1200000,
                required_education: 1,
                required_stats: JSON.stringify({ intelligence: 60, charm: 70, agility: 55 }),
                description: '카페에서 커피를 제조하고 서비스하는 직업'
            },
            {
                name: '매장 판매원',
                category: '판매',
                base_salary: 1000000,
                required_education: 1,
                required_stats: JSON.stringify({ charm: 75, intelligence: 55, luck: 50 }),
                description: '매장에서 상품을 판매하는 직업'
            },
            {
                name: '사무직 보조',
                category: '사무',
                base_salary: 1500000,
                required_education: 2,
                required_stats: JSON.stringify({ intelligence: 70, agility: 60, charm: 55 }),
                description: '사무실에서 문서 처리와 보조 업무를 담당하는 직업'
            },
            {
                name: '기술자',
                category: '기술',
                base_salary: 1800000,
                required_education: 3,
                required_stats: JSON.stringify({ intelligence: 80, strength: 60, agility: 55 }),
                description: '기술적 업무를 담당하는 직업'
            },
            {
                name: '운전기사',
                category: '운송',
                base_salary: 1600000,
                required_education: 1,
                required_stats: JSON.stringify({ agility: 75, intelligence: 60, health: 65 }),
                description: '운송업무를 담당하는 직업'
            },

            // === 고급 직업 (높은 요구사항) ===
            {
                name: '간호사',
                category: '의료',
                base_salary: 2500000,
                required_education: 4,
                required_stats: JSON.stringify({ intelligence: 85, charm: 80, health: 70, agility: 65 }),
                description: '의료진을 보조하고 환자를 돌보는 직업'
            },
            {
                name: '교사',
                category: '교육',
                base_salary: 2200000,
                required_education: 4,
                required_stats: JSON.stringify({ intelligence: 90, charm: 85, luck: 60 }),
                description: '학생들을 가르치는 교육자'
            },
            {
                name: '회계사',
                category: '금융',
                base_salary: 3000000,
                required_education: 4,
                required_stats: JSON.stringify({ intelligence: 95, agility: 70, luck: 65 }),
                description: '회계 업무를 담당하는 전문직'
            },
            {
                name: '엔지니어',
                category: '기술',
                base_salary: 3500000,
                required_education: 4,
                required_stats: JSON.stringify({ intelligence: 90, strength: 70, agility: 75 }),
                description: '기술 개발과 설계를 담당하는 직업'
            },
            {
                name: '마케터',
                category: '마케팅',
                base_salary: 2800000,
                required_education: 3,
                required_stats: JSON.stringify({ intelligence: 85, charm: 90, luck: 75, agility: 70 }),
                description: '마케팅 전략을 수립하고 실행하는 직업'
            },

            // === 전문직 (매우 높은 요구사항) ===
            {
                name: '의사',
                category: '의료',
                base_salary: 5000000,
                required_education: 6,
                required_stats: JSON.stringify({ intelligence: 95, charm: 85, health: 80, agility: 70, luck: 70 }),
                description: '환자를 진료하고 치료하는 의료 전문가'
            },
            {
                name: '변호사',
                category: '법률',
                base_salary: 4500000,
                required_education: 6,
                required_stats: JSON.stringify({ intelligence: 95, charm: 90, agility: 75, luck: 80 }),
                description: '법률 문제를 해결하는 법률 전문가'
            },
            {
                name: '건축가',
                category: '건설',
                base_salary: 4000000,
                required_education: 5,
                required_stats: JSON.stringify({ intelligence: 90, strength: 75, agility: 80, charm: 70 }),
                description: '건물을 설계하는 건축 전문가'
            },
            {
                name: '투자은행가',
                category: '금융',
                base_salary: 6000000,
                required_education: 5,
                required_stats: JSON.stringify({ intelligence: 95, charm: 90, luck: 85, agility: 80 }),
                description: '대규모 투자와 금융 거래를 담당하는 전문가'
            },
            {
                name: '연구원',
                category: '과학',
                base_salary: 3800000,
                required_education: 6,
                required_stats: JSON.stringify({ intelligence: 95, agility: 70, luck: 75, health: 65 }),
                description: '과학 연구를 수행하는 연구 전문가'
            },

            // === 최고급 직업 (극한 요구사항) ===
            {
                name: '외과의사',
                category: '의료',
                base_salary: 8000000,
                required_education: 8,
                required_stats: JSON.stringify({ intelligence: 98, charm: 85, health: 85, agility: 85, luck: 80, strength: 75 }),
                description: '수술을 담당하는 최고급 의료 전문가'
            },
            {
                name: '대기업 CEO',
                category: '경영',
                base_salary: 15000000,
                required_education: 6,
                required_stats: JSON.stringify({ intelligence: 95, charm: 95, luck: 90, agility: 85, strength: 70 }),
                description: '대기업을 경영하는 최고 경영자'
            },
            {
                name: '대법관',
                category: '법률',
                base_salary: 12000000,
                required_education: 8,
                required_stats: JSON.stringify({ intelligence: 98, charm: 90, luck: 85, agility: 80, health: 75 }),
                description: '최고 법원에서 판결을 내리는 법률 전문가'
            },
            {
                name: '항공기 조종사',
                category: '운송',
                base_salary: 7000000,
                required_education: 4,
                required_stats: JSON.stringify({ intelligence: 90, agility: 95, health: 90, luck: 85, charm: 75 }),
                description: '항공기를 조종하는 전문 조종사'
            },
            {
                name: '우주비행사',
                category: '과학',
                base_salary: 10000000,
                required_education: 6,
                required_stats: JSON.stringify({ intelligence: 95, health: 95, agility: 90, strength: 85, luck: 80, charm: 75 }),
                description: '우주 탐사를 담당하는 최고급 전문가'
            }
        ];

        for (const job of jobs) {
            await this.db.run(`
                INSERT OR IGNORE INTO jobs (name, category, base_salary, required_education, required_stats, description)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [job.name, job.category, job.base_salary, job.required_education, job.required_stats, job.description]);
        }

        // console.log('직업 데이터 초기화 완료');
    }

    async getJobList() {
        return await this.db.all('SELECT * FROM jobs ORDER BY base_salary ASC');
    }

    async getJobById(jobId) {
        return await this.db.get('SELECT * FROM jobs WHERE id = ?', [jobId]);
    }
}

module.exports = WorkSystem;
