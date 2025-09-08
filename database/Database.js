const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
    constructor(filename = 'game.db') {
        this.dbPath = path.join(__dirname, filename);
        this.db = null;
        this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('데이터베이스 연결 오류:', err);
                    reject(err);
                } else {
                    console.log('SQLite 데이터베이스에 연결되었습니다.');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    async createTables() {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        return new Promise((resolve, reject) => {
            this.db.exec(schema, (err) => {
                if (err) {
                    console.error('테이블 생성 오류:', err);
                    reject(err);
                } else {
                    console.log('데이터베이스 테이블이 생성되었습니다.');
                    this.seedInitialData().then(resolve).catch(reject);
                }
            });
        });
    }

    async seedInitialData() {
        // 기본 직업 데이터 삽입 (대폭 확장)
        const jobs = [
            // 서비스업 (10개)
            { name: '알바생', category: '서비스', base_salary: 100000, required_education: 0, description: '기본적인 서비스 업무' },
            { name: '카페 직원', category: '서비스', base_salary: 120000, required_education: 0, description: '커피와 디저트 판매' },
            { name: '편의점 직원', category: '서비스', base_salary: 110000, required_education: 0, description: '24시간 편의점 운영' },
            { name: '웨이터', category: '서비스', base_salary: 130000, required_education: 0, description: '레스토랑 서빙' },
            { name: '호텔 직원', category: '서비스', base_salary: 150000, required_education: 1, description: '호텔 고객 서비스' },
            { name: '미용사', category: '서비스', base_salary: 180000, required_education: 1, description: '헤어 디자인 및 컷' },
            { name: '마사지사', category: '서비스', base_salary: 160000, required_education: 1, description: '전문 마사지 서비스' },
            { name: '펜션 관리인', category: '서비스', base_salary: 140000, required_education: 0, description: '펜션 운영 및 관리' },
            { name: '청소 전문가', category: '서비스', base_salary: 120000, required_education: 0, description: '전문 청소 서비스' },
            { name: '택배 기사', category: '서비스', base_salary: 170000, required_education: 0, description: '물품 배송 서비스' },

            // IT/기술직 (15개)
            { name: '개발자', category: 'IT', base_salary: 400000, required_education: 4, description: '소프트웨어 개발' },
            { name: '프론트엔드 개발자', category: 'IT', base_salary: 380000, required_education: 4, description: '웹 UI/UX 개발' },
            { name: '백엔드 개발자', category: 'IT', base_salary: 420000, required_education: 4, description: '서버 및 데이터베이스' },
            { name: '모바일 개발자', category: 'IT', base_salary: 450000, required_education: 4, description: '앱 개발 전문가' },
            { name: '게임 개발자', category: 'IT', base_salary: 480000, required_education: 5, description: '게임 프로그래밍' },
            { name: 'AI 개발자', category: 'IT', base_salary: 600000, required_education: 6, description: '인공지능 연구개발' },
            { name: '데이터 사이언티스트', category: 'IT', base_salary: 550000, required_education: 6, description: '빅데이터 분석' },
            { name: '시스템 관리자', category: 'IT', base_salary: 350000, required_education: 3, description: '서버 및 네트워크 관리' },
            { name: '보안 전문가', category: 'IT', base_salary: 500000, required_education: 5, description: '사이버 보안' },
            { name: 'UI/UX 디자이너', category: 'IT', base_salary: 320000, required_education: 3, description: '사용자 인터페이스 디자인' },
            { name: '웹 퍼블리셔', category: 'IT', base_salary: 280000, required_education: 2, description: '웹페이지 제작' },
            { name: 'QA 엔지니어', category: 'IT', base_salary: 300000, required_education: 3, description: '소프트웨어 품질관리' },
            { name: '클라우드 엔지니어', category: 'IT', base_salary: 520000, required_education: 5, description: '클라우드 인프라 구축' },
            { name: '블록체인 개발자', category: 'IT', base_salary: 700000, required_education: 6, description: '블록체인 기술 개발' },
            { name: 'DevOps 엔지니어', category: 'IT', base_salary: 480000, required_education: 5, description: '개발 운영 자동화' },

            // 전문직 (12개)
            { name: '의사', category: '전문직', base_salary: 800000, required_education: 8, description: '의료 서비스 제공' },
            { name: '치과의사', category: '전문직', base_salary: 750000, required_education: 8, description: '치과 진료' },
            { name: '한의사', category: '전문직', base_salary: 600000, required_education: 8, description: '한방 진료' },
            { name: '수의사', category: '전문직', base_salary: 500000, required_education: 8, description: '동물 진료' },
            { name: '변호사', category: '전문직', base_salary: 900000, required_education: 8, description: '법률 서비스' },
            { name: '회계사', category: '전문직', base_salary: 450000, required_education: 6, description: '회계 및 세무' },
            { name: '건축사', category: '전문직', base_salary: 520000, required_education: 6, description: '건축 설계' },
            { name: '약사', category: '전문직', base_salary: 400000, required_education: 6, description: '의약품 조제' },
            { name: '간호사', category: '전문직', base_salary: 300000, required_education: 4, description: '환자 간호' },
            { name: '물리치료사', category: '전문직', base_salary: 280000, required_education: 4, description: '재활 치료' },
            { name: '심리상담사', category: '전문직', base_salary: 250000, required_education: 5, description: '심리 상담' },
            { name: '영양사', category: '전문직', base_salary: 220000, required_education: 4, description: '영양 관리' },

            // 경영/금융 (8개)
            { name: 'CEO', category: '경영', base_salary: 2000000, required_education: 6, description: '기업 경영' },
            { name: '임원', category: '경영', base_salary: 1200000, required_education: 6, description: '기업 고위직' },
            { name: '부장', category: '경영', base_salary: 800000, required_education: 5, description: '부서 관리' },
            { name: '과장', category: '경영', base_salary: 500000, required_education: 4, description: '팀 리더' },
            { name: '펀드매니저', category: '금융', base_salary: 800000, required_education: 6, description: '투자 전문가' },
            { name: '은행원', category: '금융', base_salary: 350000, required_education: 4, description: '금융 서비스' },
            { name: '보험설계사', category: '금융', base_salary: 280000, required_education: 2, description: '보험 상품 판매' },
            { name: '증권분석가', category: '금융', base_salary: 600000, required_education: 6, description: '주식 분석' },

            // 교육/연구 (6개)
            { name: '대학교수', category: '교육', base_salary: 700000, required_education: 10, description: '대학 강의 및 연구' },
            { name: '고등학교 교사', category: '교육', base_salary: 350000, required_education: 6, description: '고등학교 교육' },
            { name: '중학교 교사', category: '교육', base_salary: 320000, required_education: 6, description: '중학교 교육' },
            { name: '초등학교 교사', category: '교육', base_salary: 300000, required_education: 6, description: '초등 교육' },
            { name: '연구원', category: '연구', base_salary: 500000, required_education: 8, description: '과학 연구' },
            { name: '학원 강사', category: '교육', base_salary: 200000, required_education: 4, description: '사교육 강의' },

            // 예술/문화 (7개)
            { name: '화가', category: '예술', base_salary: 150000, required_education: 2, description: '그림 창작' },
            { name: '음악가', category: '예술', base_salary: 180000, required_education: 3, description: '음악 연주 및 작곡' },
            { name: '배우', category: '예술', base_salary: 300000, required_education: 1, description: '연기 및 출연' },
            { name: '가수', category: '예술', base_salary: 400000, required_education: 1, description: '가창 및 공연' },
            { name: '작가', category: '예술', base_salary: 120000, required_education: 3, description: '소설 및 글 창작' },
            { name: '사진작가', category: '예술', base_salary: 160000, required_education: 2, description: '사진 촬영' },
            { name: '영상 감독', category: '예술', base_salary: 350000, required_education: 4, description: '영상 제작 및 연출' },

            // 기타 전문직 (5개)
            { name: '사무직', category: '일반', base_salary: 250000, required_education: 3, description: '일반적인 사무 업무' },
            { name: '영업사원', category: '일반', base_salary: 280000, required_education: 2, description: '제품 및 서비스 판매' },
            { name: '마케터', category: '일반', base_salary: 320000, required_education: 4, description: '마케팅 전략 수립' },
            { name: '인사담당자', category: '일반', base_salary: 300000, required_education: 4, description: '인사 관리' },
            { name: '통역사', category: '일반', base_salary: 400000, required_education: 5, description: '언어 통역 서비스' },

            // 신규 스포츠/운동 (8개)
            { name: '축구선수', category: '스포츠', base_salary: 800000, required_education: 0, description: '프로 축구 선수' },
            { name: '야구선수', category: '스포츠', base_salary: 750000, required_education: 0, description: '프로 야구 선수' },
            { name: '농구선수', category: '스포츠', base_salary: 900000, required_education: 0, description: '프로 농구 선수' },
            { name: '테니스선수', category: '스포츠', base_salary: 600000, required_education: 0, description: '프로 테니스 선수' },
            { name: '골프선수', category: '스포츠', base_salary: 1200000, required_education: 0, description: '프로 골퍼' },
            { name: '스포츠 트레이너', category: '스포츠', base_salary: 300000, required_education: 3, description: '운동 지도 및 관리' },
            { name: '체육 교사', category: '스포츠', base_salary: 320000, required_education: 6, description: '체육 교육' },
            { name: 'e스포츠선수', category: '스포츠', base_salary: 500000, required_education: 0, description: '프로 게이머' },

            // 미디어/방송 (10개)
            { name: 'TV 아나운서', category: '미디어', base_salary: 600000, required_education: 6, description: '방송 진행' },
            { name: '라디오 DJ', category: '미디어', base_salary: 350000, required_education: 4, description: '라디오 프로그램 진행' },
            { name: '기자', category: '미디어', base_salary: 400000, required_education: 6, description: '뉴스 취재 및 기사 작성' },
            { name: '편집자', category: '미디어', base_salary: 280000, required_education: 4, description: '콘텐츠 편집' },
            { name: '방송 PD', category: '미디어', base_salary: 500000, required_education: 6, description: '방송 프로그램 제작' },
            { name: '방송 작가', category: '미디어', base_salary: 350000, required_education: 4, description: '방송 대본 작성' },
            { name: '유튜버', category: '미디어', base_salary: 200000, required_education: 0, description: '온라인 콘텐츠 크리에이터' },
            { name: '인플루언서', category: '미디어', base_salary: 300000, required_education: 0, description: 'SNS 콘텐츠 제작' },
            { name: '영상 편집자', category: '미디어', base_salary: 280000, required_education: 3, description: '영상 후반 작업' },
            { name: '팟캐스터', category: '미디어', base_salary: 180000, required_education: 1, description: '팟캐스트 진행' },

            // 요리/음식 (8개)
            { name: '요리사', category: '요리', base_salary: 250000, required_education: 1, description: '음식 조리' },
            { name: '셰프', category: '요리', base_salary: 500000, required_education: 3, description: '고급 요리 전문가' },
            { name: '파티시에', category: '요리', base_salary: 300000, required_education: 2, description: '제과제빵 전문가' },
            { name: '바리스타', category: '요리', base_salary: 180000, required_education: 1, description: '커피 전문가' },
            { name: '소믈리에', category: '요리', base_salary: 400000, required_education: 3, description: '와인 전문가' },
            { name: '푸드 스타일리스트', category: '요리', base_salary: 350000, required_education: 3, description: '음식 연출 전문가' },
            { name: '영양사', category: '요리', base_salary: 220000, required_education: 4, description: '영양 관리 전문가' },
            { name: '음식 평론가', category: '요리', base_salary: 300000, required_education: 4, description: '맛집 리뷰 전문가' },

            // 농업/어업 (6개)
            { name: '농부', category: '1차산업', base_salary: 180000, required_education: 0, description: '농작물 재배' },
            { name: '어부', category: '1차산업', base_salary: 200000, required_education: 0, description: '수산물 채취' },
            { name: '목장주', category: '1차산업', base_salary: 300000, required_education: 1, description: '축산업 경영' },
            { name: '조경사', category: '1차산업', base_salary: 220000, required_education: 2, description: '정원 및 조경 설계' },
            { name: '산림관리원', category: '1차산업', base_salary: 250000, required_education: 3, description: '산림 보호 및 관리' },
            { name: '농업기술자', category: '1차산업', base_salary: 280000, required_education: 4, description: '농업 기술 개발' },

            // 패션/뷰티 (8개)
            { name: '패션 디자이너', category: '패션', base_salary: 350000, required_education: 4, description: '의류 디자인' },
            { name: '모델', category: '패션', base_salary: 400000, required_education: 0, description: '패션 모델링' },
            { name: '스타일리스트', category: '패션', base_salary: 300000, required_education: 2, description: '패션 코디네이션' },
            { name: '메이크업 아티스트', category: '뷰티', base_salary: 250000, required_education: 1, description: '메이크업 전문가' },
            { name: '네일 아티스트', category: '뷰티', base_salary: 200000, required_education: 1, description: '네일아트 전문가' },
            { name: '헤어 디자이너', category: '뷰티', base_salary: 280000, required_education: 1, description: '헤어스타일링 전문가' },
            { name: '피부관리사', category: '뷰티', base_salary: 220000, required_education: 1, description: '피부 관리 전문가' },
            { name: '뷰티 유튜버', category: '뷰티', base_salary: 300000, required_education: 0, description: '뷰티 콘텐츠 크리에이터' },

            // 부동산/건설 (8개)
            { name: '부동산 중개사', category: '부동산', base_salary: 400000, required_education: 3, description: '부동산 거래 중개' },
            { name: '건축 기사', category: '건설', base_salary: 350000, required_education: 4, description: '건축 설계 및 시공' },
            { name: '토목 기사', category: '건설', base_salary: 380000, required_education: 4, description: '토목 공사 설계' },
            { name: '인테리어 디자이너', category: '건설', base_salary: 300000, required_education: 3, description: '실내 공간 설계' },
            { name: '시공 관리자', category: '건설', base_salary: 450000, required_education: 4, description: '건설 현장 관리' },
            { name: '전기 기사', category: '건설', base_salary: 320000, required_education: 3, description: '전기 설비 설치' },
            { name: '배관 기사', category: '건설', base_salary: 290000, required_education: 2, description: '배관 설비 설치' },
            { name: '건설 현장 감독', category: '건설', base_salary: 500000, required_education: 5, description: '건설 공사 총괄 관리' },

            // 운송/물류 (6개)
            { name: '파일럿', category: '운송', base_salary: 1500000, required_education: 8, description: '항공기 조종' },
            { name: '기차 기관사', category: '운송', base_salary: 400000, required_education: 4, description: '열차 운행' },
            { name: '버스 기사', category: '운송', base_salary: 280000, required_education: 1, description: '버스 운전' },
            { name: '택시 기사', category: '운송', base_salary: 200000, required_education: 0, description: '택시 운전' },
            { name: '물류 관리사', category: '물류', base_salary: 350000, required_education: 4, description: '물류 체계 관리' },
            { name: '창고 관리원', category: '물류', base_salary: 220000, required_education: 2, description: '창고 운영 관리' },

            // 과학/연구 (10개)
            { name: '물리학자', category: '과학', base_salary: 600000, required_education: 10, description: '물리학 연구' },
            { name: '화학자', category: '과학', base_salary: 580000, required_education: 10, description: '화학 연구' },
            { name: '생물학자', category: '과학', base_salary: 550000, required_education: 10, description: '생물학 연구' },
            { name: '환경 과학자', category: '과학', base_salary: 480000, required_education: 8, description: '환경 연구' },
            { name: '기상학자', category: '과학', base_salary: 450000, required_education: 8, description: '기상 예보 및 연구' },
            { name: '지질학자', category: '과학', base_salary: 520000, required_education: 8, description: '지질 구조 연구' },
            { name: '천문학자', category: '과학', base_salary: 650000, required_education: 10, description: '천체 연구' },
            { name: '고고학자', category: '과학', base_salary: 350000, required_education: 8, description: '유적 발굴 및 연구' },
            { name: '인류학자', category: '과학', base_salary: 400000, required_education: 8, description: '인류 문화 연구' },
            { name: '실험실 연구원', category: '과학', base_salary: 380000, required_education: 6, description: '실험 및 분석' }
        ];

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

        // 기본 업적 (대폭 확장)
        const achievements = [
            // 경력/직업 업적 (12개)
            { name: '첫 걸음', category: 'career', description: '첫 직장에 취직하기', condition_type: 'job_count', condition_value: '1', reward_type: 'money', reward_value: '10000', rarity: 'common' },
            { name: '커리어 점프', category: 'career', description: '5개의 다른 직업 경험하기', condition_type: 'job_count', condition_value: '5', reward_type: 'title', reward_value: '4', rarity: 'rare' },
            { name: '회사 충성도', category: 'career', description: '한 직장에서 1년 근무하기', condition_type: 'job_duration', condition_value: '365', reward_type: 'money', reward_value: '100000', rarity: 'rare' },
            { name: '전문가', category: 'career', description: '전문직 취업하기', condition_type: 'job_category', condition_value: 'professional', reward_type: 'title', reward_value: '5', rarity: 'epic' },
            { name: 'CEO의 길', category: 'career', description: 'CEO 직책 달성하기', condition_type: 'job_name', condition_value: 'CEO', reward_type: 'title', reward_value: '6', rarity: 'legendary' },
            { name: '의료진', category: 'career', description: '의사 직업 취업하기', condition_type: 'job_name', condition_value: '의사', reward_type: 'title', reward_value: '7', rarity: 'epic' },
            { name: '법조인', category: 'career', description: '변호사 직업 취업하기', condition_type: 'job_name', condition_value: '변호사', reward_type: 'title', reward_value: '8', rarity: 'epic' },
            { name: '연예인', category: 'career', description: '가수 또는 배우 직업 취업하기', condition_type: 'job_category', condition_value: 'entertainment', reward_type: 'title', reward_value: '9', rarity: 'rare' },
            { name: '스포츠 스타', category: 'career', description: '프로 스포츠 선수 취업하기', condition_type: 'job_category', condition_value: 'sports', reward_type: 'title', reward_value: '10', rarity: 'epic' },
            { name: '과학자', category: 'career', description: '연구직 취업하기', condition_type: 'job_category', condition_value: 'science', reward_type: 'title', reward_value: '11', rarity: 'rare' },
            { name: '창업가', category: 'career', description: '사업 시작하기', condition_type: 'business_count', condition_value: '1', reward_type: 'title', reward_value: '12', rarity: 'rare' },
            { name: '월급루팡', category: 'career', description: '월급 10번 받기', condition_type: 'salary_count', condition_value: '10', reward_type: 'money', reward_value: '50000', rarity: 'common' },

            // 재산/투자 업적 (15개)
            { name: '백만장자', category: 'wealth', description: '100만원 모으기', condition_type: 'money', condition_value: '1000000', reward_type: 'title', reward_value: '1', rarity: 'common' },
            { name: '천만장자', category: 'wealth', description: '1천만원 모으기', condition_type: 'money', condition_value: '10000000', reward_type: 'title', reward_value: '2', rarity: 'rare' },
            { name: '억만장자', category: 'wealth', description: '1억원 모으기', condition_type: 'money', condition_value: '100000000', reward_type: 'title', reward_value: '3', rarity: 'epic' },
            { name: '재벌', category: 'wealth', description: '10억원 모으기', condition_type: 'money', condition_value: '1000000000', reward_type: 'title', reward_value: '13', rarity: 'legendary' },
            { name: '투자의 신', category: 'investment', description: '주식으로 100% 수익 달성', condition_type: 'stock_profit', condition_value: '100', reward_type: 'title', reward_value: '14', rarity: 'epic' },
            { name: '주식 왕', category: 'investment', description: '주식 10번 거래하기', condition_type: 'stock_trades', condition_value: '10', reward_type: 'money', reward_value: '100000', rarity: 'common' },
            { name: '부동산 투자자', category: 'investment', description: '부동산 구매하기', condition_type: 'property_count', condition_value: '1', reward_type: 'title', reward_value: '15', rarity: 'rare' },
            { name: '부동산 재벌', category: 'investment', description: '부동산 5개 보유하기', condition_type: 'property_count', condition_value: '5', reward_type: 'title', reward_value: '16', rarity: 'epic' },
            { name: '사업 성공', category: 'business', description: '사업 월 수익 1천만원 달성', condition_type: 'business_profit', condition_value: '10000000', reward_type: 'title', reward_value: '17', rarity: 'epic' },
            { name: '사업 제국', category: 'business', description: '사업 3개 운영하기', condition_type: 'business_count', condition_value: '3', reward_type: 'title', reward_value: '18', rarity: 'legendary' },
            { name: '로또 당첨자', category: 'luck', description: '로또 당첨하기', condition_type: 'lottery_win', condition_value: '1', reward_type: 'title', reward_value: '19', rarity: 'rare' },
            { name: '도박 고수', category: 'luck', description: '미니게임에서 10번 승리', condition_type: 'minigame_wins', condition_value: '10', reward_type: 'money', reward_value: '200000', rarity: 'rare' },
            { name: '절약왕', category: 'wealth', description: '한 달간 지출 없이 지내기', condition_type: 'no_spending', condition_value: '30', reward_type: 'title', reward_value: '20', rarity: 'epic' },
            { name: '소비왕', category: 'wealth', description: '하루에 1억원 소비하기', condition_type: 'daily_spending', condition_value: '100000000', reward_type: 'title', reward_value: '21', rarity: 'legendary' },
            { name: '투자 달인', category: 'investment', description: '모든 투자처에 투자하기', condition_type: 'investment_variety', condition_value: '10', reward_type: 'title', reward_value: '22', rarity: 'legendary' },

            // 교육/성장 업적 (10개)
            { name: '학생', category: 'education', description: '첫 교육과정 수료하기', condition_type: 'education_count', condition_value: '1', reward_type: 'money', reward_value: '20000', rarity: 'common' },
            { name: '학사', category: 'education', description: '대학교육 수료하기', condition_type: 'education_level', condition_value: '10', reward_type: 'title', reward_value: '23', rarity: 'rare' },
            { name: '석사', category: 'education', description: '대학원 석사 수료하기', condition_type: 'education_level', condition_value: '13', reward_type: 'title', reward_value: '24', rarity: 'epic' },
            { name: '박사', category: 'education', description: '박사과정 수료하기', condition_type: 'education_level', condition_value: '18', reward_type: 'title', reward_value: '25', rarity: 'legendary' },
            { name: '지식인', category: 'education', description: '지능 90 달성하기', condition_type: 'stat', condition_value: 'intelligence:90', reward_type: 'title', reward_value: '26', rarity: 'epic' },
            { name: '운동선수', category: 'fitness', description: '근력 90 달성하기', condition_type: 'stat', condition_value: 'strength:90', reward_type: 'title', reward_value: '27', rarity: 'epic' },
            { name: '매력왕', category: 'social', description: '매력 90 달성하기', condition_type: 'stat', condition_value: 'charm:90', reward_type: 'title', reward_value: '28', rarity: 'epic' },
            { name: '행운아', category: 'luck', description: '행운 90 달성하기', condition_type: 'stat', condition_value: 'luck:90', reward_type: 'title', reward_value: '29', rarity: 'epic' },
            { name: '완벽주의자', category: 'achievement', description: '모든 스탯 80 이상 달성', condition_type: 'all_stats', condition_value: '80', reward_type: 'title', reward_value: '30', rarity: 'legendary' },
            { name: '평생학습자', category: 'education', description: '10개 교육과정 수료하기', condition_type: 'education_count', condition_value: '10', reward_type: 'title', reward_value: '31', rarity: 'epic' },

            // 사회/관계 업적 (8개)
            { name: '연인', category: 'romance', description: '연인 만들기', condition_type: 'relationship', condition_value: 'dating', reward_type: 'title', reward_value: '32', rarity: 'rare' },
            { name: '신혼', category: 'romance', description: '결혼하기', condition_type: 'relationship', condition_value: 'married', reward_type: 'title', reward_value: '33', rarity: 'epic' },
            { name: '로맨티스트', category: 'romance', description: '선물 10번 주기', condition_type: 'gift_count', condition_value: '10', reward_type: 'title', reward_value: '34', rarity: 'rare' },
            { name: '펫 애호가', category: 'pets', description: '펫 구매하기', condition_type: 'pet_count', condition_value: '1', reward_type: 'title', reward_value: '35', rarity: 'common' },
            { name: '펫 수집가', category: 'pets', description: '펫 5마리 보유하기', condition_type: 'pet_count', condition_value: '5', reward_type: 'title', reward_value: '36', rarity: 'epic' },
            { name: '던전 탐험가', category: 'adventure', description: '던전 10번 클리어하기', condition_type: 'dungeon_clears', condition_value: '10', reward_type: 'title', reward_value: '37', rarity: 'rare' },
            { name: '던전 마스터', category: 'adventure', description: '모든 던전 클리어하기', condition_type: 'all_dungeons', condition_value: '1', reward_type: 'title', reward_value: '38', rarity: 'legendary' },
            { name: '활동왕', category: 'activity', description: '채팅 1000번 하기', condition_type: 'chat_count', condition_value: '1000', reward_type: 'title', reward_value: '39', rarity: 'rare' },

            // 특별 업적 (5개)
            { name: '게임 마스터', category: 'special', description: '모든 시스템 경험하기', condition_type: 'system_complete', condition_value: '1', reward_type: 'title', reward_value: '40', rarity: 'legendary' },
            { name: '컬렉터', category: 'collection', description: '아이템 50개 보유하기', condition_type: 'item_count', condition_value: '50', reward_type: 'title', reward_value: '41', rarity: 'epic' },
            { name: '전설의 플레이어', category: 'special', description: '레벨 50 달성하기', condition_type: 'level', condition_value: '50', reward_type: 'title', reward_value: '42', rarity: 'legendary' },
            { name: '오래된 친구', category: 'special', description: '게임 시작 후 1년 경과', condition_type: 'play_time', condition_value: '365', reward_type: 'title', reward_value: '43', rarity: 'epic' },
            { name: '신화의 존재', category: 'special', description: '모든 레전더리 업적 달성', condition_type: 'legendary_count', condition_value: '10', reward_type: 'title', reward_value: '44', rarity: 'mythic' }
        ];

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
            await this.insertMultiple('jobs', jobs);
            await this.insertMultiple('stocks', stocks);
            await this.insertMultiple('pet_types', petTypes);
            await this.insertMultiple('items', items);
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
        const placeholders = columns.map(() => '?').join(', ');
        const sql = `INSERT OR IGNORE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
        
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(sql);
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

    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    async all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('데이터베이스 연결 종료 오류:', err);
                } else {
                    console.log('데이터베이스 연결이 종료되었습니다.');
                }
            });
        }
    }
}

module.exports = Database;
