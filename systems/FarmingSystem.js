const { EmbedBuilder } = require('discord.js');

class FarmingSystem {
    constructor(database) {
        this.db = database;
        
        // === 농작물 시스템 (70개+) ===
        this.crops = [
            // === 기본 곡물 (Common) ===
            { id: 'wheat', name: '밀', category: 'grain', rarity: 'common', growth_time: 120, value: 100, exp_gain: 5, level_req: 1, description: '기본적인 곡물', seeds_cost: 50 },
            { id: 'barley', name: '보리', category: 'grain', rarity: 'common', growth_time: 100, value: 90, exp_gain: 4, level_req: 1, description: '맥주의 원료가 되는 곡물', seeds_cost: 45 },
            { id: 'oats', name: '귀리', category: 'grain', rarity: 'common', growth_time: 110, value: 95, exp_gain: 5, level_req: 1, description: '영양가 높은 곡물', seeds_cost: 48 },
            { id: 'rice', name: '쌀', category: 'grain', rarity: 'common', growth_time: 180, value: 150, exp_gain: 8, level_req: 3, description: '주식용 곡물', seeds_cost: 75 },
            { id: 'corn', name: '옥수수', category: 'grain', rarity: 'common', growth_time: 150, value: 120, exp_gain: 6, level_req: 2, description: '달콤한 곡물', seeds_cost: 60 },
            { id: 'rye', name: '호밀', category: 'grain', rarity: 'common', growth_time: 130, value: 110, exp_gain: 5, level_req: 2, description: '빵 만들기 좋은 곡물', seeds_cost: 55 },
            
            // === 기본 채소 (Common) ===
            { id: 'potato', name: '감자', category: 'vegetable', rarity: 'common', growth_time: 90, value: 80, exp_gain: 4, level_req: 1, description: '영양가 높은 뿌리채소', seeds_cost: 40 },
            { id: 'carrot', name: '당근', category: 'vegetable', rarity: 'common', growth_time: 80, value: 70, exp_gain: 3, level_req: 1, description: '주황색 뿌리채소', seeds_cost: 35 },
            { id: 'onion', name: '양파', category: 'vegetable', rarity: 'common', growth_time: 100, value: 85, exp_gain: 4, level_req: 1, description: '매운맛의 채소', seeds_cost: 42 },
            { id: 'cabbage', name: '양배추', category: 'vegetable', rarity: 'common', growth_time: 120, value: 100, exp_gain: 5, level_req: 2, description: '둥근 잎채소', seeds_cost: 50 },
            { id: 'lettuce', name: '상추', category: 'vegetable', rarity: 'common', growth_time: 60, value: 60, exp_gain: 3, level_req: 1, description: '부드러운 잎채소', seeds_cost: 30 },
            { id: 'spinach', name: '시금치', category: 'vegetable', rarity: 'common', growth_time: 70, value: 65, exp_gain: 3, level_req: 1, description: '철분이 풍부한 채소', seeds_cost: 32 },
            { id: 'radish', name: '무', category: 'vegetable', rarity: 'common', growth_time: 85, value: 75, exp_gain: 4, level_req: 1, description: '하얀 뿌리채소', seeds_cost: 37 },
            { id: 'broccoli', name: '브로콜리', category: 'vegetable', rarity: 'common', growth_time: 110, value: 95, exp_gain: 5, level_req: 2, description: '녹색 꽃채소', seeds_cost: 47 },
            
            // === 기본 과일 (Common ~ Rare) ===
            { id: 'apple', name: '사과', category: 'fruit', rarity: 'common', growth_time: 300, value: 200, exp_gain: 10, level_req: 5, description: '빨간 과일', seeds_cost: 100 },
            { id: 'orange', name: '오렌지', category: 'fruit', rarity: 'common', growth_time: 320, value: 220, exp_gain: 11, level_req: 6, description: '주황색 감귤류', seeds_cost: 110 },
            { id: 'banana', name: '바나나', category: 'fruit', rarity: 'common', growth_time: 280, value: 180, exp_gain: 9, level_req: 4, description: '노란 열대과일', seeds_cost: 90 },
            { id: 'grape', name: '포도', category: 'fruit', rarity: 'rare', growth_time: 400, value: 300, exp_gain: 15, level_req: 8, description: '와인의 원료', seeds_cost: 150 },
            { id: 'strawberry', name: '딸기', category: 'fruit', rarity: 'rare', growth_time: 200, value: 250, exp_gain: 12, level_req: 7, description: '달콤한 빨간 과일', seeds_cost: 125 },
            { id: 'peach', name: '복숭아', category: 'fruit', rarity: 'rare', growth_time: 360, value: 280, exp_gain: 14, level_req: 8, description: '부드러운 과일', seeds_cost: 140 },
            { id: 'pear', name: '배', category: 'fruit', rarity: 'common', growth_time: 340, value: 210, exp_gain: 10, level_req: 6, description: '아삭한 과일', seeds_cost: 105 },
            { id: 'cherry', name: '체리', category: 'fruit', rarity: 'rare', growth_time: 380, value: 320, exp_gain: 16, level_req: 9, description: '작고 달콤한 과일', seeds_cost: 160 },
            
            // === 허브류 (Rare) ===
            { id: 'basil', name: '바질', category: 'herb', rarity: 'rare', growth_time: 90, value: 150, exp_gain: 8, level_req: 5, description: '향긋한 허브', seeds_cost: 75 },
            { id: 'mint', name: '민트', category: 'herb', rarity: 'rare', growth_time: 80, value: 140, exp_gain: 7, level_req: 4, description: '시원한 허브', seeds_cost: 70 },
            { id: 'rosemary', name: '로즈마리', category: 'herb', rarity: 'rare', growth_time: 120, value: 180, exp_gain: 9, level_req: 6, description: '향이 강한 허브', seeds_cost: 90 },
            { id: 'thyme', name: '타임', category: 'herb', rarity: 'rare', growth_time: 100, value: 160, exp_gain: 8, level_req: 5, description: '요리용 허브', seeds_cost: 80 },
            { id: 'oregano', name: '오레가노', category: 'herb', rarity: 'rare', growth_time: 110, value: 170, exp_gain: 8, level_req: 6, description: '피자에 들어가는 허브', seeds_cost: 85 },
            { id: 'sage', name: '세이지', category: 'herb', rarity: 'rare', growth_time: 130, value: 190, exp_gain: 9, level_req: 7, description: '약용 허브', seeds_cost: 95 },
            
            // === 향신료 (Rare ~ Epic) ===
            { id: 'chili', name: '고추', category: 'spice', rarity: 'rare', growth_time: 140, value: 200, exp_gain: 10, level_req: 7, description: '매운 향신료', seeds_cost: 100 },
            { id: 'garlic', name: '마늘', category: 'spice', rarity: 'rare', growth_time: 150, value: 180, exp_gain: 9, level_req: 6, description: '향이 강한 구근', seeds_cost: 90 },
            { id: 'ginger', name: '생강', category: 'spice', rarity: 'epic', growth_time: 200, value: 300, exp_gain: 15, level_req: 10, description: '매운맛의 뿌리', seeds_cost: 150 },
            { id: 'turmeric', name: '강황', category: 'spice', rarity: 'epic', growth_time: 250, value: 400, exp_gain: 20, level_req: 12, description: '노란색 향신료', seeds_cost: 200 },
            { id: 'saffron', name: '사프란', category: 'spice', rarity: 'legendary', growth_time: 400, value: 1000, exp_gain: 50, level_req: 20, description: '가장 비싼 향신료', seeds_cost: 500 },
            
            // === 특수 작물 (Epic) ===
            { id: 'cotton', name: '목화', category: 'fiber', rarity: 'epic', growth_time: 180, value: 250, exp_gain: 12, level_req: 8, description: '옷감의 원료', seeds_cost: 125 },
            { id: 'flax', name: '아마', category: 'fiber', rarity: 'epic', growth_time: 160, value: 220, exp_gain: 11, level_req: 7, description: '리넨의 원료', seeds_cost: 110 },
            { id: 'tobacco', name: '담배', category: 'luxury', rarity: 'epic', growth_time: 200, value: 350, exp_gain: 17, level_req: 12, description: '기호품 작물', seeds_cost: 175 },
            { id: 'coffee', name: '커피', category: 'luxury', rarity: 'epic', growth_time: 300, value: 450, exp_gain: 22, level_req: 15, description: '각성 음료의 원료', seeds_cost: 225 },
            { id: 'cocoa', name: '카카오', category: 'luxury', rarity: 'epic', growth_time: 320, value: 480, exp_gain: 24, level_req: 16, description: '초콜릿의 원료', seeds_cost: 240 },
            { id: 'vanilla', name: '바닐라', category: 'luxury', rarity: 'legendary', growth_time: 500, value: 800, exp_gain: 40, level_req: 25, description: '고급 향료', seeds_cost: 400 },
            
            // === 마법 작물 (Epic ~ Legendary) ===
            { id: 'moonflower', name: '달꽃', category: 'magic', rarity: 'epic', growth_time: 240, value: 600, exp_gain: 30, level_req: 18, description: '달빛 아래서만 피는 꽃', seeds_cost: 300, special_effect: 'mana_restore' },
            { id: 'sunbloom', name: '태양꽃', category: 'magic', rarity: 'epic', growth_time: 220, value: 550, exp_gain: 27, level_req: 16, description: '태양 에너지를 흡수하는 꽃', seeds_cost: 275, special_effect: 'energy_boost' },
            { id: 'starfruit', name: '별열매', category: 'magic', rarity: 'legendary', growth_time: 600, value: 1200, exp_gain: 60, level_req: 30, description: '별의 힘이 깃든 과일', seeds_cost: 600, special_effect: 'luck_permanent' },
            { id: 'dragongrass', name: '용의 풀', category: 'magic', rarity: 'legendary', growth_time: 480, value: 1000, exp_gain: 50, level_req: 25, description: '용의 힘이 깃든 풀', seeds_cost: 500, special_effect: 'strength_permanent' },
            { id: 'phoenix_berry', name: '불사조 열매', category: 'magic', rarity: 'legendary', growth_time: 720, value: 1500, exp_gain: 75, level_req: 35, description: '불사조의 생명력이 깃든 열매', seeds_cost: 750, special_effect: 'health_permanent' },
            { id: 'void_mushroom', name: '공허 버섯', category: 'magic', rarity: 'mythic', growth_time: 1000, value: 3000, exp_gain: 150, level_req: 50, description: '공허의 힘이 깃든 버섯', seeds_cost: 1500, special_effect: 'void_power' },
            
            // === 약용 식물 (Rare ~ Epic) ===
            { id: 'ginseng', name: '인삼', category: 'medicine', rarity: 'epic', growth_time: 400, value: 700, exp_gain: 35, level_req: 20, description: '만병통치약', seeds_cost: 350, healing_power: 100 },
            { id: 'aloe', name: '알로에', category: 'medicine', rarity: 'rare', growth_time: 180, value: 200, exp_gain: 10, level_req: 8, description: '상처 치유 식물', seeds_cost: 100, healing_power: 50 },
            { id: 'echinacea', name: '에키네시아', category: 'medicine', rarity: 'rare', growth_time: 160, value: 180, exp_gain: 9, level_req: 7, description: '면역력 강화 약초', seeds_cost: 90, healing_power: 40 },
            { id: 'chamomile', name: '카모마일', category: 'medicine', rarity: 'rare', growth_time: 120, value: 150, exp_gain: 7, level_req: 5, description: '진정 효과 허브', seeds_cost: 75, healing_power: 30 },
            { id: 'lavender', name: '라벤더', category: 'medicine', rarity: 'rare', growth_time: 140, value: 170, exp_gain: 8, level_req: 6, description: '수면 유도 꽃', seeds_cost: 85, healing_power: 35 },
            
            // === 특수 버섯 (Epic ~ Legendary) ===
            { id: 'shiitake', name: '표고버섯', category: 'mushroom', rarity: 'rare', growth_time: 200, value: 250, exp_gain: 12, level_req: 10, description: '고급 식용 버섯', seeds_cost: 125 },
            { id: 'truffle', name: '트러플', category: 'mushroom', rarity: 'legendary', growth_time: 800, value: 2000, exp_gain: 100, level_req: 40, description: '최고급 식재료 버섯', seeds_cost: 1000 },
            { id: 'glowing_mushroom', name: '발광 버섯', category: 'mushroom', rarity: 'epic', growth_time: 300, value: 500, exp_gain: 25, level_req: 15, description: '어둠 속에서 빛나는 버섯', seeds_cost: 250, special_effect: 'night_vision' },
            { id: 'wisdom_mushroom', name: '지혜 버섯', category: 'mushroom', rarity: 'legendary', growth_time: 600, value: 1200, exp_gain: 60, level_req: 30, description: '지능을 높여주는 버섯', seeds_cost: 600, special_effect: 'intelligence_boost' },
            
            // === 희귀 과일 (Legendary) ===
            { id: 'golden_apple', name: '황금 사과', category: 'fruit', rarity: 'legendary', growth_time: 800, value: 2500, exp_gain: 125, level_req: 45, description: '전설의 황금 사과', seeds_cost: 1250, special_effect: 'immortality_chance' },
            { id: 'crystal_grape', name: '수정 포도', category: 'fruit', rarity: 'legendary', growth_time: 600, value: 1800, exp_gain: 90, level_req: 35, description: '투명한 수정 같은 포도', seeds_cost: 900, special_effect: 'mana_permanent' },
            { id: 'time_fruit', name: '시간 과일', category: 'fruit', rarity: 'mythic', growth_time: 1200, value: 5000, exp_gain: 250, level_req: 60, description: '시간을 조작하는 신비한 과일', seeds_cost: 2500, special_effect: 'time_manipulation' },
            
            // === 장식용 꽃 (Common ~ Epic) ===
            { id: 'rose', name: '장미', category: 'flower', rarity: 'rare', growth_time: 180, value: 200, exp_gain: 10, level_req: 8, description: '사랑의 상징 꽃', seeds_cost: 100 },
            { id: 'tulip', name: '튤립', category: 'flower', rarity: 'rare', growth_time: 160, value: 180, exp_gain: 9, level_req: 7, description: '봄의 전령 꽃', seeds_cost: 90 },
            { id: 'sunflower', name: '해바라기', category: 'flower', rarity: 'common', growth_time: 200, value: 150, exp_gain: 7, level_req: 5, description: '태양을 닮은 큰 꽃', seeds_cost: 75 },
            { id: 'lily', name: '백합', category: 'flower', rarity: 'rare', growth_time: 220, value: 220, exp_gain: 11, level_req: 9, description: '순수함의 상징 꽃', seeds_cost: 110 },
            { id: 'orchid', name: '난초', category: 'flower', rarity: 'epic', growth_time: 400, value: 600, exp_gain: 30, level_req: 20, description: '고귀한 꽃', seeds_cost: 300 },
            { id: 'rainbow_flower', name: '무지개 꽃', category: 'flower', rarity: 'legendary', growth_time: 500, value: 1000, exp_gain: 50, level_req: 25, description: '무지개 색깔의 신비한 꽃', seeds_cost: 500, special_effect: 'happiness_boost' },
            
            // === 견과류 (Rare ~ Epic) ===
            { id: 'walnut', name: '호두', category: 'nut', rarity: 'rare', growth_time: 600, value: 400, exp_gain: 20, level_req: 15, description: '뇌에 좋은 견과', seeds_cost: 200 },
            { id: 'almond', name: '아몬드', category: 'nut', rarity: 'rare', growth_time: 550, value: 380, exp_gain: 19, level_req: 14, description: '고소한 견과', seeds_cost: 190 },
            { id: 'pistachio', name: '피스타치오', category: 'nut', rarity: 'epic', growth_time: 700, value: 600, exp_gain: 30, level_req: 18, description: '초록색 견과', seeds_cost: 300 },
            { id: 'macadamia', name: '마카다미아', category: 'nut', rarity: 'epic', growth_time: 800, value: 800, exp_gain: 40, level_req: 22, description: '최고급 견과', seeds_cost: 400 },
            
            // === 특수 곡물 (Epic ~ Legendary) ===
            { id: 'quinoa', name: '퀴노아', category: 'grain', rarity: 'epic', growth_time: 200, value: 300, exp_gain: 15, level_req: 12, description: '슈퍼푸드 곡물', seeds_cost: 150 },
            { id: 'black_rice', name: '흑미', category: 'grain', rarity: 'epic', growth_time: 250, value: 400, exp_gain: 20, level_req: 15, description: '검은색 건강 쌀', seeds_cost: 200 },
            { id: 'ancient_grain', name: '고대 곡물', category: 'grain', rarity: 'legendary', growth_time: 400, value: 800, exp_gain: 40, level_req: 25, description: '고대 문명의 곡물', seeds_cost: 400, special_effect: 'ancient_power' },
            
            // === 신화 작물 (Mythic) ===
            { id: 'world_tree_fruit', name: '세계수 열매', category: 'mythic', rarity: 'mythic', growth_time: 2000, value: 10000, exp_gain: 500, level_req: 80, description: '세계수에서 자라는 궁극의 열매', seeds_cost: 5000, special_effect: 'world_power' },
            { id: 'divine_herb', name: '신의 약초', category: 'mythic', rarity: 'mythic', growth_time: 1500, value: 8000, exp_gain: 400, level_req: 70, description: '신이 창조한 완벽한 약초', seeds_cost: 4000, special_effect: 'divine_healing' },
            { id: 'chaos_seed', name: '혼돈의 씨앗', category: 'mythic', rarity: 'mythic', growth_time: 1800, value: 12000, exp_gain: 600, level_req: 90, description: '혼돈의 힘이 깃든 위험한 씨앗', seeds_cost: 6000, special_effect: 'chaos_power' }
        ];

        // 농장 토지 등급
        this.farmLands = [
            { id: 'basic_plot', name: '기본 밭', price: 50000, slots: 4, growth_bonus: 0, description: '작은 농사 구역' },
            { id: 'large_plot', name: '큰 밭', price: 200000, slots: 9, growth_bonus: 10, description: '넓은 농사 구역' },
            { id: 'greenhouse', name: '온실', price: 500000, slots: 16, growth_bonus: 25, description: '통제된 환경의 온실' },
            { id: 'magic_garden', name: '마법 정원', price: 2000000, slots: 25, growth_bonus: 50, description: '마법으로 강화된 정원' },
            { id: 'divine_field', name: '신성한 들판', price: 10000000, slots: 36, growth_bonus: 100, description: '신의 축복을 받은 들판' }
        ];

        // 농업 도구
        this.farmingTools = [
            { id: 'basic_hoe', name: '기본 괭이', price: 5000, efficiency: 100, description: '기본적인 농업 도구', shop: true },
            { id: 'iron_hoe', name: '철 괭이', price: 20000, efficiency: 120, description: '철로 만든 튼튼한 괭이', shop: true },
            { id: 'gold_hoe', name: '금 괭이', price: 100000, efficiency: 150, description: '금으로 만든 고급 괭이', shop: true },
            { id: 'magic_hoe', name: '마법 괭이', price: 0, efficiency: 200, description: '마법이 깃든 괭이', craft_only: true },
            { id: 'divine_hoe', name: '신성한 괭이', price: 0, efficiency: 300, description: '신의 힘이 깃든 괭이', legendary_only: true }
        ];
    }

    async initializeFarmingSystem() {
        // 농업 테이블들 생성
        await this.db.query(`
            CREATE TABLE IF NOT EXISTS player_farming (
                player_id TEXT PRIMARY KEY,
                farming_level INTEGER DEFAULT 1,
                farming_exp INTEGER DEFAULT 0,
                current_tool TEXT DEFAULT 'basic_hoe',
                farming_energy INTEGER DEFAULT 100,
                land_type TEXT DEFAULT 'basic_plot',
                total_crops_grown INTEGER DEFAULT 0,
                legendary_crops_grown INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await this.db.query(`
            CREATE TABLE IF NOT EXISTS player_farm_plots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                slot_number INTEGER NOT NULL,
                crop_id TEXT,
                planted_at DATETIME,
                ready_at DATETIME,
                is_ready BOOLEAN DEFAULT 0,
                UNIQUE(player_id, slot_number)
            )
        `);

        await this.db.query(`
            CREATE TABLE IF NOT EXISTS player_farming_tools (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                tool_id TEXT NOT NULL,
                obtained_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(player_id, tool_id)
            )
        `);

        await this.db.query(`
            CREATE TABLE IF NOT EXISTS player_crop_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                crop_id TEXT NOT NULL,
                crop_name TEXT NOT NULL,
                crop_rarity TEXT NOT NULL,
                quantity INTEGER DEFAULT 1,
                harvested_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('농업 시스템이 초기화되었습니다.');
    }

    async getPlayerFarmingData(playerId) {
        let result = await this.db.query(
            'SELECT * FROM player_farming WHERE player_id = ?',
            [playerId]
        );

        if (result.length === 0) {
            await this.db.query(
                'INSERT INTO player_farming (player_id) VALUES (?)',
                [playerId]
            );
            
            // 기본 도구 지급
            await this.db.query(
                'INSERT INTO player_farming_tools (player_id, tool_id) VALUES (?, ?)',
                [playerId, 'basic_hoe']
            );

            // 기본 농장 구역 초기화
            const basicLand = this.farmLands.find(land => land.id === 'basic_plot');
            for (let i = 1; i <= basicLand.slots; i++) {
                await this.db.query(
                    'INSERT INTO player_farm_plots (player_id, slot_number) VALUES (?, ?)',
                    [playerId, i]
                );
            }

            result = await this.db.query(
                'SELECT * FROM player_farming WHERE player_id = ?',
                [playerId]
            );
        }

        return result[0];
    }

    async plantCrop(playerId, slotNumber, cropId) {
        const farmingData = await this.getPlayerFarmingData(playerId);
        const crop = this.crops.find(c => c.id === cropId);
        
        if (!crop) {
            return { success: false, message: '존재하지 않는 작물입니다.' };
        }

        if (farmingData.farming_level < crop.level_req) {
            return { success: false, message: `농업 레벨 ${crop.level_req} 이상이 필요합니다.` };
        }

        // 구역 확인
        const plot = await this.db.query(
            'SELECT * FROM player_farm_plots WHERE player_id = ? AND slot_number = ?',
            [playerId, slotNumber]
        );

        if (plot.length === 0) {
            return { success: false, message: '존재하지 않는 농장 구역입니다.' };
        }

        if (plot[0].crop_id) {
            return { success: false, message: '이미 작물이 심어져 있습니다.' };
        }

        // 성장 시간 계산 (도구와 토지 보너스 적용)
        const tool = this.farmingTools.find(t => t.id === farmingData.current_tool);
        const land = this.farmLands.find(l => l.id === farmingData.land_type);
        
        const efficiency = tool ? tool.efficiency : 100;
        const landBonus = land ? land.growth_bonus : 0;
        
        const baseGrowthTime = crop.growth_time; // 분 단위
        const modifiedGrowthTime = Math.floor(baseGrowthTime * (100 / efficiency) * (100 / (100 + landBonus)));
        
        const plantedAt = new Date();
        const readyAt = new Date(plantedAt.getTime() + modifiedGrowthTime * 60000);

        await this.db.query(`
            UPDATE player_farm_plots 
            SET crop_id = ?, planted_at = ?, ready_at = ?, is_ready = 0 
            WHERE player_id = ? AND slot_number = ?
        `, [cropId, plantedAt.toISOString(), readyAt.toISOString(), playerId, slotNumber]);

        return {
            success: true,
            message: `${crop.name}을(를) 심었습니다!`,
            crop: crop,
            ready_at: readyAt,
            growth_time_minutes: modifiedGrowthTime
        };
    }

    async harvestCrop(playerId, slotNumber) {
        const plot = await this.db.query(
            'SELECT * FROM player_farm_plots WHERE player_id = ? AND slot_number = ?',
            [playerId, slotNumber]
        );

        if (plot.length === 0 || !plot[0].crop_id) {
            return { success: false, message: '심어진 작물이 없습니다.' };
        }

        const readyTime = new Date(plot[0].ready_at);
        const now = new Date();

        if (now < readyTime) {
            const remainingTime = Math.ceil((readyTime - now) / (1000 * 60));
            return { success: false, message: `아직 수확할 수 없습니다. ${remainingTime}분 후에 수확 가능합니다.` };
        }

        const crop = this.crops.find(c => c.id === plot[0].crop_id);
        if (!crop) {
            return { success: false, message: '알 수 없는 작물입니다.' };
        }

        // 수확량 계산 (기본 1개, 확률적으로 추가)
        const baseQuantity = 1;
        const bonusChance = Math.random();
        let totalQuantity = baseQuantity;

        if (bonusChance < 0.3) totalQuantity += 1; // 30% 확률로 1개 추가
        if (bonusChance < 0.1) totalQuantity += 1; // 10% 확률로 1개 더 추가
        if (bonusChance < 0.02) totalQuantity += 2; // 2% 확률로 2개 더 추가

        // 인벤토리에 추가 (기존 시스템 연동 필요)
        // await this.addToInventory(playerId, crop.id, totalQuantity);

        // 농업 통계 업데이트
        await this.updateFarmingStats(playerId, crop, totalQuantity);

        // 구역 초기화
        await this.db.query(`
            UPDATE player_farm_plots 
            SET crop_id = NULL, planted_at = NULL, ready_at = NULL, is_ready = 0 
            WHERE player_id = ? AND slot_number = ?
        `, [playerId, slotNumber]);

        return {
            success: true,
            message: `${crop.name} ${totalQuantity}개를 수확했습니다!`,
            crop: crop,
            quantity: totalQuantity,
            value: crop.value * totalQuantity,
            exp_gained: crop.exp_gain
        };
    }

    async updateFarmingStats(playerId, crop, quantity) {
        const expGain = crop.exp_gain;
        
        // 수확 기록 저장
        await this.db.query(`
            INSERT INTO player_crop_records 
            (player_id, crop_id, crop_name, crop_rarity, quantity) 
            VALUES (?, ?, ?, ?, ?)
        `, [playerId, crop.id, crop.name, crop.rarity, quantity]);

        // 통계 업데이트
        const rarityColumn = crop.rarity === 'legendary' || crop.rarity === 'mythic' ? 'legendary_crops_grown' : null;

        let updateQuery = `
            UPDATE player_farming 
            SET farming_exp = farming_exp + ?, 
                total_crops_grown = total_crops_grown + ?
        `;
        const params = [expGain, quantity];

        if (rarityColumn) {
            updateQuery += `, ${rarityColumn} = ${rarityColumn} + ?`;
            params.push(quantity);
        }

        updateQuery += ' WHERE player_id = ?';
        params.push(playerId);

        await this.db.query(updateQuery, params);

        // 레벨업 체크
        await this.checkLevelUp(playerId);
    }

    async checkLevelUp(playerId) {
        const farmingData = await this.getPlayerFarmingData(playerId);
        const requiredExp = farmingData.farming_level * 150; // 농업은 낚시보다 경험치 더 필요
        
        if (farmingData.farming_exp >= requiredExp) {
            await this.db.query(`
                UPDATE player_farming 
                SET farming_level = farming_level + 1,
                    farming_exp = farming_exp - ?
                WHERE player_id = ?
            `, [requiredExp, playerId]);
            
            return true;
        }
        return false;
    }

    async getFarmStatus(playerId) {
        const plots = await this.db.query(
            'SELECT * FROM player_farm_plots WHERE player_id = ? ORDER BY slot_number',
            [playerId]
        );

        const farmingData = await this.getPlayerFarmingData(playerId);
        const land = this.farmLands.find(l => l.id === farmingData.land_type);

        const farmStatus = plots.map(plot => {
            if (!plot.crop_id) {
                return { slot: plot.slot_number, status: 'empty' };
            }

            const crop = this.crops.find(c => c.id === plot.crop_id);
            const readyTime = new Date(plot.ready_at);
            const now = new Date();
            const isReady = now >= readyTime;
            
            if (isReady) {
                return {
                    slot: plot.slot_number,
                    status: 'ready',
                    crop: crop,
                    planted_at: plot.planted_at
                };
            } else {
                const remainingTime = Math.ceil((readyTime - now) / (1000 * 60));
                return {
                    slot: plot.slot_number,
                    status: 'growing',
                    crop: crop,
                    remaining_minutes: remainingTime,
                    planted_at: plot.planted_at
                };
            }
        });

        return {
            farming_data: farmingData,
            land_info: land,
            plots: farmStatus
        };
    }

    async buySeed(playerId, cropId, quantity = 1) {
        const crop = this.crops.find(c => c.id === cropId);
        
        if (!crop) {
            return { success: false, message: '존재하지 않는 작물입니다.' };
        }

        const totalCost = crop.seeds_cost * quantity;

        // 돈 체크 및 차감은 다른 시스템에서 처리
        return { 
            success: true, 
            message: `${crop.name} 씨앗 ${quantity}개를 구매했습니다!`,
            cost: totalCost,
            crop: crop
        };
    }

    getCropsByCategory(category) {
        return this.crops.filter(crop => crop.category === category);
    }

    getCropsByRarity(rarity) {
        return this.crops.filter(crop => crop.rarity === rarity);
    }
}

module.exports = FarmingSystem;




