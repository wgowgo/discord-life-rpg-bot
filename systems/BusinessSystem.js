const { EmbedBuilder } = require('discord.js');

class BusinessSystem {
    constructor(database) {
        this.db = database;
        this.businessTypes = [
            // 기존 사업들
            {
                name: '카페',
                category: 'food',
                initial_cost: 5000000,
                monthly_revenue: 800000,
                monthly_cost: 400000,
                required_staff: 2,
                description: '아늑한 동네 카페'
            },
            {
                name: '편의점',
                category: 'retail',
                initial_cost: 3000000,
                monthly_revenue: 600000,
                monthly_cost: 300000,
                required_staff: 1,
                description: '24시간 편의점'
            },
            {
                name: 'IT회사',
                category: 'technology',
                initial_cost: 20000000,
                monthly_revenue: 5000000,
                monthly_cost: 3000000,
                required_staff: 10,
                description: '소프트웨어 개발 회사'
            },
            {
                name: '레스토랑',
                category: 'food',
                initial_cost: 15000000,
                monthly_revenue: 2500000,
                monthly_cost: 1500000,
                required_staff: 5,
                description: '고급 레스토랑'
            },
            {
                name: '헬스장',
                category: 'fitness',
                initial_cost: 10000000,
                monthly_revenue: 1800000,
                monthly_cost: 800000,
                required_staff: 3,
                description: '피트니스 센터'
            },
            
            // 신규 사업들
            {
                name: '요리학원',
                category: 'education',
                initial_cost: 8000000,
                monthly_revenue: 1200000,
                monthly_cost: 600000,
                required_staff: 4,
                description: '요리 전문 교육 학원'
            },
            {
                name: '게임개발스튜디오',
                category: 'technology',
                initial_cost: 25000000,
                monthly_revenue: 6000000,
                monthly_cost: 4000000,
                required_staff: 12,
                description: '인디 게임 개발 스튜디오'
            },
            {
                name: '컨설팅회사',
                category: 'business',
                initial_cost: 30000000,
                monthly_revenue: 8000000,
                monthly_cost: 5000000,
                required_staff: 15,
                description: '경영 컨설팅 전문 회사'
            },
            {
                name: '온라인쇼핑몰',
                category: 'retail',
                initial_cost: 12000000,
                monthly_revenue: 2000000,
                monthly_cost: 1000000,
                required_staff: 6,
                description: '전자상거래 플랫폼'
            },
            {
                name: '미용실',
                category: 'beauty',
                initial_cost: 6000000,
                monthly_revenue: 900000,
                monthly_cost: 450000,
                required_staff: 3,
                description: '헤어&네일 전문 미용실'
            },
            {
                name: '펜션',
                category: 'hospitality',
                initial_cost: 50000000,
                monthly_revenue: 4000000,
                monthly_cost: 1500000,
                required_staff: 4,
                description: '자연 속 휴양 펜션'
            },
            {
                name: '스튜디오',
                category: 'creative',
                initial_cost: 18000000,
                monthly_revenue: 3000000,
                monthly_cost: 1800000,
                required_staff: 8,
                description: '영상/사진 촬영 스튜디오'
            },
            {
                name: '피자가게',
                category: 'food',
                initial_cost: 7000000,
                monthly_revenue: 1100000,
                monthly_cost: 650000,
                required_staff: 3,
                description: '수제 피자 전문점'
            },
            {
                name: '애완동물샵',
                category: 'pet',
                initial_cost: 9000000,
                monthly_revenue: 1400000,
                monthly_cost: 700000,
                required_staff: 4,
                description: '반려동물 용품 전문점'
            },
            {
                name: '세탁소',
                category: 'service',
                initial_cost: 4000000,
                monthly_revenue: 700000,
                monthly_cost: 350000,
                required_staff: 2,
                description: '동네 드라이클리닝 전문점'
            },
            {
                name: 'PC방',
                category: 'entertainment',
                initial_cost: 15000000,
                monthly_revenue: 2200000,
                monthly_cost: 1300000,
                required_staff: 3,
                description: '게임 카페 & PC방'
            },
            {
                name: '독서실',
                category: 'education',
                initial_cost: 8000000,
                monthly_revenue: 1300000,
                monthly_cost: 500000,
                required_staff: 2,
                description: '프리미엄 개인 독서실'
            },
            {
                name: '꽃집',
                category: 'retail',
                initial_cost: 5000000,
                monthly_revenue: 750000,
                monthly_cost: 400000,
                required_staff: 2,
                description: '플라워샵 & 화환 전문점'
            },
            {
                name: '약국',
                category: 'medical',
                initial_cost: 35000000,
                monthly_revenue: 4500000,
                monthly_cost: 2500000,
                required_staff: 3,
                description: '지역 의약품 전문 약국'
            },
            {
                name: '노래방',
                category: 'entertainment',
                initial_cost: 12000000,
                monthly_revenue: 1800000,
                monthly_cost: 900000,
                required_staff: 4,
                description: '최신 시설 코인 노래방'
            }
        ];
    }

    async initializeBusinessTypes() {
        // 사업 종류 테이블이 없다면 생성
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS business_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                initial_cost REAL NOT NULL,
                monthly_revenue REAL NOT NULL,
                monthly_cost REAL NOT NULL,
                required_staff INTEGER NOT NULL,
                description TEXT
            )
        `);

        // 플레이어 사업 테이블 생성
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS player_businesses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                business_type_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                level INTEGER DEFAULT 1,
                staff_count INTEGER DEFAULT 0,
                reputation INTEGER DEFAULT 50,
                monthly_profit REAL DEFAULT 0,
                created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE,
                FOREIGN KEY (player_id) REFERENCES players(id),
                FOREIGN KEY (business_type_id) REFERENCES business_types(id)
            )
        `);

        // 사업 종류 데이터 삽입
        for (const business of this.businessTypes) {
            await this.db.run(`
                INSERT OR IGNORE INTO business_types (name, category, initial_cost, monthly_revenue, monthly_cost, required_staff, description)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [business.name, business.category, business.initial_cost, business.monthly_revenue, 
                business.monthly_cost, business.required_staff, business.description]);
        }

        // console.log('사업 시스템 초기화 완료');
    }

    async startBusiness(playerId, businessTypeId, businessName) {
        try {
            // 플레이어 정보 확인
            const player = await this.db.get('SELECT * FROM players WHERE id = ?', [playerId]);
            if (!player) {
                return { success: false, message: '플레이어를 찾을 수 없습니다.' };
            }

            // 사업 종류 확인
            const businessType = await this.db.get('SELECT * FROM business_types WHERE id = ?', [businessTypeId]);
            if (!businessType) {
                return { success: false, message: '존재하지 않는 사업 종류입니다.' };
            }

            // 자금 확인
            if (player.money < businessType.initial_cost) {
                return { 
                    success: false, 
                    message: `자금이 부족합니다. 필요: ${businessType.initial_cost.toLocaleString()}원` 
                };
            }

            // 같은 이름의 사업 확인
            const existingBusiness = await this.db.get(`
                SELECT * FROM player_businesses WHERE player_id = ? AND name = ?
            `, [playerId, businessName]);

            if (existingBusiness) {
                return { success: false, message: '이미 같은 이름의 사업이 있습니다.' };
            }

            // 사업 생성
            await this.db.run(`
                INSERT INTO player_businesses (player_id, business_type_id, name)
                VALUES (?, ?, ?)
            `, [playerId, businessTypeId, businessName]);

            // 초기 비용 차감
            await this.db.run('UPDATE players SET money = money - ? WHERE id = ?', [businessType.initial_cost, playerId]);

            // 거래 내역 기록
            await this.db.run(`
                INSERT INTO transactions (player_id, type, amount, description)
                VALUES (?, 'business_investment', ?, ?)
            `, [playerId, -businessType.initial_cost, `${businessType.name} 창업 (${businessName})`]);

            return {
                success: true,
                message: `${businessType.name} "${businessName}"를 성공적으로 창업했습니다!`,
                cost: businessType.initial_cost
            };

        } catch (error) {
            console.error('사업 시작 오류:', error);
            return { success: false, message: '사업 시작 중 오류가 발생했습니다.' };
        }
    }

    async hireStaff(playerId, businessId, count) {
        try {
            // 사업 정보 확인
            const business = await this.db.get(`
                SELECT pb.*, bt.required_staff, bt.monthly_cost
                FROM player_businesses pb
                JOIN business_types bt ON pb.business_type_id = bt.id
                WHERE pb.id = ? AND pb.player_id = ?
            `, [businessId, playerId]);

            if (!business) {
                return { success: false, message: '사업을 찾을 수 없습니다.' };
            }

            const newStaffCount = business.staff_count + count;
            const hiringCost = count * 100000; // 직원 1명당 10만원 채용비

            // 자금 확인
            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [playerId]);
            if (player.money < hiringCost) {
                return { 
                    success: false, 
                    message: `채용 비용이 부족합니다. 필요: ${hiringCost.toLocaleString()}원` 
                };
            }

            // 직원 채용
            await this.db.run(`
                UPDATE player_businesses SET staff_count = ? WHERE id = ?
            `, [newStaffCount, businessId]);

            // 채용 비용 차감
            await this.db.run('UPDATE players SET money = money - ? WHERE id = ?', [hiringCost, playerId]);

            return {
                success: true,
                message: `직원 ${count}명을 채용했습니다.`,
                cost: hiringCost,
                newStaffCount: newStaffCount
            };

        } catch (error) {
            console.error('직원 채용 오류:', error);
            return { success: false, message: '직원 채용 중 오류가 발생했습니다.' };
        }
    }

    async upgradeBusiness(playerId, businessId) {
        try {
            const business = await this.db.get(`
                SELECT * FROM player_businesses WHERE id = ? AND player_id = ?
            `, [businessId, playerId]);

            if (!business) {
                return { success: false, message: '사업을 찾을 수 없습니다.' };
            }

            const upgradeCost = business.level * 2000000; // 레벨당 200만원

            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [playerId]);
            if (player.money < upgradeCost) {
                return { 
                    success: false, 
                    message: `업그레이드 비용이 부족합니다. 필요: ${upgradeCost.toLocaleString()}원` 
                };
            }

            // 사업 업그레이드
            await this.db.run(`
                UPDATE player_businesses 
                SET level = level + 1, reputation = reputation + 10
                WHERE id = ?
            `, [businessId]);

            // 비용 차감
            await this.db.run('UPDATE players SET money = money - ? WHERE id = ?', [upgradeCost, playerId]);

            return {
                success: true,
                message: `사업을 레벨 ${business.level + 1}로 업그레이드했습니다!`,
                cost: upgradeCost,
                newLevel: business.level + 1
            };

        } catch (error) {
            console.error('사업 업그레이드 오류:', error);
            return { success: false, message: '사업 업그레이드 중 오류가 발생했습니다.' };
        }
    }

    async calculateMonthlyProfit(businessId) {
        const business = await this.db.get(`
            SELECT pb.*, bt.*
            FROM player_businesses pb
            JOIN business_types bt ON pb.business_type_id = bt.id
            WHERE pb.id = ?
        `, [businessId]);

        if (!business) return 0;

        // 기본 수익
        let revenue = business.monthly_revenue;
        
        // 레벨에 따른 수익 증가 (레벨당 10%)
        revenue *= (1 + (business.level - 1) * 0.1);
        
        // 평판에 따른 수익 조정 (평판 50 기준)
        revenue *= (business.reputation / 50);
        
        // 직원 부족에 따른 페널티
        const staffEfficiency = Math.min(1, business.staff_count / business.required_staff);
        revenue *= staffEfficiency;

        // 비용 계산
        let cost = business.monthly_cost;
        cost += business.staff_count * 300000; // 직원 1명당 월급 30만원

        const profit = revenue - cost;
        
        // 월 수익 업데이트
        await this.db.run(`
            UPDATE player_businesses SET monthly_profit = ? WHERE id = ?
        `, [profit, businessId]);

        return profit;
    }

    async collectMonthlyProfit(playerId) {
        try {
            const businesses = await this.db.all(`
                SELECT * FROM player_businesses WHERE player_id = ? AND is_active = TRUE
            `, [playerId]);

            if (businesses.length === 0) {
                return { success: false, message: '운영 중인 사업이 없습니다.' };
            }

            let totalProfit = 0;
            const businessResults = [];

            for (const business of businesses) {
                const profit = await this.calculateMonthlyProfit(business.id);
                totalProfit += profit;
                
                businessResults.push({
                    name: business.name,
                    profit: profit
                });

                // 평판 변동 (랜덤)
                const reputationChange = Math.floor(Math.random() * 21) - 10; // -10 ~ +10
                await this.db.run(`
                    UPDATE player_businesses 
                    SET reputation = CASE 
                        WHEN reputation + ? < 0 THEN 0 
                        WHEN reputation + ? > 100 THEN 100 
                        ELSE reputation + ? 
                    END
                    WHERE id = ?
                `, [reputationChange, reputationChange, reputationChange, business.id]);
            }

            // 총 수익 지급
            await this.db.run('UPDATE players SET money = money + ? WHERE id = ?', [totalProfit, playerId]);

            // 거래 내역 기록
            await this.db.run(`
                INSERT INTO transactions (player_id, type, amount, description)
                VALUES (?, 'business_profit', ?, '월간 사업 수익')
            `, [playerId, totalProfit]);

            return {
                success: true,
                totalProfit: totalProfit,
                businesses: businessResults
            };

        } catch (error) {
            console.error('월간 수익 수령 오류:', error);
            return { success: false, message: '월간 수익 수령 중 오류가 발생했습니다.' };
        }
    }

    async getBusinessList(playerId) {
        return await this.db.all(`
            SELECT 
                pb.*,
                bt.name as type_name,
                bt.category,
                bt.required_staff
            FROM player_businesses pb
            JOIN business_types bt ON pb.business_type_id = bt.id
            WHERE pb.player_id = ?
            ORDER BY pb.created_date DESC
        `, [playerId]);
    }

    async getBusinessTypes() {
        return await this.db.all('SELECT * FROM business_types ORDER BY initial_cost ASC');
    }

    async sellBusiness(playerId, businessId) {
        try {
            const business = await this.db.get(`
                SELECT pb.*, bt.initial_cost
                FROM player_businesses pb
                JOIN business_types bt ON pb.business_type_id = bt.id
                WHERE pb.id = ? AND pb.player_id = ?
            `, [businessId, playerId]);

            if (!business) {
                return { success: false, message: '사업을 찾을 수 없습니다.' };
            }

            // 매각 가격 계산 (초기비용의 50% + 레벨보너스 + 평판보너스)
            let sellPrice = business.initial_cost * 0.5;
            sellPrice += business.level * 500000; // 레벨당 50만원
            sellPrice += (business.reputation - 50) * 10000; // 평판 1당 1만원
            sellPrice = Math.max(0, sellPrice);

            // 사업 매각
            await this.db.run(`
                UPDATE player_businesses SET is_active = FALSE WHERE id = ?
            `, [businessId]);

            // 매각 대금 지급
            await this.db.run('UPDATE players SET money = money + ? WHERE id = ?', [sellPrice, playerId]);

            // 거래 내역 기록
            await this.db.run(`
                INSERT INTO transactions (player_id, type, amount, description)
                VALUES (?, 'business_sale', ?, ?)
            `, [playerId, sellPrice, `${business.name} 매각`]);

            return {
                success: true,
                message: `"${business.name}"을(를) 매각했습니다.`,
                sellPrice: sellPrice
            };

        } catch (error) {
            console.error('사업 매각 오류:', error);
            return { success: false, message: '사업 매각 중 오류가 발생했습니다.' };
        }
    }

    async getBusinessRankings() {
        return await this.db.all(`
            SELECT 
                p.username,
                pb.name as business_name,
                bt.name as business_type,
                pb.level,
                pb.reputation,
                pb.monthly_profit
            FROM player_businesses pb
            JOIN players p ON pb.player_id = p.id
            JOIN business_types bt ON pb.business_type_id = bt.id
            WHERE pb.is_active = TRUE
            ORDER BY pb.monthly_profit DESC, pb.level DESC
            LIMIT 10
        `);
    }

    createBusinessListEmbed(businesses) {
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🏢 내 사업 목록')
            .setTimestamp();

        if (businesses.length === 0) {
            embed.setDescription('아직 운영 중인 사업이 없습니다.\n사업을 시작해보세요!');
            return embed;
        }

        for (const business of businesses) {
            const statusIcon = business.is_active ? '🟢' : '🔴';
            const profitColor = business.monthly_profit >= 0 ? '+' : '';
            
            embed.addFields({
                name: `${statusIcon} ${business.name} (ID: ${business.id})`,
                value: [
                    `🏭 업종: ${business.type_name}`,
                    `📊 레벨: ${business.level}`,
                    `👥 직원: ${business.staff_count}/${business.required_staff}명`,
                    `⭐ 평판: ${business.reputation}/100`,
                    `💰 월 수익: ${profitColor}${business.monthly_profit.toLocaleString()}원`
                ].join('\n'),
                inline: false
            });
        }

        return embed;
    }

    createBusinessTypesEmbed(businessTypes) {
        const embed = new EmbedBuilder()
            .setColor(0x0000FF)
            .setTitle('🏪 창업 가능한 사업')
            .setDescription('다양한 사업을 시작해보세요!')
            .setTimestamp();

        const categories = {};
        businessTypes.forEach(business => {
            if (!categories[business.category]) {
                categories[business.category] = [];
            }
            categories[business.category].push(business);
        });

        for (const [category, businesses] of Object.entries(categories)) {
            const businessesText = businesses.map(business => {
                const roi = ((business.monthly_revenue - business.monthly_cost) / business.initial_cost * 100).toFixed(1);
                return [
                    `**${business.name}** (ID: ${business.id})`,
                    `💰 초기비용: ${business.initial_cost.toLocaleString()}원`,
                    `📈 월 예상수익: ${(business.monthly_revenue - business.monthly_cost).toLocaleString()}원`,
                    `👥 필요 직원: ${business.required_staff}명`,
                    `📊 투자수익률: ${roi}%/월`,
                    `📝 ${business.description}`
                ].join('\n');
            }).join('\n\n');

            embed.addFields({
                name: `📂 ${category.toUpperCase()}`,
                value: businessesText,
                inline: false
            });
        }

        embed.setFooter({ text: '사업을 시작하려면 "/사업 창업 사업종류id:{ID} 사업명:{이름}"을 사용하세요' });
        return embed;
    }
}

module.exports = BusinessSystem;

