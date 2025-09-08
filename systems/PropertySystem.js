const { EmbedBuilder } = require('discord.js');

class PropertySystem {
    constructor(database) {
        this.db = database;
        this.propertyTypes = [
            // 주거용 부동산
            {
                name: '원룸',
                type: 'residential',
                base_price: 50000000,
                monthly_income: 300000,
                location: '서울 외곽',
                size_sqm: 20,
                description: '작지만 알찬 원룸'
            },
            {
                name: '투룸 아파트',
                type: 'residential',
                base_price: 150000000,
                monthly_income: 800000,
                location: '서울 강남',
                size_sqm: 50,
                description: '신혼부부에게 인기있는 투룸'
            },
            {
                name: '빌라',
                type: 'residential',
                base_price: 300000000,
                monthly_income: 1500000,
                location: '경기도',
                size_sqm: 80,
                description: '정원이 있는 조용한 빌라'
            },
            {
                name: '아파트',
                type: 'residential',
                base_price: 800000000,
                monthly_income: 3000000,
                location: '서울 강남',
                size_sqm: 100,
                description: '고급 아파트단지'
            },
            {
                name: '단독주택',
                type: 'residential',
                base_price: 1500000000,
                monthly_income: 4000000,
                location: '서울 강북',
                size_sqm: 200,
                description: '넓은 마당이 있는 단독주택'
            },
            
            // 상업용 부동산
            {
                name: '작은 상가',
                type: 'commercial',
                base_price: 200000000,
                monthly_income: 2000000,
                location: '홍대입구',
                size_sqm: 30,
                description: '유동인구가 많은 상가'
            },
            {
                name: '카페 건물',
                type: 'commercial',
                base_price: 500000000,
                monthly_income: 4500000,
                location: '강남역',
                size_sqm: 60,
                description: '카페 운영에 최적화된 건물'
            },
            {
                name: '오피스텔',
                type: 'commercial',
                base_price: 400000000,
                monthly_income: 3500000,
                location: '여의도',
                size_sqm: 40,
                description: '소규모 사무실로 인기'
            },
            {
                name: '상업빌딩',
                type: 'commercial',
                base_price: 2000000000,
                monthly_income: 15000000,
                location: '명동',
                size_sqm: 500,
                description: '대형 상업빌딩'
            },
            
            // 특수 부동산
            {
                name: '펜트하우스',
                type: 'luxury',
                base_price: 5000000000,
                monthly_income: 10000000,
                location: '한강뷰',
                size_sqm: 300,
                description: '최고급 펜트하우스'
            },
            {
                name: '리조트',
                type: 'luxury',
                base_price: 10000000000,
                monthly_income: 25000000,
                location: '제주도',
                size_sqm: 1000,
                description: '휴양지 리조트'
            },

            // 신규 주거용 부동산 (12개)
            {
                name: '고시원',
                type: 'residential',
                base_price: 20000000,
                monthly_income: 150000,
                location: '신림동',
                size_sqm: 8,
                description: '학생들을 위한 작은 공간'
            },
            {
                name: '쉐어하우스',
                type: 'residential',
                base_price: 80000000,
                monthly_income: 400000,
                location: '홍대',
                size_sqm: 25,
                description: '젊은층에게 인기인 공유 주택'
            },
            {
                name: '스튜디오',
                type: 'residential',
                base_price: 120000000,
                monthly_income: 600000,
                location: '성수동',
                size_sqm: 35,
                description: '작업 공간과 주거 공간이 함께'
            },
            {
                name: '복층 아파트',
                type: 'residential',
                base_price: 1200000000,
                monthly_income: 3500000,
                location: '분당',
                size_sqm: 120,
                description: '2층 구조의 넓은 아파트'
            },
            {
                name: '테라스 하우스',
                type: 'residential',
                base_price: 2000000000,
                monthly_income: 5000000,
                location: '성북동',
                size_sqm: 150,
                description: '넓은 테라스가 있는 주택'
            },
            {
                name: '한옥',
                type: 'residential',
                base_price: 3000000000,
                monthly_income: 6000000,
                location: '북촌',
                size_sqm: 180,
                description: '전통 한옥의 멋'
            },
            {
                name: '디자이너 빌라',
                type: 'residential',
                base_price: 800000000,
                monthly_income: 2500000,
                location: '청담동',
                size_sqm: 90,
                description: '디자이너가 설계한 고급 빌라'
            },
            {
                name: '타운하우스',
                type: 'residential',
                base_price: 1800000000,
                monthly_income: 4500000,
                location: '판교',
                size_sqm: 140,
                description: '단독주택의 장점을 살린 연립주택'
            },
            {
                name: '로프트',
                type: 'residential',
                base_price: 600000000,
                monthly_income: 2000000,
                location: '이태원',
                size_sqm: 80,
                description: '높은 천장의 개방적인 공간'
            },
            {
                name: '컨테이너 하우스',
                type: 'residential',
                base_price: 100000000,
                monthly_income: 500000,
                location: '경기 외곽',
                size_sqm: 40,
                description: '친환경 컨테이너 주택'
            },
            {
                name: '풀 빌라',
                type: 'residential',
                base_price: 4000000000,
                monthly_income: 8000000,
                location: '제주도',
                size_sqm: 200,
                description: '수영장이 있는 럭셔리 빌라'
            },
            {
                name: '통나무집',
                type: 'residential',
                base_price: 1500000000,
                monthly_income: 3000000,
                location: '강원도',
                size_sqm: 100,
                description: '자연 속의 통나무 주택'
            },

            // 신규 상업용 부동산 (15개)
            {
                name: '프랜차이즈 매장',
                type: 'commercial',
                base_price: 300000000,
                monthly_income: 2500000,
                location: '구로디지털단지',
                size_sqm: 45,
                description: '프랜차이즈 운영에 최적'
            },
            {
                name: '레스토랑 건물',
                type: 'commercial',
                base_price: 800000000,
                monthly_income: 6000000,
                location: '신사동',
                size_sqm: 80,
                description: '고급 레스토랑 운영 건물'
            },
            {
                name: '피트니스 센터',
                type: 'commercial',
                base_price: 1200000000,
                monthly_income: 8000000,
                location: '잠실',
                size_sqm: 150,
                description: '대형 피트니스 센터'
            },
            {
                name: '스터디 카페',
                type: 'commercial',
                base_price: 400000000,
                monthly_income: 3000000,
                location: '대학가',
                size_sqm: 60,
                description: '24시간 스터디 카페'
            },
            {
                name: '코워킹 스페이스',
                type: 'commercial',
                base_price: 600000000,
                monthly_income: 4500000,
                location: '역삼동',
                size_sqm: 100,
                description: '공유 오피스 공간'
            },
            {
                name: '펜션',
                type: 'commercial',
                base_price: 2500000000,
                monthly_income: 12000000,
                location: '가평',
                size_sqm: 300,
                description: '힐링 펜션'
            },
            {
                name: '게스트하우스',
                type: 'commercial',
                base_price: 1000000000,
                monthly_income: 6000000,
                location: '홍대',
                size_sqm: 120,
                description: '외국인 관광객 대상'
            },
            {
                name: '병원 건물',
                type: 'commercial',
                base_price: 3000000000,
                monthly_income: 18000000,
                location: '역삼역',
                size_sqm: 400,
                description: '의료용 건물'
            },
            {
                name: '어린이집',
                type: 'commercial',
                base_price: 700000000,
                monthly_income: 4000000,
                location: '수지구',
                size_sqm: 80,
                description: '아이들을 위한 교육 시설'
            },
            {
                name: '미용실 건물',
                type: 'commercial',
                base_price: 500000000,
                monthly_income: 3500000,
                location: '압구정',
                size_sqm: 70,
                description: '고급 미용실 건물'
            },
            {
                name: '약국 건물',
                type: 'commercial',
                base_price: 800000000,
                monthly_income: 5000000,
                location: '잠실새내',
                size_sqm: 50,
                description: '병원가 근처 약국'
            },
            {
                name: '노래방 건물',
                type: 'commercial',
                base_price: 900000000,
                monthly_income: 5500000,
                location: '신촌',
                size_sqm: 100,
                description: '젊은층 타겟 노래방'
            },
            {
                name: 'PC방 건물',
                type: 'commercial',
                base_price: 1100000000,
                monthly_income: 7000000,
                location: '노원',
                size_sqm: 120,
                description: '최신 PC방 시설'
            },
            {
                name: '드라이브 스루',
                type: 'commercial',
                base_price: 1500000000,
                monthly_income: 9000000,
                location: '김포공항',
                size_sqm: 200,
                description: '드라이브 스루 매장'
            },
            {
                name: '웨딩홀',
                type: 'commercial',
                base_price: 5000000000,
                monthly_income: 25000000,
                location: '압구정',
                size_sqm: 500,
                description: '고급 웨딩홀'
            },

            // 신규 특수/럭셔리 부동산 (10개)
            {
                name: '스카이 라운지',
                type: 'luxury',
                base_price: 8000000000,
                monthly_income: 15000000,
                location: '63빌딩',
                size_sqm: 250,
                description: '최고층 스카이 라운지'
            },
            {
                name: '해변 별장',
                type: 'luxury',
                base_price: 6000000000,
                monthly_income: 12000000,
                location: '부산 해운대',
                size_sqm: 200,
                description: '바다가 보이는 별장'
            },
            {
                name: '산속 별장',
                type: 'luxury',
                base_price: 4000000000,
                monthly_income: 8000000,
                location: '지리산',
                size_sqm: 180,
                description: '자연 속 힐링 별장'
            },
            {
                name: '요트 클럽',
                type: 'luxury',
                base_price: 15000000000,
                monthly_income: 35000000,
                location: '마리나',
                size_sqm: 800,
                description: '프리미엄 요트 클럽'
            },
            {
                name: '골프장 클럽하우스',
                type: 'luxury',
                base_price: 20000000000,
                monthly_income: 40000000,
                location: '용인',
                size_sqm: 1000,
                description: '골프장 내 클럽하우스'
            },
            {
                name: '와이너리',
                type: 'luxury',
                base_price: 12000000000,
                monthly_income: 20000000,
                location: '영동',
                size_sqm: 600,
                description: '포도밭과 와인 제조장'
            },
            {
                name: '프라이빗 아일랜드',
                type: 'luxury',
                base_price: 50000000000,
                monthly_income: 80000000,
                location: '남해',
                size_sqm: 5000,
                description: '개인 소유 섬'
            },
            {
                name: '스키 리조트',
                type: 'luxury',
                base_price: 30000000000,
                monthly_income: 50000000,
                location: '평창',
                size_sqm: 2000,
                description: '스키 리조트 시설'
            },
            {
                name: '카지노 호텔',
                type: 'luxury',
                base_price: 40000000000,
                monthly_income: 70000000,
                location: '인천 영종도',
                size_sqm: 3000,
                description: '카지노가 있는 럭셔리 호텔'
            },
            {
                name: '우주 관측소',
                type: 'luxury',
                base_price: 100000000000,
                monthly_income: 100000000,
                location: '소백산',
                size_sqm: 1500,
                description: '첨단 우주 관측 시설'
            }
        ];
    }

    async initializePropertySystem() {
        // 부동산 시장가 변동을 위한 테이블 업데이트
        await this.db.run(`
            ALTER TABLE properties ADD COLUMN current_price REAL DEFAULT 0
        `).catch(() => {}); // 이미 존재하면 무시

        await this.db.run(`
            ALTER TABLE properties ADD COLUMN price_change_percent REAL DEFAULT 0
        `).catch(() => {});

        await this.db.run(`
            ALTER TABLE properties ADD COLUMN size_sqm INTEGER DEFAULT 0
        `).catch(() => {});

        // 부동산 시장 가격 업데이트
        await this.updatePropertyPrices();

        // 기본 부동산 데이터 삽입
        for (const property of this.propertyTypes) {
            const existing = await this.db.get('SELECT id FROM properties WHERE name = ?', [property.name]);
            if (!existing) {
                await this.db.run(`
                    INSERT INTO properties (name, type, price, location, monthly_income, size_sqm, current_price)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [property.name, property.type, property.base_price, property.location, 
                    property.monthly_income, property.size_sqm, property.base_price]);
            }
        }

        console.log('부동산 시스템 초기화 완료');
    }

    async updatePropertyPrices() {
        const properties = await this.db.all('SELECT * FROM properties');
        
        for (const property of properties) {
            // 부동산 가격 변동 (-5% ~ +5%)
            const changePercent = (Math.random() - 0.5) * 0.1; // -5% ~ +5%
            let newPrice = property.current_price || property.price;
            
            // 지역별 프리미엄
            let locationMultiplier = 1;
            if (property.location.includes('강남')) locationMultiplier = 1.2;
            else if (property.location.includes('강북')) locationMultiplier = 0.9;
            else if (property.location.includes('제주')) locationMultiplier = 1.1;
            
            newPrice = newPrice * (1 + changePercent) * locationMultiplier;
            
            await this.db.run(`
                UPDATE properties 
                SET current_price = ?, price_change_percent = ?
                WHERE id = ?
            `, [Math.floor(newPrice), changePercent * 100, property.id]);
        }
    }

    async buyProperty(playerId, propertyId) {
        try {
            // 부동산 정보 확인
            const property = await this.db.get('SELECT * FROM properties WHERE id = ?', [propertyId]);
            if (!property) {
                return { success: false, message: '존재하지 않는 부동산입니다.' };
            }

            // 이미 소유한 부동산인지 확인
            const owned = await this.db.get(`
                SELECT * FROM player_properties WHERE property_id = ?
            `, [propertyId]);

            if (owned) {
                return { success: false, message: '이미 다른 플레이어가 소유한 부동산입니다.' };
            }

            // 플레이어 자금 확인
            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [playerId]);
            const currentPrice = property.current_price || property.price;

            if (player.money < currentPrice) {
                return { 
                    success: false, 
                    message: `자금이 부족합니다. 필요: ${currentPrice.toLocaleString()}원` 
                };
            }

            // 부동산 구매
            await this.db.run(`
                INSERT INTO player_properties (player_id, property_id, purchase_price)
                VALUES (?, ?, ?)
            `, [playerId, propertyId, currentPrice]);

            // 자금 차감
            await this.db.run('UPDATE players SET money = money - ? WHERE id = ?', [currentPrice, playerId]);

            // 거래 내역 기록
            await this.db.run(`
                INSERT INTO transactions (player_id, type, amount, description)
                VALUES (?, 'property_purchase', ?, ?)
            `, [playerId, -currentPrice, `${property.name} 구매`]);

            return {
                success: true,
                message: `${property.name}을(를) 구매했습니다!`,
                cost: currentPrice,
                monthlyIncome: property.monthly_income
            };

        } catch (error) {
            console.error('부동산 구매 오류:', error);
            return { success: false, message: '부동산 구매 중 오류가 발생했습니다.' };
        }
    }

    async sellProperty(playerId, propertyId) {
        try {
            // 소유 확인
            const ownership = await this.db.get(`
                SELECT pp.*, p.name, p.current_price, p.price
                FROM player_properties pp
                JOIN properties p ON pp.property_id = p.id
                WHERE pp.player_id = ? AND pp.property_id = ?
            `, [playerId, propertyId]);

            if (!ownership) {
                return { success: false, message: '소유하지 않은 부동산입니다.' };
            }

            // 현재 시세로 매각
            const currentPrice = ownership.current_price || ownership.price;
            const profit = currentPrice - ownership.purchase_price;
            const transactionFee = Math.floor(currentPrice * 0.03); // 3% 거래 수수료
            const finalAmount = currentPrice - transactionFee;

            // 부동산 매각
            await this.db.run(`
                DELETE FROM player_properties WHERE player_id = ? AND property_id = ?
            `, [playerId, propertyId]);

            // 매각 대금 지급
            await this.db.run('UPDATE players SET money = money + ? WHERE id = ?', [finalAmount, playerId]);

            // 거래 내역 기록
            await this.db.run(`
                INSERT INTO transactions (player_id, type, amount, description)
                VALUES (?, 'property_sale', ?, ?)
            `, [playerId, finalAmount, `${ownership.name} 매각`]);

            return {
                success: true,
                message: `${ownership.name}을(를) 매각했습니다!`,
                salePrice: currentPrice,
                fee: transactionFee,
                finalAmount: finalAmount,
                profit: profit
            };

        } catch (error) {
            console.error('부동산 매각 오류:', error);
            return { success: false, message: '부동산 매각 중 오류가 발생했습니다.' };
        }
    }

    async collectRent(playerId) {
        try {
            const properties = await this.db.all(`
                SELECT pp.*, p.name, p.monthly_income
                FROM player_properties pp
                JOIN properties p ON pp.property_id = p.id
                WHERE pp.player_id = ?
            `, [playerId]);

            if (properties.length === 0) {
                return { success: false, message: '소유한 부동산이 없습니다.' };
            }

            // 마지막 임대료 수령일 확인
            const lastRent = await this.db.get(`
                SELECT * FROM transactions 
                WHERE player_id = ? AND type = 'rent'
                ORDER BY timestamp DESC LIMIT 1
            `, [playerId]);

            const now = new Date();
            const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

            if (lastRent && new Date(lastRent.timestamp) > oneMonthAgo) {
                const nextRentDate = new Date(lastRent.timestamp);
                nextRentDate.setMonth(nextRentDate.getMonth() + 1);
                
                return { 
                    success: false, 
                    message: `이미 이번 달 임대료를 받았습니다. 다음 수령일: ${nextRentDate.toLocaleDateString('ko-KR')}` 
                };
            }

            // 총 임대료 계산
            let totalRent = 0;
            const rentDetails = [];

            for (const property of properties) {
                const rent = property.monthly_income;
                totalRent += rent;
                rentDetails.push({
                    name: property.name,
                    rent: rent
                });
            }

            // 임대료 지급
            await this.db.run('UPDATE players SET money = money + ? WHERE id = ?', [totalRent, playerId]);

            // 거래 내역 기록
            await this.db.run(`
                INSERT INTO transactions (player_id, type, amount, description)
                VALUES (?, 'rent', ?, '월간 임대료')
            `, [playerId, totalRent]);

            return {
                success: true,
                totalRent: totalRent,
                properties: rentDetails
            };

        } catch (error) {
            console.error('임대료 수령 오류:', error);
            return { success: false, message: '임대료 수령 중 오류가 발생했습니다.' };
        }
    }

    async getPropertyMarket() {
        return await this.db.all(`
            SELECT 
                p.*,
                CASE WHEN pp.player_id IS NOT NULL THEN 1 ELSE 0 END as is_owned,
                pl.username as owner_name
            FROM properties p
            LEFT JOIN player_properties pp ON p.id = pp.property_id
            LEFT JOIN players pl ON pp.player_id = pl.id
            ORDER BY p.type, p.current_price ASC
        `);
    }

    async getPlayerProperties(playerId) {
        return await this.db.all(`
            SELECT 
                pp.*,
                p.name,
                p.type,
                p.location,
                p.monthly_income,
                p.current_price,
                p.price_change_percent,
                p.size_sqm,
                (p.current_price - pp.purchase_price) as profit_loss,
                ((p.current_price - pp.purchase_price) / pp.purchase_price * 100) as profit_rate
            FROM player_properties pp
            JOIN properties p ON pp.property_id = p.id
            WHERE pp.player_id = ?
            ORDER BY pp.purchase_date DESC
        `, [playerId]);
    }

    async upgradeProperty(playerId, propertyId) {
        try {
            const ownership = await this.db.get(`
                SELECT pp.*, p.name, p.monthly_income
                FROM player_properties pp
                JOIN properties p ON pp.property_id = p.id
                WHERE pp.player_id = ? AND pp.property_id = ?
            `, [playerId, propertyId]);

            if (!ownership) {
                return { success: false, message: '소유하지 않은 부동산입니다.' };
            }

            const upgradeCost = ownership.monthly_income * 10; // 월세의 10배

            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [playerId]);
            if (player.money < upgradeCost) {
                return { 
                    success: false, 
                    message: `업그레이드 비용이 부족합니다. 필요: ${upgradeCost.toLocaleString()}원` 
                };
            }

            // 임대료 20% 증가
            const newMonthlyIncome = Math.floor(ownership.monthly_income * 1.2);

            await this.db.run(`
                UPDATE properties SET monthly_income = ? WHERE id = ?
            `, [newMonthlyIncome, propertyId]);

            // 비용 차감
            await this.db.run('UPDATE players SET money = money - ? WHERE id = ?', [upgradeCost, playerId]);

            return {
                success: true,
                message: `${ownership.name}을(를) 업그레이드했습니다!`,
                cost: upgradeCost,
                oldIncome: ownership.monthly_income,
                newIncome: newMonthlyIncome
            };

        } catch (error) {
            console.error('부동산 업그레이드 오류:', error);
            return { success: false, message: '부동산 업그레이드 중 오류가 발생했습니다.' };
        }
    }

    async getPropertyRankings() {
        return await this.db.all(`
            SELECT 
                p.username,
                COUNT(pp.id) as property_count,
                SUM(pr.current_price) as total_value,
                SUM(pr.monthly_income) as total_monthly_income
            FROM players p
            JOIN player_properties pp ON p.id = pp.player_id
            JOIN properties pr ON pp.property_id = pr.id
            GROUP BY p.id, p.username
            ORDER BY total_value DESC
            LIMIT 10
        `);
    }

    createMarketEmbed(properties) {
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🏘️ 부동산 시장')
            .setDescription('매매 가능한 부동산 목록')
            .setTimestamp();

        const types = {
            'residential': '🏠 주거용',
            'commercial': '🏢 상업용',
            'luxury': '💎 럭셔리'
        };

        const groupedProperties = {};
        properties.forEach(property => {
            if (!groupedProperties[property.type]) {
                groupedProperties[property.type] = [];
            }
            groupedProperties[property.type].push(property);
        });

        for (const [type, typeProperties] of Object.entries(groupedProperties)) {
            const typeEmoji = types[type] || '🏘️';
            const propertiesText = typeProperties.slice(0, 5).map(property => {
                const currentPrice = property.current_price || property.price;
                const changeIcon = property.price_change_percent >= 0 ? '📈' : '📉';
                const changeText = property.price_change_percent ? 
                    `${changeIcon} ${property.price_change_percent.toFixed(1)}%` : '';
                const statusText = property.is_owned ? 
                    `(소유자: ${property.owner_name})` : '🟢 구매 가능';

                return [
                    `**${property.name}** (ID: ${property.id})`,
                    `💰 현재가: ${currentPrice.toLocaleString()}원 ${changeText}`,
                    `📍 위치: ${property.location}`,
                    `📏 면적: ${property.size_sqm}㎡`,
                    `💵 월 임대료: ${property.monthly_income.toLocaleString()}원`,
                    `📊 ${statusText}`
                ].join('\n');
            }).join('\n\n');

            embed.addFields({
                name: typeEmoji,
                value: propertiesText,
                inline: false
            });
        }

        embed.setFooter({ text: '부동산을 구매하려면 "/부동산 구매 부동산id:{ID}"를 사용하세요' });
        return embed;
    }

    createPortfolioEmbed(properties) {
        const embed = new EmbedBuilder()
            .setColor(0x0000FF)
            .setTitle('🏠 내 부동산 포트폴리오')
            .setTimestamp();

        if (properties.length === 0) {
            embed.setDescription('소유한 부동산이 없습니다.\n부동산 시장에서 투자해보세요!');
            return embed;
        }

        // 포트폴리오 요약
        const totalValue = properties.reduce((sum, prop) => sum + prop.current_price, 0);
        const totalPurchaseValue = properties.reduce((sum, prop) => sum + prop.purchase_price, 0);
        const totalMonthlyIncome = properties.reduce((sum, prop) => sum + prop.monthly_income, 0);
        const totalProfitLoss = totalValue - totalPurchaseValue;

        embed.addFields({
            name: '📊 포트폴리오 요약',
            value: [
                `💰 총 현재가치: ${totalValue.toLocaleString()}원`,
                `💵 총 투자금액: ${totalPurchaseValue.toLocaleString()}원`,
                `📈 총 손익: ${totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toLocaleString()}원`,
                `🏠 보유 부동산: ${properties.length}개`,
                `💸 월 임대수익: ${totalMonthlyIncome.toLocaleString()}원`
            ].join('\n'),
            inline: false
        });

        // 부동산 목록
        const propertiesText = properties.map(property => {
            const profitColor = property.profit_loss >= 0 ? '+' : '';
            const changeIcon = property.price_change_percent >= 0 ? '📈' : '📉';
            
            return [
                `**${property.name}** (ID: ${property.property_id})`,
                `💰 현재가: ${property.current_price.toLocaleString()}원 ${changeIcon}`,
                `💵 구매가: ${property.purchase_price.toLocaleString()}원`,
                `📈 손익: ${profitColor}${property.profit_loss.toLocaleString()}원 (${property.profit_rate.toFixed(1)}%)`,
                `💸 월 임대료: ${property.monthly_income.toLocaleString()}원`
            ].join('\n');
        }).join('\n\n');

        embed.addFields({
            name: '🏘️ 보유 부동산',
            value: propertiesText.length > 1024 ? propertiesText.substring(0, 1020) + '...' : propertiesText,
            inline: false
        });

        return embed;
    }
}

module.exports = PropertySystem;

