const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

class Database {
    constructor() {
        this.client = null;
        this.init();
    }

    async init() {
        try {
            // Railway에서 DATABASE_URL 환경변수 사용, 없으면 로컬 SQLite 사용
            if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
                console.log('DATABASE_URL 발견, PostgreSQL 연결 시도 중...');
                console.log('DATABASE_URL:', process.env.DATABASE_URL.substring(0, 20) + '...');
                
                try {
                    // DATABASE_URL 파싱 및 검증
                    const dbUrl = process.env.DATABASE_URL.trim();
                    
                    // 기본 템플릿 URL인지 확인
                    if (dbUrl.includes('host:port') || dbUrl.includes('password@host')) {
                        throw new Error('DATABASE_URL이 기본 템플릿 값입니다. 실제 Railway 데이터베이스 URL로 설정해주세요.');
                    }
                    
                    const url = new URL(dbUrl);
                    if (!url.protocol || !url.hostname || url.hostname === 'host') {
                        throw new Error('Invalid DATABASE_URL format');
                    }
                    
                    this.client = new Client({
                        connectionString: process.env.DATABASE_URL,
                        ssl: {
                            rejectUnauthorized: false
                        }
                    });
                    await this.client.connect();
                    console.log('PostgreSQL 데이터베이스에 연결되었습니다.');
                    await this.createTables();
                } catch (pgError) {
                    console.error('PostgreSQL 연결 실패:', pgError.message);
                    throw pgError;
                }
            } else {
                console.log('DATABASE_URL이 없거나 비어있음, SQLite 사용');
                // 로컬 개발용 SQLite 연결
                const sqlite3 = require('sqlite3').verbose();
                const filename = 'game.db';
                const dbPath = path.join(__dirname, filename);
                
                this.client = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('데이터베이스 연결 오류:', err);
                        throw err;
                } else {
                    console.log('SQLite 데이터베이스에 연결되었습니다.');
                    }
                });
                await this.createTables();
            }
        } catch (error) {
            console.error('데이터베이스 초기화 오류:', error);
            console.log('SQLite로 폴백 시도 중...');
            
            try {
                // PostgreSQL 연결 실패 시 SQLite로 폴백
                const sqlite3 = require('sqlite3').verbose();
                const filename = 'game.db';
                const dbPath = path.join(__dirname, filename);
                
                this.client = new sqlite3.Database(dbPath, (err) => {
                    if (err) {
                        console.error('SQLite 폴백도 실패:', err);
                        throw err;
                    } else {
                        console.log('SQLite 데이터베이스로 폴백 성공');
                    }
                });
                await this.createTables();
            } catch (fallbackError) {
                console.error('모든 데이터베이스 연결 실패:', fallbackError);
                throw fallbackError;
            }
        }
    }

    async createTables() {
        // PostgreSQL인지 SQLite인지 확인
        if (this.client && typeof this.client.query === 'function') {
            // PostgreSQL - PostgreSQL용 스키마 사용
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
            
            try {
                await this.client.query(schema);
                    console.log('PostgreSQL 테이블이 생성되었습니다. (v2.0)');
                await this.seedInitialData();
            } catch (error) {
                console.error('PostgreSQL 테이블 생성 오류:', error);
                throw error;
            }
        } else {
            // SQLite - SQLite용 스키마 사용 (AUTOINCREMENT)
            const schemaPath = path.join(__dirname, 'schema.sql');
            let schema = fs.readFileSync(schemaPath, 'utf8');
            
            // PostgreSQL 문법을 SQLite 문법으로 변환
            schema = schema.replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT');
            schema = schema.replace(/TIMESTAMP/g, 'DATETIME');
        
        return new Promise((resolve, reject) => {
                this.client.exec(schema, (err) => {
                if (err) {
                        console.error('SQLite 테이블 생성 오류:', err);
                    reject(err);
                } else {
                        console.log('SQLite 테이블이 생성되었습니다. (v2.0)');
                    this.seedInitialData().then(resolve).catch(reject);
                }
            });
        });
        }
    }

    async seedInitialData() {
        // 기본 직업 데이터는 WorkSystem에서 관리

        // 기본 주식 데이터 (대폭 확장 - 100개 이상)
        const stocks = [
            // 기술주 (30개)
            { symbol: 'SAMSUNG', name: '삼성전자', current_price: 70000, sector: 'technology' },
            { symbol: 'NAVER', name: '네이버', current_price: 200000, sector: 'technology' },
            { symbol: 'KAKAO', name: '카카오', current_price: 80000, sector: 'technology' },
            { symbol: 'NCSOFT', name: 'NC소프트', current_price: 320000, sector: 'technology' },
            { symbol: 'NEXON', name: '넥슨', current_price: 85000, sector: 'technology' },
            { symbol: 'NETMARBLE', name: '넷마블', current_price: 45000, sector: 'technology' },
            { symbol: 'PEARL_ABYSS', name: '펄어비스', current_price: 55000, sector: 'technology' },
            { symbol: 'KRAFTON', name: '크래프톤', current_price: 180000, sector: 'technology' },
            { symbol: 'DOUZONE', name: '더존비즈온', current_price: 120000, sector: 'technology' },
            { symbol: 'HANCOM', name: '한컴', current_price: 25000, sector: 'technology' },
            { symbol: 'WEMADE', name: '위메이드', current_price: 35000, sector: 'technology' },
            { symbol: 'SMILEGATE', name: '스마일게이트', current_price: 90000, sector: 'technology' },
            { symbol: 'QUANTUM', name: '퀀텀메카닉스', current_price: 12000, sector: 'technology' },
            { symbol: 'DATASTREAMS', name: '데이터스트림즈', current_price: 18000, sector: 'technology' },
            { symbol: 'CLOUDTECH', name: '클라우드테크', current_price: 42000, sector: 'technology' },
            { symbol: 'AILOGIC', name: 'AI로직', current_price: 68000, sector: 'technology' },
            { symbol: 'BLOCKCHAIN', name: '블록체인코리아', current_price: 95000, sector: 'technology' },
            { symbol: 'CYBERSEC', name: '사이버시큐리티', current_price: 73000, sector: 'technology' },
            { symbol: 'IOTDEV', name: 'IoT개발', current_price: 28000, sector: 'technology' },
            { symbol: 'METAVERSE', name: '메타버스테크', current_price: 115000, sector: 'technology' },
            { symbol: 'ROBOTICS', name: '로보틱스코리아', current_price: 87000, sector: 'technology' },
            { symbol: 'VRGAMES', name: 'VR게임즈', current_price: 34000, sector: 'technology' },
            { symbol: 'MACHINELEARN', name: '머신러닝테크', current_price: 156000, sector: 'technology' },
            { symbol: 'BIGDATA', name: '빅데이터솔루션', current_price: 67000, sector: 'technology' },
            { symbol: 'EDTECH', name: '에듀테크', current_price: 39000, sector: 'technology' },
            { symbol: 'FINTECH', name: '핀테크코리아', current_price: 124000, sector: 'technology' },
            { symbol: 'MEDTECH', name: '메드테크', current_price: 89000, sector: 'technology' },
            { symbol: 'AUTOTECH', name: '오토테크', current_price: 45000, sector: 'technology' },
            { symbol: 'GREENTECH', name: '그린테크', current_price: 52000, sector: 'technology' },
            { symbol: 'SPACETECH', name: '스페이스테크', current_price: 98000, sector: 'technology' },

            // 금융주 (20개)
            { symbol: 'KB', name: 'KB금융', current_price: 52000, sector: 'finance' },
            { symbol: 'SHINHAN', name: '신한지주', current_price: 38000, sector: 'finance' },
            { symbol: 'HANA', name: '하나금융지주', current_price: 46000, sector: 'finance' },
            { symbol: 'WOORI', name: '우리금융지주', current_price: 13500, sector: 'finance' },
            { symbol: 'IBK', name: 'IBK기업은행', current_price: 11200, sector: 'finance' },
            { symbol: 'SAMSUNG_LIFE', name: '삼성생명', current_price: 78000, sector: 'finance' },
            { symbol: 'HANWHA_LIFE', name: '한화생명', current_price: 3200, sector: 'finance' },
            { symbol: 'KYOBO_LIFE', name: '교보생명', current_price: 2850, sector: 'finance' },
            { symbol: 'SAMSUNG_FIRE', name: '삼성화재', current_price: 260000, sector: 'finance' },
            { symbol: 'DB_INSURANCE', name: 'DB손해보험', current_price: 92000, sector: 'finance' },
            { symbol: 'MERITZ', name: '메리츠금융지주', current_price: 55000, sector: 'finance' },
            { symbol: 'BNK', name: 'BNK금융지주', current_price: 6800, sector: 'finance' },
            { symbol: 'DGB', name: 'DGB금융지주', current_price: 8200, sector: 'finance' },
            { symbol: 'JB', name: 'JB금융지주', current_price: 9500, sector: 'finance' },
            { symbol: 'CARD_CORP', name: '카드코퍼레이션', current_price: 23000, sector: 'finance' },
            { symbol: 'LOAN_TECH', name: '론테크', current_price: 18000, sector: 'finance' },
            { symbol: 'INVEST_PLUS', name: '인베스트플러스', current_price: 34000, sector: 'finance' },
            { symbol: 'FUND_MASTER', name: '펀드마스터', current_price: 42000, sector: 'finance' },
            { symbol: 'CRYPTO_BANK', name: '크립토뱅크', current_price: 67000, sector: 'finance' },
            { symbol: 'DIGITAL_PAY', name: '디지털페이', current_price: 29000, sector: 'finance' },

            // 제조업 (20개)
            { symbol: 'HYUNDAI', name: '현대자동차', current_price: 195000, sector: 'automotive' },
            { symbol: 'KIA', name: '기아', current_price: 85000, sector: 'automotive' },
            { symbol: 'LG_CHEM', name: 'LG화학', current_price: 450000, sector: 'chemical' },
            { symbol: 'SK_HYNIX', name: 'SK하이닉스', current_price: 120000, sector: 'semiconductor' },
            { symbol: 'POSCO', name: '포스코', current_price: 380000, sector: 'steel' },
            { symbol: 'LG_ENERGY', name: 'LG에너지솔루션', current_price: 420000, sector: 'battery' },
            { symbol: 'SK_INNO', name: 'SK이노베이션', current_price: 195000, sector: 'energy' },
            { symbol: 'HANWHA_SOL', name: '한화솔루션', current_price: 38000, sector: 'chemical' },
            { symbol: 'LOTTE_CHEM', name: '롯데케미칼', current_price: 180000, sector: 'chemical' },
            { symbol: 'KUMHO_PETRO', name: '금호석유화학', current_price: 95000, sector: 'chemical' },
            { symbol: 'DOOSAN', name: '두산', current_price: 78000, sector: 'machinery' },
            { symbol: 'HD_HYUNDAI', name: 'HD한국조선해양', current_price: 125000, sector: 'shipbuilding' },
            { symbol: 'SAMSUNG_HEAVY', name: '삼성중공업', current_price: 7200, sector: 'shipbuilding' },
            { symbol: 'DAEWOO_SHIP', name: '대우조선해양', current_price: 23000, sector: 'shipbuilding' },
            { symbol: 'STEEL_MASTER', name: '스틸마스터', current_price: 45000, sector: 'steel' },
            { symbol: 'AUTO_PARTS', name: '오토파츠', current_price: 32000, sector: 'automotive' },
            { symbol: 'BATTERY_TECH', name: '배터리테크', current_price: 89000, sector: 'battery' },
            { symbol: 'SOLAR_POWER', name: '솔라파워', current_price: 56000, sector: 'energy' },
            { symbol: 'WIND_ENERGY', name: '윈드에너지', current_price: 67000, sector: 'energy' },
            { symbol: 'HYDRO_TECH', name: '하이드로테크', current_price: 43000, sector: 'energy' },

            // 엔터테인먼트 (15개)
            { symbol: 'HYBE', name: '하이브', current_price: 150000, sector: 'entertainment' },
            { symbol: 'SM', name: 'SM엔터테인먼트', current_price: 85000, sector: 'entertainment' },
            { symbol: 'YG', name: 'YG엔터테인먼트', current_price: 42000, sector: 'entertainment' },
            { symbol: 'JYP', name: 'JYP엔터테인먼트', current_price: 68000, sector: 'entertainment' },
            { symbol: 'CJ_ENM', name: 'CJ ENM', current_price: 78000, sector: 'entertainment' },
            { symbol: 'LOTTE_ENT', name: '롯데엔터테인먼트', current_price: 34000, sector: 'entertainment' },
            { symbol: 'SHOWBOX', name: '쇼박스', current_price: 1200, sector: 'entertainment' },
            { symbol: 'CONTENTS_K', name: '콘텐츠코리아', current_price: 23000, sector: 'entertainment' },
            { symbol: 'DRAMA_HOUSE', name: '드라마하우스', current_price: 18000, sector: 'entertainment' },
            { symbol: 'MOVIE_PLUS', name: '무비플러스', current_price: 29000, sector: 'entertainment' },
            { symbol: 'MUSIC_STREAM', name: '뮤직스트림', current_price: 45000, sector: 'entertainment' },
            { symbol: 'WEBTOON', name: '웹툰엔터', current_price: 52000, sector: 'entertainment' },
            { symbol: 'ESPORTS', name: '이스포츠코리아', current_price: 38000, sector: 'entertainment' },
            { symbol: 'VARIETY_SHOW', name: '버라이어티쇼', current_price: 25000, sector: 'entertainment' },
            { symbol: 'ANIMATION', name: '애니메이션스튜디오', current_price: 41000, sector: 'entertainment' },

            // 바이오/의료 (10개)
            { symbol: 'CELLTRION', name: '셀트리온', current_price: 180000, sector: 'bio' },
            { symbol: 'SAMSUNG_BIO', name: '삼성바이오로직스', current_price: 850000, sector: 'bio' },
            { symbol: 'SK_BIOPHARM', name: 'SK바이오팜', current_price: 85000, sector: 'bio' },
            { symbol: 'BIOMED', name: '바이오메드', current_price: 67000, sector: 'bio' },
            { symbol: 'GENE_TECH', name: '진테크', current_price: 45000, sector: 'bio' },
            { symbol: 'PHARMA_PLUS', name: '파마플러스', current_price: 89000, sector: 'bio' },
            { symbol: 'MEDICAL_DEV', name: '메디컬디바이스', current_price: 56000, sector: 'medical' },
            { symbol: 'HOSPITAL_NET', name: '병원네트워크', current_price: 78000, sector: 'medical' },
            { symbol: 'HEALTH_CARE', name: '헬스케어', current_price: 42000, sector: 'medical' },
            { symbol: 'WELLNESS', name: '웰니스', current_price: 34000, sector: 'medical' },

            // 기타 (5개)
            { symbol: 'FOOD_CORP', name: '푸드코퍼레이션', current_price: 32000, sector: 'food' },
            { symbol: 'FASHION_HOUSE', name: '패션하우스', current_price: 28000, sector: 'fashion' },
            { symbol: 'TRAVEL_PLUS', name: '트래블플러스', current_price: 45000, sector: 'travel' },
            { symbol: 'REAL_ESTATE', name: '리얼에스테이트', current_price: 67000, sector: 'real_estate' },
            { symbol: 'LOGISTICS', name: '로지스틱스', current_price: 52000, sector: 'logistics' }
        ];

        // 기본 펫 타입 (대폭 확장 - 50개 이상)
        const petTypes = [
            // 일반 반려동물 (15개)
            { name: '강아지', category: 'companion', base_price: 50000, special_ability: 'loyalty_bonus', description: '충실한 반려동물' },
            { name: '고양이', category: 'companion', base_price: 30000, special_ability: 'stress_relief', description: '스트레스 해소' },
            { name: '토끼', category: 'companion', base_price: 25000, special_ability: 'luck_boost', description: '행운을 가져다주는 토끼' },
            { name: '햄스터', category: 'companion', base_price: 15000, special_ability: 'energy_save', description: '에너지 절약 도우미' },
            { name: '기니피그', category: 'companion', base_price: 20000, special_ability: 'health_boost', description: '건강 증진 도움' },
            { name: '페럿', category: 'companion', base_price: 80000, special_ability: 'agility_boost', description: '민첩성 향상' },
            { name: '친칠라', category: 'companion', base_price: 60000, special_ability: 'charm_boost', description: '매력 증가' },
            { name: '앵무새', category: 'companion', base_price: 100000, special_ability: 'intelligence_boost', description: '지능 향상' },
            { name: '카나리아', category: 'companion', base_price: 40000, special_ability: 'happiness_boost', description: '행복도 증가' },
            { name: '금붕어', category: 'companion', base_price: 10000, special_ability: 'peace_mind', description: '마음의 평화' },
            { name: '거북이', category: 'companion', base_price: 35000, special_ability: 'longevity', description: '장수 기원' },
            { name: '이구아나', category: 'companion', base_price: 70000, special_ability: 'coolness', description: '쿨함 증가' },
            { name: '뱀', category: 'companion', base_price: 90000, special_ability: 'wisdom', description: '지혜 증진' },
            { name: '도마뱀', category: 'companion', base_price: 45000, special_ability: 'adaptability', description: '적응력 향상' },
            { name: '타란튤라', category: 'companion', base_price: 65000, special_ability: 'courage', description: '용기 증진' },

            // 경제형 펫 (10개)
            { name: '황금거위', category: 'economic', base_price: 500000, special_ability: 'money_generator', description: '매일 돈을 생산' },
            { name: '투자앵무', category: 'economic', base_price: 300000, special_ability: 'stock_tip', description: '주식 정보 제공' },
            { name: '부자 고양이', category: 'economic', base_price: 400000, special_ability: 'wealth_multiplier', description: '수익 증가' },
            { name: '금고 강아지', category: 'economic', base_price: 350000, special_ability: 'savings_boost', description: '저축 도움' },
            { name: '상인 여우', category: 'economic', base_price: 450000, special_ability: 'bargain_hunter', description: '할인 혜택' },
            { name: '채굴 두더지', category: 'economic', base_price: 600000, special_ability: 'resource_finder', description: '자원 발견' },
            { name: '수확 다람쥐', category: 'economic', base_price: 280000, special_ability: 'harvest_bonus', description: '수확량 증가' },
            { name: '배달 비둘기', category: 'economic', base_price: 320000, special_ability: 'delivery_speed', description: '배달 수익' },
            { name: '은행 올빼미', category: 'economic', base_price: 550000, special_ability: 'interest_boost', description: '이자 증가' },
            { name: '보험 거북', category: 'economic', base_price: 380000, special_ability: 'risk_reduction', description: '리스크 감소' },

            // 마법 펫 (10개)
            { name: '마법 고양이', category: 'magical', base_price: 800000, special_ability: 'magic_luck', description: '마법적 행운' },
            { name: '시간 늑대', category: 'magical', base_price: 1200000, special_ability: 'time_control', description: '시간 조작' },
            { name: '예언 까마귀', category: 'magical', base_price: 900000, special_ability: 'future_sight', description: '미래 예측' },
            { name: '치유 유니콘', category: 'magical', base_price: 1500000, special_ability: 'healing_power', description: '치유 능력' },
            { name: '행운 용', category: 'magical', base_price: 2000000, special_ability: 'dragon_luck', description: '용의 행운' },
            { name: '지혜 부엉이', category: 'magical', base_price: 750000, special_ability: 'wisdom_boost', description: '지혜 증진' },
            { name: '은하 토끼', category: 'magical', base_price: 1100000, special_ability: 'cosmic_power', description: '우주의 힘' },
            { name: '불사조', category: 'magical', base_price: 3000000, special_ability: 'rebirth', description: '재생 능력' },
            { name: '정령 여우', category: 'magical', base_price: 850000, special_ability: 'nature_bond', description: '자연과의 교감' },
            { name: '수정 늑대', category: 'magical', base_price: 1300000, special_ability: 'crystal_power', description: '수정의 힘' },

            // 전투형 펫 (8개)
            { name: '전투 늑대', category: 'combat', base_price: 600000, special_ability: 'combat_boost', description: '전투력 증가' },
            { name: '방어 거북', category: 'combat', base_price: 500000, special_ability: 'defense_boost', description: '방어력 증가' },
            { name: '민첩 표범', category: 'combat', base_price: 700000, special_ability: 'speed_boost', description: '속도 증가' },
            { name: '힘센 곰', category: 'combat', base_price: 800000, special_ability: 'strength_boost', description: '힘 증가' },
            { name: '독수리', category: 'combat', base_price: 650000, special_ability: 'critical_boost', description: '크리티컬 증가' },
            { name: '사자', category: 'combat', base_price: 900000, special_ability: 'leadership', description: '리더십 발휘' },
            { name: '호랑이', category: 'combat', base_price: 950000, special_ability: 'intimidation', description: '위압감' },
            { name: '샤크', category: 'combat', base_price: 750000, special_ability: 'predator_instinct', description: '포식자 본능' },

            // 희귀 펫 (7개)
            { name: '레인보우 유니콘', category: 'legendary', base_price: 5000000, special_ability: 'rainbow_blessing', description: '무지개 축복' },
            { name: '고대 용', category: 'legendary', base_price: 10000000, special_ability: 'ancient_wisdom', description: '고대의 지혜' },
            { name: '우주 고래', category: 'legendary', base_price: 8000000, special_ability: 'cosmic_song', description: '우주의 노래' },
            { name: '빛의 사자', category: 'legendary', base_price: 7000000, special_ability: 'light_power', description: '빛의 힘' },
            { name: '그림자 늑대', category: 'legendary', base_price: 6000000, special_ability: 'shadow_stealth', description: '그림자 은신' },
            { name: '시공간 여우', category: 'legendary', base_price: 9000000, special_ability: 'dimension_hop', description: '차원 이동' },
            { name: '창조주 펭귄', category: 'legendary', base_price: 15000000, special_ability: 'creation_power', description: '창조의 힘' },

            // 신규 일반 펫 (10개)
            { name: '파란 앵무새', category: 'companion', base_price: 80000, special_ability: 'communication', description: '의사소통 능력 향상' },
            { name: '치와와', category: 'companion', base_price: 45000, special_ability: 'cuteness', description: '매력 증가' },
            { name: '페르시안 고양이', category: 'companion', base_price: 120000, special_ability: 'elegance', description: '우아함 증가' },
            { name: '골든 리트리버', category: 'companion', base_price: 90000, special_ability: 'friendship', description: '친화력 증가' },
            { name: '시베리안 허스키', category: 'companion', base_price: 150000, special_ability: 'endurance', description: '지구력 증가' },
            { name: '코카툴', category: 'companion', base_price: 180000, special_ability: 'talent_show', description: '재능 발현' },
            { name: '친칠라', category: 'companion', base_price: 75000, special_ability: 'softness', description: '부드러운 마음' },
            { name: '미니어처 호스', category: 'companion', base_price: 300000, special_ability: 'nobility', description: '고귀함 증가' },
            { name: '알파카', category: 'companion', base_price: 250000, special_ability: 'warmth', description: '따뜻함 제공' },
            { name: '쿼카', category: 'companion', base_price: 200000, special_ability: 'eternal_smile', description: '영원한 미소' },

            // 신규 경제형 펫 (8개)
            { name: '비트코인 햄스터', category: 'economic', base_price: 800000, special_ability: 'crypto_mine', description: '암호화폐 채굴' },
            { name: '주식 분석 원숭이', category: 'economic', base_price: 750000, special_ability: 'market_analysis', description: '시장 분석' },
            { name: '부동산 곰', category: 'economic', base_price: 900000, special_ability: 'property_finder', description: '부동산 발굴' },
            { name: '창업 여우', category: 'economic', base_price: 850000, special_ability: 'business_idea', description: '사업 아이디어 제공' },
            { name: '절약 다람쥐', category: 'economic', base_price: 400000, special_ability: 'expense_cut', description: '지출 절약' },
            { name: '로또 토끼', category: 'economic', base_price: 600000, special_ability: 'lottery_luck', description: '로또 행운' },
            { name: '세금 고양이', category: 'economic', base_price: 550000, special_ability: 'tax_save', description: '세금 절약' },
            { name: '펀드 펭귄', category: 'economic', base_price: 700000, special_ability: 'fund_manager', description: '펀드 관리' },

            // 신규 마법 펫 (12개)
            { name: '얼음 여왕 고양이', category: 'magical', base_price: 1600000, special_ability: 'ice_magic', description: '얼음 마법' },
            { name: '불꽃 강아지', category: 'magical', base_price: 1400000, special_ability: 'fire_magic', description: '화염 마법' },
            { name: '바람 독수리', category: 'magical', base_price: 1800000, special_ability: 'wind_magic', description: '바람 마법' },
            { name: '대지 곰', category: 'magical', base_price: 2200000, special_ability: 'earth_magic', description: '대지 마법' },
            { name: '번개 늑대', category: 'magical', base_price: 2000000, special_ability: 'lightning_magic', description: '번개 마법' },
            { name: '그림자 호랑이', category: 'magical', base_price: 2500000, special_ability: 'shadow_magic', description: '그림자 마법' },
            { name: '별빛 토끼', category: 'magical', base_price: 1700000, special_ability: 'star_magic', description: '별빛 마법' },
            { name: '달빛 여우', category: 'magical', base_price: 1900000, special_ability: 'moon_magic', description: '달빛 마법' },
            { name: '태양 사자', category: 'magical', base_price: 2800000, special_ability: 'sun_magic', description: '태양 마법' },
            { name: '시간 거북', category: 'magical', base_price: 3500000, special_ability: 'time_magic', description: '시간 마법' },
            { name: '공간 고래', category: 'magical', base_price: 4000000, special_ability: 'space_magic', description: '공간 마법' },
            { name: '무지개 나비', category: 'magical', base_price: 1300000, special_ability: 'rainbow_magic', description: '무지개 마법' },

            // 신규 전투형 펫 (10개)
            { name: '전투 기계 강아지', category: 'combat', base_price: 1200000, special_ability: 'tech_combat', description: '기술 전투' },
            { name: '닌자 고양이', category: 'combat', base_price: 1100000, special_ability: 'stealth_attack', description: '은신 공격' },
            { name: '검술 여우', category: 'combat', base_price: 1300000, special_ability: 'sword_master', description: '검술 마스터' },
            { name: '방패 거북', category: 'combat', base_price: 900000, special_ability: 'shield_master', description: '방패 마스터' },
            { name: '활 독수리', category: 'combat', base_price: 1000000, special_ability: 'archery_master', description: '궁술 마스터' },
            { name: '마법 전사 사자', category: 'combat', base_price: 1500000, special_ability: 'magic_warrior', description: '마법 전사' },
            { name: '암살자 표범', category: 'combat', base_price: 1400000, special_ability: 'assassin', description: '암살자' },
            { name: '베르세르크 곰', category: 'combat', base_price: 1600000, special_ability: 'berserker', description: '광전사' },
            { name: '사무라이 늑대', category: 'combat', base_price: 1700000, special_ability: 'samurai', description: '사무라이' },
            { name: '팰러딘 말', category: 'combat', base_price: 1800000, special_ability: 'paladin', description: '성기사' },

            // 신규 학습형 펫 (8개)
            { name: '교수 부엉이', category: 'academic', base_price: 600000, special_ability: 'teaching', description: '교육 능력 향상' },
            { name: '도서관 쥐', category: 'academic', base_price: 300000, special_ability: 'reading_speed', description: '독서 속도 증가' },
            { name: '수학 앵무새', category: 'academic', base_price: 450000, special_ability: 'math_genius', description: '수학 천재' },
            { name: '과학 비글', category: 'academic', base_price: 500000, special_ability: 'scientific_method', description: '과학적 사고' },
            { name: '언어 카멜레온', category: 'academic', base_price: 700000, special_ability: 'polyglot', description: '다국어 능력' },
            { name: '기억 코끼리', category: 'academic', base_price: 800000, special_ability: 'perfect_memory', description: '완벽한 기억력' },
            { name: '창의 돌고래', category: 'academic', base_price: 650000, special_ability: 'creativity', description: '창의력 향상' },
            { name: '논리 여우', category: 'academic', base_price: 550000, special_ability: 'logical_thinking', description: '논리적 사고' },

            // 신규 치료형 펫 (6개)
            { name: '힐링 고양이', category: 'healing', base_price: 400000, special_ability: 'stress_heal', description: '스트레스 치유' },
            { name: '회복 강아지', category: 'healing', base_price: 450000, special_ability: 'energy_restore', description: '에너지 회복' },
            { name: '정화 토끼', category: 'healing', base_price: 350000, special_ability: 'purification', description: '정화 능력' },
            { name: '평온 거북', category: 'healing', base_price: 300000, special_ability: 'peace_mind', description: '마음의 평화' },
            { name: '생명 나비', category: 'healing', base_price: 500000, special_ability: 'life_force', description: '생명력 증가' },
            { name: '재생 도마뱀', category: 'healing', base_price: 600000, special_ability: 'regeneration', description: '재생 능력' },

            // 신규 특수 펫 (8개)
            { name: '시간 여행 햄스터', category: 'special', base_price: 2500000, special_ability: 'time_travel', description: '시간 여행' },
            { name: '차원 이동 고양이', category: 'special', base_price: 3000000, special_ability: 'dimension_travel', description: '차원 이동' },
            { name: '미래 예측 올빼미', category: 'special', base_price: 2200000, special_ability: 'future_vision', description: '미래 예측' },
            { name: '과거 회상 코끼리', category: 'special', base_price: 2000000, special_ability: 'past_recall', description: '과거 회상' },
            { name: '확률 조작 토끼', category: 'special', base_price: 4000000, special_ability: 'probability_control', description: '확률 조작' },
            { name: '운명 변경 여우', category: 'special', base_price: 5000000, special_ability: 'fate_change', description: '운명 변경' },
            { name: '현실 왜곡 펭귄', category: 'special', base_price: 6000000, special_ability: 'reality_warp', description: '현실 왜곡' },
            { name: '우주 조작 고래', category: 'special', base_price: 10000000, special_ability: 'universe_control', description: '우주 조작' }
        ];

        // 기본 아이템 (대폭 확장)
        const items = [
            // 소비용품 (20개)
            { name: '에너지 드링크', category: 'consumable', rarity: 'common', price: 2000, consumable: true, stats_effect: JSON.stringify({health: 10}), description: '체력 회복' },
            { name: '커피', category: 'consumable', rarity: 'common', price: 1500, consumable: true, stats_effect: JSON.stringify({intelligence: 5}), description: '지능 일시 증가' },
            { name: '에너지바', category: 'consumable', rarity: 'common', price: 3000, consumable: true, stats_effect: JSON.stringify({strength: 5}), description: '근력 일시 증가' },
            { name: '비타민', category: 'consumable', rarity: 'common', price: 5000, consumable: true, stats_effect: JSON.stringify({health: 15}), description: '건강 증진' },
            { name: '프로틴 셰이크', category: 'consumable', rarity: 'rare', price: 8000, consumable: true, stats_effect: JSON.stringify({strength: 10, health: 5}), description: '근력과 건강 동시 증가' },
            { name: '두뇌 영양제', category: 'consumable', rarity: 'rare', price: 12000, consumable: true, stats_effect: JSON.stringify({intelligence: 15}), description: '뇌 기능 향상' },
            { name: '매력 보충제', category: 'consumable', rarity: 'rare', price: 10000, consumable: true, stats_effect: JSON.stringify({charm: 10}), description: '매력 증가' },
            { name: '행운의 물약', category: 'consumable', rarity: 'epic', price: 50000, consumable: true, stats_effect: JSON.stringify({luck: 20}), description: '행운 대폭 증가' },
            { name: '민첩성 강화제', category: 'consumable', rarity: 'rare', price: 15000, consumable: true, stats_effect: JSON.stringify({agility: 12}), description: '민첩성 향상' },
            { name: '행복 캔디', category: 'consumable', rarity: 'common', price: 3500, consumable: true, stats_effect: JSON.stringify({happiness: 8}), description: '기분 좋아지는 캔디' },
            { name: '만능 영양제', category: 'consumable', rarity: 'legendary', price: 100000, consumable: true, stats_effect: JSON.stringify({health: 20, strength: 10, intelligence: 10}), description: '모든 능력치 증가' },
            { name: '레드불', category: 'consumable', rarity: 'common', price: 2500, consumable: true, stats_effect: JSON.stringify({agility: 8}), description: '순간 민첩성 증가' },
            { name: '초콜릿', category: 'consumable', rarity: 'common', price: 1000, consumable: true, stats_effect: JSON.stringify({happiness: 5}), description: '달콤한 행복' },
            { name: '인삼차', category: 'consumable', rarity: 'rare', price: 7000, consumable: true, stats_effect: JSON.stringify({health: 12, intelligence: 8}), description: '전통 건강차' },
            { name: '홍삼진액', category: 'consumable', rarity: 'epic', price: 25000, consumable: true, stats_effect: JSON.stringify({health: 25}), description: '프리미엄 건강 보조제' },
            { name: '젊음의 물약', category: 'consumable', rarity: 'legendary', price: 200000, consumable: true, stats_effect: JSON.stringify({health: 30, charm: 20}), description: '젊음과 아름다움 회복' },
            { name: '지혜의 영약', category: 'consumable', rarity: 'epic', price: 80000, consumable: true, stats_effect: JSON.stringify({intelligence: 25}), description: '깊은 지혜 획득' },
            { name: '용기의 포션', category: 'consumable', rarity: 'rare', price: 18000, consumable: true, stats_effect: JSON.stringify({strength: 15, charm: 10}), description: '용기와 자신감' },
            { name: '평온의 차', category: 'consumable', rarity: 'common', price: 4000, consumable: true, stats_effect: JSON.stringify({happiness: 12}), description: '마음의 평화' },
            { name: '신의 축복', category: 'consumable', rarity: 'legendary', price: 500000, consumable: true, stats_effect: JSON.stringify({luck: 50}), description: '신이 내린 축복' },

            // 액세서리 (15개)
            { name: '럭셔리 시계', category: 'accessory', rarity: 'rare', price: 100000, stats_effect: JSON.stringify({charm: 10}), description: '매력 +10' },
            { name: '다이아몬드 반지', category: 'accessory', rarity: 'epic', price: 500000, stats_effect: JSON.stringify({charm: 25, luck: 15}), description: '최고급 다이아 반지' },
            { name: '금목걸이', category: 'accessory', rarity: 'rare', price: 200000, stats_effect: JSON.stringify({charm: 15}), description: '고급 금목걸이' },
            { name: '명품 가방', category: 'accessory', rarity: 'epic', price: 300000, stats_effect: JSON.stringify({charm: 20, happiness: 10}), description: '명품 브랜드 가방' },
            { name: '스마트워치', category: 'accessory', rarity: 'rare', price: 150000, stats_effect: JSON.stringify({intelligence: 12, agility: 8}), description: '최신 스마트워치' },
            { name: '행운의 목걸이', category: 'accessory', rarity: 'epic', price: 250000, stats_effect: JSON.stringify({luck: 30}), description: '행운을 부르는 목걸이' },
            { name: '지혜의 안경', category: 'accessory', rarity: 'rare', price: 80000, stats_effect: JSON.stringify({intelligence: 18}), description: '지적인 이미지' },
            { name: '스포츠 밴드', category: 'accessory', rarity: 'common', price: 30000, stats_effect: JSON.stringify({agility: 10, health: 5}), description: '운동용 밴드' },
            { name: '매력의 향수', category: 'accessory', rarity: 'rare', price: 120000, stats_effect: JSON.stringify({charm: 20}), description: '매혹적인 향기' },
            { name: '천사의 날개', category: 'accessory', rarity: 'legendary', price: 1000000, stats_effect: JSON.stringify({charm: 40, happiness: 30, luck: 25}), description: '천사의 축복' },
            { name: '근력 팔찌', category: 'accessory', rarity: 'rare', price: 90000, stats_effect: JSON.stringify({strength: 15}), description: '근력 증강 팔찌' },
            { name: '귀족의 반지', category: 'accessory', rarity: 'epic', price: 400000, stats_effect: JSON.stringify({charm: 22, intelligence: 15}), description: '고귀한 신분의 상징' },
            { name: '운동화', category: 'accessory', rarity: 'common', price: 50000, stats_effect: JSON.stringify({agility: 12}), description: '가벼운 운동화' },
            { name: '파워 글러브', category: 'accessory', rarity: 'epic', price: 350000, stats_effect: JSON.stringify({strength: 25}), description: '힘의 상징 장갑' },
            { name: '왕관', category: 'accessory', rarity: 'legendary', price: 2000000, stats_effect: JSON.stringify({charm: 50, intelligence: 30}), description: '왕의 권위' },

            // 도서/교육 (12개)
            { name: '투자 서적', category: 'book', rarity: 'common', price: 15000, stats_effect: JSON.stringify({intelligence: 5}), description: '지능 +5' },
            { name: '자기계발서', category: 'book', rarity: 'common', price: 20000, stats_effect: JSON.stringify({charm: 8, intelligence: 3}), description: '인생 개선 도서' },
            { name: '운동 가이드북', category: 'book', rarity: 'common', price: 18000, stats_effect: JSON.stringify({strength: 10}), description: '올바른 운동법' },
            { name: '요리책', category: 'book', rarity: 'common', price: 12000, stats_effect: JSON.stringify({charm: 6, happiness: 5}), description: '맛있는 요리 레시피' },
            { name: '철학서', category: 'book', rarity: 'rare', price: 30000, stats_effect: JSON.stringify({intelligence: 15, happiness: 8}), description: '깊은 사색의 시간' },
            { name: '경제학 원론', category: 'book', rarity: 'rare', price: 45000, stats_effect: JSON.stringify({intelligence: 20}), description: '경제 이해력 향상' },
            { name: '심리학 입문', category: 'book', rarity: 'rare', price: 35000, stats_effect: JSON.stringify({charm: 15, intelligence: 10}), description: '인간 심리 이해' },
            { name: '명언집', category: 'book', rarity: 'common', price: 8000, stats_effect: JSON.stringify({happiness: 10}), description: '마음을 다독이는 명언' },
            { name: '성공학', category: 'book', rarity: 'epic', price: 80000, stats_effect: JSON.stringify({luck: 20, intelligence: 15}), description: '성공하는 사람들의 비밀' },
            { name: '의학 전문서', category: 'book', rarity: 'epic', price: 100000, stats_effect: JSON.stringify({intelligence: 25}), description: '의학 지식 습득' },
            { name: '법학 개론', category: 'book', rarity: 'rare', price: 60000, stats_effect: JSON.stringify({intelligence: 18, charm: 8}), description: '법률 지식' },
            { name: '고전 문학', category: 'book', rarity: 'rare', price: 25000, stats_effect: JSON.stringify({charm: 12, intelligence: 8}), description: '교양과 품격' },

            // 서비스/이용권 (10개)
            { name: '헬스장 이용권', category: 'service', rarity: 'common', price: 50000, stats_effect: JSON.stringify({strength: 10}), description: '근력 +10' },
            { name: '스파 이용권', category: 'service', rarity: 'rare', price: 150000, stats_effect: JSON.stringify({happiness: 20, charm: 10}), description: '휴식과 힐링' },
            { name: '영화관 이용권', category: 'service', rarity: 'common', price: 20000, stats_effect: JSON.stringify({happiness: 15}), description: '즐거운 영화 관람' },
            { name: '미용실 이용권', category: 'service', rarity: 'rare', price: 80000, stats_effect: JSON.stringify({charm: 18}), description: '새로운 스타일링' },
            { name: '요가 클래스', category: 'service', rarity: 'common', price: 40000, stats_effect: JSON.stringify({agility: 8, happiness: 10}), description: '유연성과 평온함' },
            { name: '어학원 수강권', category: 'service', rarity: 'rare', price: 120000, stats_effect: JSON.stringify({intelligence: 20}), description: '외국어 실력 향상' },
            { name: '프리미엄 마사지', category: 'service', rarity: 'epic', price: 200000, stats_effect: JSON.stringify({health: 25, happiness: 20}), description: '최고급 마사지' },
            { name: '골프 레슨', category: 'service', rarity: 'epic', price: 300000, stats_effect: JSON.stringify({charm: 15, luck: 12}), description: '품격있는 스포츠' },
            { name: '댄스 레슨', category: 'service', rarity: 'rare', price: 70000, stats_effect: JSON.stringify({agility: 15, charm: 10}), description: '우아한 댄스' },
            { name: 'VIP 클럽 멤버십', category: 'service', rarity: 'legendary', price: 1000000, stats_effect: JSON.stringify({charm: 30, luck: 20, happiness: 25}), description: '최고급 서비스' },

            // 특수 아이템 (8개)
            { name: '타임머신 티켓', category: 'special', rarity: 'legendary', price: 5000000, description: '시간을 되돌리는 마법의 티켓' },
            { name: '행운의 동전', category: 'special', rarity: 'epic', price: 500000, stats_effect: JSON.stringify({luck: 25}), description: '영원한 행운' },
            { name: '지혜의 수정', category: 'special', rarity: 'legendary', price: 3000000, stats_effect: JSON.stringify({intelligence: 50}), description: '무한한 지혜' },
            { name: '생명의 물', category: 'special', rarity: 'legendary', price: 4000000, stats_effect: JSON.stringify({health: 50}), description: '불로불사의 비약' },
            { name: '마법의 거울', category: 'special', rarity: 'epic', price: 800000, stats_effect: JSON.stringify({charm: 30}), description: '절대적 아름다움' },
            { name: '힘의 원석', category: 'special', rarity: 'legendary', price: 2500000, stats_effect: JSON.stringify({strength: 40}), description: '무한한 힘' },
            { name: '바람의 깃털', category: 'special', rarity: 'epic', price: 600000, stats_effect: JSON.stringify({agility: 35}), description: '바람처럼 빠른 속도' },
            { name: '행복의 열쇠', category: 'special', rarity: 'legendary', price: 10000000, stats_effect: JSON.stringify({happiness: 100}), description: '완전한 행복' }
        ];

        // 업적 데이터는 AchievementSystem.js에서 관리

        // 기본 칭호 (대폭 확장)
        const titles = [
            // 기본 칭호
            { name: '신입사원', description: '인생의 첫 직장을 가진 자', rarity: 'common', stats_bonus: JSON.stringify({intelligence: 2}) },
            { name: '백만장자', description: '백만원을 모은 자', rarity: 'rare', stats_bonus: JSON.stringify({luck: 5}) },
            { name: '억만장자', description: '억원을 모은 자', rarity: 'epic', stats_bonus: JSON.stringify({luck: 10, charm: 5}) },
            { name: '잡크래프터', description: '여러 직업을 경험한 자', rarity: 'rare', stats_bonus: JSON.stringify({intelligence: 5, charm: 3}) },
            { name: '전문가', description: '전문직에 종사하는 자', rarity: 'epic', stats_bonus: JSON.stringify({intelligence: 8, charm: 8}) },
            { name: 'CEO', description: '기업의 최고경영자', rarity: 'legendary', stats_bonus: JSON.stringify({charm: 15, intelligence: 15, luck: 10}) },
            { name: '의료진', description: '생명을 구하는 의사', rarity: 'epic', stats_bonus: JSON.stringify({intelligence: 12, health: 10}) },
            { name: '법조인', description: '정의를 수호하는 변호사', rarity: 'epic', stats_bonus: JSON.stringify({intelligence: 15, charm: 8}) },
            { name: '연예인', description: '대중의 사랑을 받는 스타', rarity: 'rare', stats_bonus: JSON.stringify({charm: 12, happiness: 8}) },
            { name: '스포츠 스타', description: '운동장의 영웅', rarity: 'epic', stats_bonus: JSON.stringify({strength: 15, agility: 10}) },
            { name: '과학자', description: '진리를 탐구하는 연구자', rarity: 'rare', stats_bonus: JSON.stringify({intelligence: 10}) },
            { name: '창업가', description: '새로운 사업을 시작한 자', rarity: 'rare', stats_bonus: JSON.stringify({luck: 8, charm: 5}) },
            { name: '재벌', description: '엄청난 부를 소유한 자', rarity: 'legendary', stats_bonus: JSON.stringify({charm: 20, luck: 15}) },
            { name: '투자의 신', description: '투자로 큰 성공을 거둔 자', rarity: 'epic', stats_bonus: JSON.stringify({intelligence: 12, luck: 12}) },
            { name: '부동산 투자자', description: '부동산에 투자하는 자', rarity: 'rare', stats_bonus: JSON.stringify({intelligence: 8, luck: 5}) },
            { name: '부동산 재벌', description: '부동산으로 부를 이룬 자', rarity: 'epic', stats_bonus: JSON.stringify({intelligence: 10, luck: 10}) },
            { name: '사업 성공가', description: '사업으로 큰 성공을 거둔 자', rarity: 'epic', stats_bonus: JSON.stringify({charm: 12, intelligence: 8}) },
            { name: '사업 제국가', description: '여러 사업을 운영하는 자', rarity: 'legendary', stats_bonus: JSON.stringify({charm: 18, intelligence: 15}) },
            { name: '로또 당첨자', description: '로또에 당첨된 행운아', rarity: 'rare', stats_bonus: JSON.stringify({luck: 15}) },
            { name: '절약왕', description: '절약의 달인', rarity: 'epic', stats_bonus: JSON.stringify({intelligence: 10}) },
            { name: '소비왕', description: '소비의 황제', rarity: 'legendary', stats_bonus: JSON.stringify({charm: 25}) },
            { name: '투자 달인', description: '모든 투자의 마스터', rarity: 'legendary', stats_bonus: JSON.stringify({intelligence: 20, luck: 20}) },
            { name: '학사', description: '대학을 졸업한 자', rarity: 'rare', stats_bonus: JSON.stringify({intelligence: 8}) },
            { name: '석사', description: '대학원 석사과정을 수료한 자', rarity: 'epic', stats_bonus: JSON.stringify({intelligence: 15}) },
            { name: '박사', description: '최고의 학위를 취득한 자', rarity: 'legendary', stats_bonus: JSON.stringify({intelligence: 25}) },
            { name: '지식인', description: '높은 지능을 가진 자', rarity: 'epic', stats_bonus: JSON.stringify({intelligence: 12}) },
            { name: '운동선수', description: '뛰어난 신체능력을 가진 자', rarity: 'epic', stats_bonus: JSON.stringify({strength: 12, agility: 8}) },
            { name: '매력왕', description: '최고의 매력을 가진 자', rarity: 'epic', stats_bonus: JSON.stringify({charm: 15}) },
            { name: '행운아', description: '타고난 운을 가진 자', rarity: 'epic', stats_bonus: JSON.stringify({luck: 15}) },
            { name: '완벽주의자', description: '모든 면에서 완벽한 자', rarity: 'legendary', stats_bonus: JSON.stringify({strength: 10, intelligence: 10, charm: 10, luck: 10, agility: 10}) },
            { name: '평생학습자', description: '끊임없이 배우는 자', rarity: 'epic', stats_bonus: JSON.stringify({intelligence: 15, happiness: 10}) },
            { name: '연인', description: '사랑하는 사람이 있는 자', rarity: 'rare', stats_bonus: JSON.stringify({happiness: 10, charm: 5}) },
            { name: '신혼', description: '결혼한 행복한 자', rarity: 'epic', stats_bonus: JSON.stringify({happiness: 20, charm: 10}) },
            { name: '로맨티스트', description: '로맨틱한 사랑꾼', rarity: 'rare', stats_bonus: JSON.stringify({charm: 10, happiness: 8}) },
            { name: '펫 애호가', description: '동물을 사랑하는 자', rarity: 'common', stats_bonus: JSON.stringify({happiness: 5}) },
            { name: '펫 수집가', description: '많은 펫을 기르는 자', rarity: 'epic', stats_bonus: JSON.stringify({happiness: 15, charm: 8}) },
            { name: '던전 탐험가', description: '던전을 탐험하는 모험가', rarity: 'rare', stats_bonus: JSON.stringify({strength: 8, agility: 8}) },
            { name: '던전 마스터', description: '모든 던전을 정복한 자', rarity: 'legendary', stats_bonus: JSON.stringify({strength: 15, agility: 15, luck: 10}) },
            { name: '활동왕', description: '매우 활발한 자', rarity: 'rare', stats_bonus: JSON.stringify({happiness: 10, charm: 5}) },
            { name: '게임 마스터', description: '게임의 모든 것을 마스터한 자', rarity: 'legendary', stats_bonus: JSON.stringify({strength: 20, intelligence: 20, charm: 20, luck: 20, agility: 20}) },
            { name: '컬렉터', description: '많은 아이템을 수집한 자', rarity: 'epic', stats_bonus: JSON.stringify({luck: 12, happiness: 8}) },
            { name: '전설의 플레이어', description: '전설적인 레벨에 도달한 자', rarity: 'legendary', stats_bonus: JSON.stringify({strength: 25, intelligence: 25, charm: 25, luck: 25, agility: 25}) },
            { name: '오래된 친구', description: '오랫동안 게임을 즐기는 자', rarity: 'epic', stats_bonus: JSON.stringify({happiness: 15, charm: 10}) },
            { name: '신화의 존재', description: '신화가 된 플레이어', rarity: 'mythic', stats_bonus: JSON.stringify({strength: 50, intelligence: 50, charm: 50, luck: 50, agility: 50, health: 50, happiness: 50}) }
        ];

        try {
            // jobs는 WorkSystem에서 관리하므로 제외
            await this.insertMultiple('stocks', stocks);
            // pet_types는 별도 시스템에서 관리하므로 제외
            // items는 별도 시스템에서 관리하므로 제외
            await this.insertMultiple('achievements', achievements);
            await this.insertMultiple('titles', titles);
            console.log('초기 데이터가 삽입되었습니다.');
        } catch (error) {
            console.error('초기 데이터 삽입 오류:', error);
        }
    }

    async insertMultiple(table, data) {
        if (data.length === 0) return;
        
        const columns = Object.keys(data[0]);
        
        // PostgreSQL인지 SQLite인지 확인
        if (this.client && typeof this.client.query === 'function') {
            // PostgreSQL
            const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
            const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
            
            for (const row of data) {
                const values = columns.map(col => row[col]);
                try {
                    await this.client.query(sql, values);
                } catch (error) {
                    console.error(`${table} 삽입 오류:`, error);
                }
            }
        } else {
            // SQLite
        const placeholders = columns.map(() => '?').join(', ');
        const sql = `INSERT OR IGNORE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
        
        return new Promise((resolve, reject) => {
                const stmt = this.client.prepare(sql);
            data.forEach(row => {
                const values = columns.map(col => row[col]);
                stmt.run(values);
            });
            stmt.finalize((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        }
    }

    async get(sql, params = []) {
        // PostgreSQL인지 SQLite인지 확인
        if (this.client && typeof this.client.query === 'function') {
            // PostgreSQL
            try {
                const result = await this.client.query(sql, params);
                return result.rows[0] || null;
            } catch (error) {
                throw error;
            }
        } else {
            // SQLite
        return new Promise((resolve, reject) => {
                this.client.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        }
    }

    async all(sql, params = []) {
        // PostgreSQL인지 SQLite인지 확인
        if (this.client && typeof this.client.query === 'function') {
            // PostgreSQL
            try {
                const result = await this.client.query(sql, params);
                return result.rows;
            } catch (error) {
                throw error;
            }
        } else {
            // SQLite
        return new Promise((resolve, reject) => {
                this.client.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        }
    }

    async run(sql, params = []) {
        // PostgreSQL인지 SQLite인지 확인
        if (this.client && typeof this.client.query === 'function') {
            // PostgreSQL
            try {
                const result = await this.client.query(sql, params);
                return { id: null, changes: result.rowCount };
            } catch (error) {
                throw error;
            }
        } else {
            // SQLite
        return new Promise((resolve, reject) => {
                this.client.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
        }
    }

    close() {
        if (this.client) {
            if (typeof this.client.end === 'function') {
                // PostgreSQL
                this.client.end().then(() => {
                    console.log('PostgreSQL 연결이 종료되었습니다.');
                }).catch((err) => {
                    console.error('PostgreSQL 연결 종료 오류:', err);
                });
            } else {
                // SQLite
                this.client.close((err) => {
                if (err) {
                        console.error('SQLite 연결 종료 오류:', err);
                } else {
                        console.log('SQLite 연결이 종료되었습니다.');
                }
            });
            }
        }
    }
}

module.exports = Database;
