const { EmbedBuilder } = require('discord.js');

class FishingSystem {
    constructor(database) {
        this.db = database;
        
        // === 낚시대 등급 시스템 ===
        this.fishingRods = [
            // 기본 낚시대 (상점 구매)
            { id: 'basic_rod', name: '기본 낚시대', rarity: 'common', price: 10000, success_rate: 60, rare_chance: 5, epic_chance: 1, description: '초보자용 기본 낚시대', source: 'shop' },
            { id: 'bamboo_rod', name: '대나무 낚시대', rarity: 'common', price: 25000, success_rate: 70, rare_chance: 8, epic_chance: 2, description: '가벼운 대나무 낚시대', source: 'shop' },
            { id: 'steel_rod', name: '강철 낚시대', rarity: 'common', price: 50000, success_rate: 75, rare_chance: 12, epic_chance: 3, description: '튼튼한 강철 낚시대', source: 'shop' },
            
            // 희귀 낚시대 (제작/던전)
            { id: 'carbon_rod', name: '카본 낚시대', rarity: 'rare', price: 0, success_rate: 80, rare_chance: 18, epic_chance: 5, description: '가볍고 강한 카본 낚시대', source: 'crafting', materials: ['carbon_fiber:5', 'steel_wire:3'] },
            { id: 'magic_rod', name: '마법 낚시대', rarity: 'rare', price: 0, success_rate: 85, rare_chance: 20, epic_chance: 8, description: '마법이 깃든 낚시대', source: 'dungeon', dungeon_name: '바다의 신전' },
            { id: 'silver_rod', name: '은 낚시대', rarity: 'rare', price: 0, success_rate: 82, rare_chance: 22, epic_chance: 6, description: '순은으로 만든 고급 낚시대', source: 'crafting', materials: ['silver_ingot:8', 'magic_thread:4'] },
            
            // 영웅 낚시대
            { id: 'crystal_rod', name: '수정 낚시대', rarity: 'epic', price: 0, success_rate: 90, rare_chance: 25, epic_chance: 12, legendary_chance: 2, description: '투명한 수정으로 만든 낚시대', source: 'boss', boss_name: '바다의 여왕' },
            { id: 'golden_rod', name: '황금 낚시대', rarity: 'epic', price: 0, success_rate: 88, rare_chance: 28, epic_chance: 15, legendary_chance: 3, description: '순금으로 제작된 고급 낚시대', source: 'crafting', materials: ['gold_ingot:10', 'rare_gem:3', 'blessed_thread:2'] },
            { id: 'dragonbone_rod', name: '용골 낚시대', rarity: 'epic', price: 0, success_rate: 92, rare_chance: 30, epic_chance: 18, legendary_chance: 4, description: '고대 용의 뼈로 만든 낚시대', source: 'dragon_kill', dragon_name: '바다 용왕' },
            
            // 전설 낚시대
            { id: 'poseidon_rod', name: '포세이돈의 삼지창', rarity: 'legendary', price: 0, success_rate: 95, rare_chance: 35, epic_chance: 25, legendary_chance: 8, description: '바다의 신 포세이돈의 낚시대', source: 'raid', raid_name: '해저 궁전' },
            { id: 'time_rod', name: '시간의 낚시대', rarity: 'legendary', price: 0, success_rate: 94, rare_chance: 40, epic_chance: 20, legendary_chance: 10, description: '시간을 조작하는 신비한 낚시대', source: 'temporal_fishing', location: '시간의 호수' },
            { id: 'void_rod', name: '공허의 낚시대', rarity: 'legendary', price: 0, success_rate: 96, rare_chance: 45, epic_chance: 30, legendary_chance: 12, description: '공허에서 온 금기의 낚시대', source: 'void_realm', special_requirement: 'sanity_cost:30' },
            
            // 신화 낚시대
            { id: 'cosmic_rod', name: '우주의 낚시대', rarity: 'mythic', price: 0, success_rate: 98, rare_chance: 50, epic_chance: 40, legendary_chance: 20, mythic_chance: 5, description: '우주의 모든 것을 낚을 수 있는 궁극의 낚시대', source: 'cosmic_event', event_name: '우주의 조화' },
            { id: 'creation_rod', name: '창조의 낚시대', rarity: 'mythic', price: 0, success_rate: 99, rare_chance: 60, epic_chance: 50, legendary_chance: 30, mythic_chance: 10, description: '창조신이 만든 절대적 낚시대', source: 'god_craft', god_name: '창조신' }
        ];

        // === 낚시 아이템 (70개+) ===
        this.fishingItems = [
            // === 일반 물고기 (Common) ===
            { id: 'carp', name: '잉어', category: 'fish', rarity: 'common', value: 500, description: '흔한 민물고기', cooking_bonus: 5 },
            { id: 'bass', name: '농어', category: 'fish', rarity: 'common', value: 600, description: '기본적인 바다 물고기', cooking_bonus: 6 },
            { id: 'trout', name: '송어', category: 'fish', rarity: 'common', value: 700, description: '깨끗한 물에 사는 물고기', cooking_bonus: 7 },
            { id: 'mackerel', name: '고등어', category: 'fish', rarity: 'common', value: 650, description: '영양가 높은 바다 물고기', cooking_bonus: 6 },
            { id: 'sardine', name: '정어리', category: 'fish', rarity: 'common', value: 400, description: '작지만 맛있는 물고기', cooking_bonus: 4 },
            { id: 'anchovy', name: '멸치', category: 'fish', rarity: 'common', value: 300, description: '작은 바다 물고기', cooking_bonus: 3 },
            { id: 'catfish', name: '메기', category: 'fish', rarity: 'common', value: 550, description: '수염이 긴 민물고기', cooking_bonus: 5 },
            { id: 'perch', name: '농어(민물)', category: 'fish', rarity: 'common', value: 580, description: '민물의 작은 육식어', cooking_bonus: 6 },
            { id: 'cod', name: '대구', category: 'fish', rarity: 'common', value: 750, description: '차가운 바다의 흰살 생선', cooking_bonus: 8 },
            { id: 'herring', name: '청어', category: 'fish', rarity: 'common', value: 520, description: '북쪽 바다의 은빛 물고기', cooking_bonus: 5 },
            
            // === 희귀 물고기 (Rare) ===
            { id: 'salmon', name: '연어', category: 'fish', rarity: 'rare', value: 1500, description: '강으로 돌아오는 회귀 물고기', cooking_bonus: 15, special_effect: 'stamina_boost' },
            { id: 'tuna', name: '참치', category: 'fish', rarity: 'rare', value: 2000, description: '거대한 바다의 왕자', cooking_bonus: 20, special_effect: 'strength_boost' },
            { id: 'shark', name: '상어', category: 'fish', rarity: 'rare', value: 3000, description: '바다의 무서운 포식자', cooking_bonus: 25, special_effect: 'attack_boost' },
            { id: 'swordfish', name: '황새치', category: 'fish', rarity: 'rare', value: 2500, description: '검처럼 긴 주둥이의 물고기', cooking_bonus: 22, special_effect: 'agility_boost' },
            { id: 'eel', name: '장어', category: 'fish', rarity: 'rare', value: 1800, description: '기다란 뱀 같은 물고기', cooking_bonus: 18, special_effect: 'health_regen' },
            { id: 'ray', name: '가오리', category: 'fish', rarity: 'rare', value: 1600, description: '납작한 바다 물고기', cooking_bonus: 16, special_effect: 'mana_regen' },
            { id: 'octopus', name: '문어', category: 'fish', rarity: 'rare', value: 1700, description: '8개 다리의 영리한 바다 생물', cooking_bonus: 17, special_effect: 'intelligence_boost' },
            { id: 'squid', name: '오징어', category: 'fish', rarity: 'rare', value: 1400, description: '투명한 몸의 바다 생물', cooking_bonus: 14, special_effect: 'stealth_boost' },
            { id: 'crab', name: '게', category: 'fish', rarity: 'rare', value: 1300, description: '단단한 껍질의 바다 생물', cooking_bonus: 13, special_effect: 'defense_boost' },
            { id: 'lobster', name: '바닷가재', category: 'fish', rarity: 'rare', value: 1900, description: '고급 바다 갑각류', cooking_bonus: 19, special_effect: 'luck_boost' },
            
            // === 영웅 물고기 (Epic) ===
            { id: 'golden_fish', name: '황금 물고기', category: 'fish', rarity: 'epic', value: 5000, description: '금빛으로 빛나는 신비한 물고기', cooking_bonus: 50, special_effect: 'all_stats_boost' },
            { id: 'crystal_fish', name: '수정 물고기', category: 'fish', rarity: 'epic', value: 4500, description: '투명한 수정 같은 물고기', cooking_bonus: 45, special_effect: 'mana_recovery' },
            { id: 'rainbow_fish', name: '무지개 물고기', category: 'fish', rarity: 'epic', value: 4000, description: '무지개 빛깔의 아름다운 물고기', cooking_bonus: 40, special_effect: 'happiness_boost' },
            { id: 'flame_fish', name: '화염 물고기', category: 'fish', rarity: 'epic', value: 3800, description: '불타오르는 물고기', cooking_bonus: 38, special_effect: 'fire_resistance' },
            { id: 'ice_fish', name: '얼음 물고기', category: 'fish', rarity: 'epic', value: 3800, description: '얼음처럼 차가운 물고기', cooking_bonus: 38, special_effect: 'ice_resistance' },
            { id: 'thunder_fish', name: '번개 물고기', category: 'fish', rarity: 'epic', value: 4200, description: '전기를 내뿜는 물고기', cooking_bonus: 42, special_effect: 'lightning_resistance' },
            { id: 'shadow_fish', name: '그림자 물고기', category: 'fish', rarity: 'epic', value: 3600, description: '어둠 속에서만 보이는 물고기', cooking_bonus: 36, special_effect: 'stealth_master' },
            { id: 'spirit_fish', name: '영혼 물고기', category: 'fish', rarity: 'epic', value: 5500, description: '영혼이 깃든 신비한 물고기', cooking_bonus: 55, special_effect: 'soul_power' },
            
            // === 전설 물고기 (Legendary) ===
            { id: 'dragon_fish', name: '용 물고기', category: 'fish', rarity: 'legendary', value: 15000, description: '용의 피가 흐르는 전설의 물고기', cooking_bonus: 100, special_effect: 'dragon_power' },
            { id: 'phoenix_fish', name: '불사조 물고기', category: 'fish', rarity: 'legendary', value: 18000, description: '불사조의 영혼이 깃든 물고기', cooking_bonus: 120, special_effect: 'rebirth_chance' },
            { id: 'kraken_tentacle', name: '크라켄 촉수', category: 'fish', rarity: 'legendary', value: 20000, description: '바다의 괴물 크라켄의 촉수', cooking_bonus: 150, special_effect: 'ocean_dominance' },
            { id: 'leviathan_scale', name: '리바이어던 비늘', category: 'fish', rarity: 'legendary', value: 22000, description: '바다의 지배자 리바이어던의 비늘', cooking_bonus: 180, special_effect: 'water_mastery' },
            
            // === 신화 물고기 (Mythic) ===
            { id: 'cosmic_fish', name: '우주 물고기', category: 'fish', rarity: 'mythic', value: 50000, description: '우주에서 온 신비한 생명체', cooking_bonus: 500, special_effect: 'cosmic_power' },
            { id: 'god_fish', name: '신의 물고기', category: 'fish', rarity: 'mythic', value: 100000, description: '신이 창조한 완벽한 물고기', cooking_bonus: 1000, special_effect: 'divine_blessing' },
            
            // === 특별 아이템 (낚시로 획득) ===
            // 보석류
            { id: 'pearl', name: '진주', category: 'gem', rarity: 'rare', value: 3000, description: '바다에서 건진 아름다운 진주', use: 'crafting_material' },
            { id: 'black_pearl', name: '흑진주', category: 'gem', rarity: 'epic', value: 8000, description: '희귀한 검은 진주', use: 'crafting_material' },
            { id: 'sea_sapphire', name: '바다 사파이어', category: 'gem', rarity: 'epic', value: 12000, description: '바다 깊숙이에서 나온 푸른 보석', use: 'crafting_material' },
            { id: 'ocean_diamond', name: '해양 다이아몬드', category: 'gem', rarity: 'legendary', value: 30000, description: '바다의 압력으로 생성된 다이아몬드', use: 'crafting_material' },
            
            // 마법 재료
            { id: 'mermaid_tear', name: '인어의 눈물', category: 'magic_material', rarity: 'epic', value: 15000, description: '슬픈 인어의 눈물이 굳어진 것', use: 'potion_ingredient' },
            { id: 'sea_crystal', name: '바다 수정', category: 'magic_material', rarity: 'rare', value: 5000, description: '바다의 마력이 응축된 수정', use: 'magic_enhancement' },
            { id: 'neptune_essence', name: '넵튠의 정수', category: 'magic_material', rarity: 'legendary', value: 25000, description: '바다의 신 넵튠의 힘이 담긴 정수', use: 'divine_crafting' },
            { id: 'tide_stone', name: '조석석', category: 'magic_material', rarity: 'epic', value: 10000, description: '조수의 힘이 깃든 신비한 돌', use: 'water_magic' },
            
            // 고대 유물
            { id: 'ancient_coin', name: '고대 금화', category: 'treasure', rarity: 'rare', value: 4000, description: '바다에 가라앉은 고대 문명의 금화', use: 'collection' },
            { id: 'pirate_treasure', name: '해적의 보물', category: 'treasure', rarity: 'epic', value: 15000, description: '해적이 숨겨둔 보물 상자', use: 'money_source' },
            { id: 'sunken_crown', name: '침몰한 왕관', category: 'treasure', rarity: 'legendary', value: 40000, description: '바다에 가라앉은 왕국의 왕관', use: 'legendary_artifact' },
            { id: 'atlantis_fragment', name: '아틀란티스 파편', category: 'treasure', rarity: 'mythic', value: 80000, description: '전설의 잃어버린 대륙 아틀란티스의 파편', use: 'ultimate_crafting' },
            
            // 무기/장비 재료
            { id: 'shark_tooth', name: '상어 이빨', category: 'weapon_material', rarity: 'rare', value: 2000, description: '날카로운 상어의 이빨', use: 'weapon_crafting' },
            { id: 'whale_bone', name: '고래 뼈', category: 'weapon_material', rarity: 'epic', value: 6000, description: '거대한 고래의 뼈', use: 'armor_crafting' },
            { id: 'kraken_ink', name: '크라켄 먹물', category: 'weapon_material', rarity: 'legendary', value: 20000, description: '크라켄이 뿜어낸 검은 먹물', use: 'enchantment' },
            { id: 'dragon_scale', name: '바다 용 비늘', category: 'weapon_material', rarity: 'legendary', value: 25000, description: '바다 용의 강력한 비늘', use: 'legendary_equipment' },
            
            // 소비 아이템
            { id: 'sea_herb', name: '바다 약초', category: 'consumable', rarity: 'common', value: 800, description: '바다에서 자라는 치유 약초', use: 'healing', effect: 'restore_hp:50' },
            { id: 'kelp_wrap', name: '다시마 포장', category: 'consumable', rarity: 'rare', value: 2000, description: '영양이 풍부한 다시마', use: 'stat_boost', effect: 'health_boost:10' },
            { id: 'coral_powder', name: '산호 가루', category: 'consumable', rarity: 'epic', value: 5000, description: '갈아 만든 산호 가루', use: 'mana_potion', effect: 'restore_mp:100' },
            { id: 'ambergris', name: '용연향', category: 'consumable', rarity: 'legendary', value: 15000, description: '고래에서 나온 귀한 향료', use: 'luck_potion', effect: 'luck_boost:50' },
            
            // 특수 아이템
            { id: 'message_bottle', name: '표류 병', category: 'special', rarity: 'rare', value: 3000, description: '바다를 떠돌던 메시지가 든 병', use: 'quest_item' },
            { id: 'time_capsule', name: '타임캡슐', category: 'special', rarity: 'epic', value: 10000, description: '과거에서 온 신비한 캡슐', use: 'time_related' },
            { id: 'wishing_shell', name: '소원 조개', category: 'special', rarity: 'legendary', value: 20000, description: '소원을 들어준다는 전설의 조개', use: 'wish_granting' },
            { id: 'void_fragment', name: '공허 파편', category: 'special', rarity: 'mythic', value: 50000, description: '다른 차원에서 온 공허의 파편', use: 'dimensional_crafting' },
            
            // 장식품/컬렉션
            { id: 'starfish', name: '불가사리', category: 'decoration', rarity: 'common', value: 500, description: '바다의 별 모양 생물', use: 'decoration' },
            { id: 'sea_anemone', name: '말미잘', category: 'decoration', rarity: 'common', value: 600, description: '꽃 같은 바다 생물', use: 'decoration' },
            { id: 'conch_shell', name: '소라껍데기', category: 'decoration', rarity: 'rare', value: 1500, description: '아름다운 나선형 껍데기', use: 'decoration' },
            { id: 'mermaid_comb', name: '인어의 빗', category: 'decoration', rarity: 'epic', value: 8000, description: '인어가 사용했던 아름다운 빗', use: 'collection' },
            
            // 음식 재료
            { id: 'seaweed', name: '미역', category: 'food_ingredient', rarity: 'common', value: 300, description: '건강한 바다 채소', use: 'cooking' },
            { id: 'sea_salt', name: '바다 소금', category: 'food_ingredient', rarity: 'common', value: 200, description: '바다에서 얻은 순수한 소금', use: 'cooking' },
            { id: 'fish_oil', name: '어유', category: 'food_ingredient', rarity: 'rare', value: 1000, description: '생선에서 추출한 영양 오일', use: 'cooking' },
            { id: 'caviar', name: '캐비어', category: 'food_ingredient', rarity: 'epic', value: 12000, description: '고급 어란', use: 'luxury_cooking' }
        ];

        // 낚시 장소별 아이템 확률
        this.fishingLocations = [
            {
                name: '마을 연못',
                level_req: 1,
                energy_cost: 5,
                common_items: ['carp', 'trout', 'catfish', 'seaweed'],
                rare_items: ['salmon', 'eel'],
                special_chance: 2
            },
            {
                name: '강',
                level_req: 5,
                energy_cost: 8,
                common_items: ['bass', 'perch', 'trout'],
                rare_items: ['salmon', 'eel', 'pearl'],
                epic_items: ['golden_fish'],
                special_chance: 5
            },
            {
                name: '바다',
                level_req: 10,
                energy_cost: 12,
                common_items: ['mackerel', 'sardine', 'cod', 'herring'],
                rare_items: ['tuna', 'shark', 'octopus', 'crab'],
                epic_items: ['crystal_fish', 'flame_fish'],
                special_chance: 8
            },
            {
                name: '깊은 바다',
                level_req: 20,
                energy_cost: 18,
                rare_items: ['swordfish', 'ray', 'lobster'],
                epic_items: ['rainbow_fish', 'ice_fish', 'thunder_fish'],
                legendary_items: ['dragon_fish', 'kraken_tentacle'],
                special_chance: 15
            },
            {
                name: '신비한 호수',
                level_req: 30,
                energy_cost: 25,
                epic_items: ['spirit_fish', 'shadow_fish'],
                legendary_items: ['phoenix_fish', 'leviathan_scale'],
                mythic_items: ['cosmic_fish'],
                special_chance: 25
            },
            {
                name: '차원의 바다',
                level_req: 50,
                energy_cost: 40,
                legendary_items: ['neptune_essence', 'sunken_crown'],
                mythic_items: ['god_fish', 'atlantis_fragment', 'void_fragment'],
                special_chance: 35
            }
        ];
    }

    async initializeFishingSystem() {
        // 낚시 테이블들 생성
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS player_fishing (
                player_id TEXT PRIMARY KEY,
                fishing_level INTEGER DEFAULT 1,
                fishing_exp INTEGER DEFAULT 0,
                current_rod TEXT DEFAULT 'basic_rod',
                fishing_energy INTEGER DEFAULT 100,
                total_fish_caught INTEGER DEFAULT 0,
                rare_fish_caught INTEGER DEFAULT 0,
                legendary_fish_caught INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await this.db.run(`
            CREATE TABLE IF NOT EXISTS player_fishing_rods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                rod_id TEXT NOT NULL,
                obtained_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(player_id, rod_id)
            )
        `);

        await this.db.run(`
            CREATE TABLE IF NOT EXISTS player_fishing_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                item_id TEXT NOT NULL,
                item_name TEXT NOT NULL,
                item_rarity TEXT NOT NULL,
                location TEXT NOT NULL,
                rod_used TEXT NOT NULL,
                caught_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('낚시 시스템이 초기화되었습니다.');
    }

    async getPlayerFishingData(playerId) {
        let result = await this.db.run(
            'SELECT * FROM player_fishing WHERE player_id = ?',
            [playerId]
        );

        if (result.length === 0) {
            await this.db.run(
                'INSERT INTO player_fishing (player_id) VALUES (?)',
                [playerId]
            );
            
            // 기본 낚시대 지급
            await this.db.run(
                'INSERT INTO player_fishing_rods (player_id, rod_id) VALUES (?, ?)',
                [playerId, 'basic_rod']
            );

            result = await this.db.run(
                'SELECT * FROM player_fishing WHERE player_id = ?',
                [playerId]
            );
        }

        return result[0];
    }

    async fish(playerId, location) {
        const fishingData = await this.getPlayerFishingData(playerId);
        const locationData = this.fishingLocations.find(loc => loc.name === location);
        
        if (!locationData) {
            return { success: false, message: '존재하지 않는 낚시터입니다.' };
        }

        if (fishingData.fishing_level < locationData.level_req) {
            return { success: false, message: `낚시 레벨 ${locationData.level_req} 이상이 필요합니다.` };
        }

        if (fishingData.fishing_energy < locationData.energy_cost) {
            return { success: false, message: '낚시 에너지가 부족합니다.' };
        }

        // 현재 낚시대 정보 가져오기
        const rod = this.fishingRods.find(r => r.id === fishingData.current_rod);
        const success_chance = rod.success_rate;

        // 낚시 성공 여부 판정
        if (Math.random() * 100 > success_chance) {
            await this.db.run(
                'UPDATE player_fishing SET fishing_energy = fishing_energy - ? WHERE player_id = ?',
                [locationData.energy_cost, playerId]
            );
            return { success: true, message: '아무것도 잡히지 않았습니다...', caught: null };
        }

        // 아이템 등급 결정 (낚시대에 따라 확률 조정)
        let itemRarity = this.determineItemRarity(rod, locationData);
        let possibleItems = this.getPossibleItems(locationData, itemRarity);
        
        if (possibleItems.length === 0) {
            itemRarity = 'common';
            possibleItems = this.getPossibleItems(locationData, itemRarity);
        }

        const caughtItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
        const itemData = this.fishingItems.find(item => item.id === caughtItem);

        // 인벤토리에 추가 (기존 시스템 연동 필요)
        // await this.addToInventory(playerId, caughtItem, 1);

        // 낚시 기록 업데이트
        await this.updateFishingStats(playerId, itemData, location, rod.id);

        return {
            success: true,
            message: `${itemData.name}을(를) 잡았습니다!`,
            caught: itemData,
            rarity: itemData.rarity,
            value: itemData.value
        };
    }

    determineItemRarity(rod, location) {
        const random = Math.random() * 100;
        
        if (rod.mythic_chance && random < rod.mythic_chance && location.mythic_items) {
            return 'mythic';
        } else if (rod.legendary_chance && random < rod.legendary_chance && location.legendary_items) {
            return 'legendary';
        } else if (rod.epic_chance && random < rod.epic_chance && location.epic_items) {
            return 'epic';
        } else if (rod.rare_chance && random < rod.rare_chance && location.rare_items) {
            return 'rare';
        } else {
            return 'common';
        }
    }

    getPossibleItems(location, rarity) {
        switch (rarity) {
            case 'mythic': return location.mythic_items || [];
            case 'legendary': return location.legendary_items || [];
            case 'epic': return location.epic_items || [];
            case 'rare': return location.rare_items || [];
            case 'common': return location.common_items || [];
            default: return location.common_items || [];
        }
    }

    async updateFishingStats(playerId, itemData, location, rodUsed) {
        // 경험치 계산
        const expGain = this.calculateExpGain(itemData.rarity);
        
        // 낚시 기록 저장
        await this.db.run(`
            INSERT INTO player_fishing_records 
            (player_id, item_id, item_name, item_rarity, location, rod_used) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [playerId, itemData.id, itemData.name, itemData.rarity, location, rodUsed]);

        // 통계 업데이트
        const rarityColumn = itemData.rarity === 'rare' ? 'rare_fish_caught' : 
                           itemData.rarity === 'legendary' ? 'legendary_fish_caught' : null;

        let updateQuery = `
            UPDATE player_fishing 
            SET fishing_exp = fishing_exp + ?, 
                total_fish_caught = total_fish_caught + 1,
                fishing_energy = fishing_energy - ?
        `;
        const params = [expGain, 10]; // 기본 에너지 소모

        if (rarityColumn) {
            updateQuery += `, ${rarityColumn} = ${rarityColumn} + 1`;
        }

        updateQuery += ' WHERE player_id = ?';
        params.push(playerId);

        await this.db.run(updateQuery, params);

        // 레벨업 체크
        await this.checkLevelUp(playerId);
    }

    calculateExpGain(rarity) {
        const expTable = {
            'common': 10,
            'rare': 25,
            'epic': 50,
            'legendary': 100,
            'mythic': 200
        };
        return expTable[rarity] || 10;
    }

    async checkLevelUp(playerId) {
        const fishingData = await this.getPlayerFishingData(playerId);
        const requiredExp = fishingData.fishing_level * 100;
        
        if (fishingData.fishing_exp >= requiredExp) {
            await this.db.run(`
                UPDATE player_fishing 
                SET fishing_level = fishing_level + 1,
                    fishing_exp = fishing_exp - ?
                WHERE player_id = ?
            `, [requiredExp, playerId]);
            
            return true;
        }
        return false;
    }

    async getShopRods() {
        return this.fishingRods.filter(rod => rod.source === 'shop');
    }

    async buyRod(playerId, rodId, playerMoney) {
        const rod = this.fishingRods.find(r => r.id === rodId);
        
        if (!rod || rod.source !== 'shop') {
            return { success: false, message: '구매할 수 없는 낚시대입니다.' };
        }

        if (playerMoney < rod.price) {
            return { success: false, message: '돈이 부족합니다.' };
        }

        // 이미 보유 중인지 확인
        const existing = await this.db.run(
            'SELECT * FROM player_fishing_rods WHERE player_id = ? AND rod_id = ?',
            [playerId, rodId]
        );

        if (existing.length > 0) {
            return { success: false, message: '이미 보유 중인 낚시대입니다.' };
        }

        await this.db.run(
            'INSERT INTO player_fishing_rods (player_id, rod_id) VALUES (?, ?)',
            [playerId, rodId]
        );

        return { 
            success: true, 
            message: `${rod.name}을(를) 구매했습니다!`,
            cost: rod.price
        };
    }
}

module.exports = FishingSystem;




