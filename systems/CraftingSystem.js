const { EmbedBuilder } = require('discord.js');

class CraftingSystem {
    constructor(database) {
        this.db = database;
        
        this.craftingRecipes = [
            // 기본 제작법
            {
                id: 'wooden_sword',
                name: '나무 검',
                category: 'weapon',
                level_req: 1,
                crafting_skill: 'blacksmithing',
                skill_level_req: 1,
                materials: JSON.stringify([
                    { item: 'wood', quantity: 5 },
                    { item: 'rope', quantity: 2 }
                ]),
                result_item: 'wooden_sword',
                result_quantity: 1,
                success_rate: 90,
                exp_gain: 10,
                description: '기본적인 나무 검을 제작합니다'
            },
            {
                id: 'healing_potion',
                name: '치유 물약',
                category: 'consumable',
                level_req: 1,
                crafting_skill: 'alchemy',
                skill_level_req: 1,
                materials: JSON.stringify([
                    { item: 'herb', quantity: 3 },
                    { item: 'water', quantity: 1 },
                    { item: 'bottle', quantity: 1 }
                ]),
                result_item: 'healing_potion',
                result_quantity: 1,
                success_rate: 85,
                exp_gain: 15,
                description: '체력을 회복하는 물약을 제작합니다'
            },
            {
                id: 'leather_armor',
                name: '가죽 갑옷',
                category: 'armor',
                level_req: 3,
                crafting_skill: 'leatherworking',
                skill_level_req: 2,
                materials: JSON.stringify([
                    { item: 'leather', quantity: 8 },
                    { item: 'thread', quantity: 5 }
                ]),
                result_item: 'leather_armor',
                result_quantity: 1,
                success_rate: 80,
                exp_gain: 25,
                description: '기본적인 가죽 갑옷을 제작합니다'
            },

            // 중급 제작법
            {
                id: 'iron_sword',
                name: '철 검',
                category: 'weapon',
                level_req: 10,
                crafting_skill: 'blacksmithing',
                skill_level_req: 5,
                materials: JSON.stringify([
                    { item: 'iron_ore', quantity: 4 },
                    { item: 'coal', quantity: 2 },
                    { item: 'wood', quantity: 3 }
                ]),
                result_item: 'iron_sword',
                result_quantity: 1,
                success_rate: 75,
                exp_gain: 50,
                description: '견고한 철 검을 제작합니다'
            },
            {
                id: 'mana_potion',
                name: '마나 물약',
                category: 'consumable',
                level_req: 8,
                crafting_skill: 'alchemy',
                skill_level_req: 4,
                materials: JSON.stringify([
                    { item: 'magic_crystal', quantity: 1 },
                    { item: 'pure_water', quantity: 1 },
                    { item: 'bottle', quantity: 1 }
                ]),
                result_item: 'mana_potion',
                result_quantity: 1,
                success_rate: 70,
                exp_gain: 40,
                description: '마나를 회복하는 물약을 제작합니다'
            },
            {
                id: 'magic_scroll',
                name: '마법 두루마리',
                category: 'consumable',
                level_req: 12,
                crafting_skill: 'enchanting',
                skill_level_req: 3,
                materials: JSON.stringify([
                    { item: 'parchment', quantity: 1 },
                    { item: 'magic_ink', quantity: 2 },
                    { item: 'feather', quantity: 1 }
                ]),
                result_item: 'magic_scroll',
                result_quantity: 1,
                success_rate: 65,
                exp_gain: 60,
                description: '마법이 담긴 두루마리를 제작합니다'
            },

            // 고급 제작법
            {
                id: 'steel_armor',
                name: '강철 갑옷',
                category: 'armor',
                level_req: 20,
                crafting_skill: 'blacksmithing',
                skill_level_req: 10,
                materials: JSON.stringify([
                    { item: 'steel_ingot', quantity: 12 },
                    { item: 'leather', quantity: 6 },
                    { item: 'gold_ore', quantity: 2 }
                ]),
                result_item: 'steel_armor',
                result_quantity: 1,
                success_rate: 60,
                exp_gain: 120,
                description: '강력한 강철 갑옷을 제작합니다'
            },
            {
                id: 'elixir_of_strength',
                name: '힘의 엘릭서',
                category: 'consumable',
                level_req: 25,
                crafting_skill: 'alchemy',
                skill_level_req: 12,
                materials: JSON.stringify([
                    { item: 'dragon_blood', quantity: 1 },
                    { item: 'rare_herb', quantity: 5 },
                    { item: 'crystal_bottle', quantity: 1 }
                ]),
                result_item: 'elixir_of_strength',
                result_quantity: 1,
                success_rate: 45,
                exp_gain: 200,
                description: '힘을 크게 증가시키는 엘릭서를 제작합니다'
            },
            {
                id: 'enchanted_ring',
                name: '마법 반지',
                category: 'accessory',
                level_req: 30,
                crafting_skill: 'enchanting',
                skill_level_req: 15,
                materials: JSON.stringify([
                    { item: 'gold_ring', quantity: 1 },
                    { item: 'magic_crystal', quantity: 3 },
                    { item: 'enchant_dust', quantity: 5 }
                ]),
                result_item: 'enchanted_ring',
                result_quantity: 1,
                success_rate: 40,
                exp_gain: 300,
                description: '마법이 깃든 반지를 제작합니다'
            },

            // 전설급 제작법
            {
                id: 'dragon_sword',
                name: '용의 검',
                category: 'weapon',
                level_req: 45,
                crafting_skill: 'blacksmithing',
                skill_level_req: 25,
                materials: JSON.stringify([
                    { item: 'dragon_scale', quantity: 3 },
                    { item: 'mithril_ore', quantity: 5 },
                    { item: 'fire_crystal', quantity: 2 },
                    { item: 'master_smith_hammer', quantity: 1 }
                ]),
                result_item: 'dragon_sword',
                result_quantity: 1,
                success_rate: 25,
                exp_gain: 500,
                description: '용의 힘이 깃든 전설의 검을 제작합니다'
            },
            {
                id: 'philosophers_stone',
                name: '현자의 돌',
                category: 'special',
                level_req: 50,
                crafting_skill: 'alchemy',
                skill_level_req: 30,
                materials: JSON.stringify([
                    { item: 'pure_gold', quantity: 10 },
                    { item: 'philosophers_powder', quantity: 1 },
                    { item: 'time_crystal', quantity: 1 },
                    { item: 'life_essence', quantity: 1 }
                ]),
                result_item: 'philosophers_stone',
                result_quantity: 1,
                success_rate: 15,
                exp_gain: 1000,
                description: '모든 것을 금으로 바꿀 수 있는 현자의 돌을 제작합니다'
            }
        ];

        this.craftingSkills = [
            { id: 'blacksmithing', name: '대장장이', description: '무기와 갑옷을 제작하는 기술' },
            { id: 'alchemy', name: '연금술', description: '물약과 엘릭서를 제작하는 기술' },
            { id: 'leatherworking', name: '가죽 세공', description: '가죽 제품을 제작하는 기술' },
            { id: 'enchanting', name: '마법 부여', description: '마법 아이템을 제작하는 기술' },
            { id: 'tailoring', name: '재봉술', description: '의복과 로브를 제작하는 기술' },
            { id: 'jewelcrafting', name: '보석 세공', description: '보석과 장신구를 제작하는 기술' },
            { id: 'cooking', name: '요리', description: '음식과 특수 요리를 제작하는 기술' },
            { id: 'engineering', name: '공학', description: '기계와 도구를 제작하는 기술' }
        ];

        this.craftingMaterials = [
            // 기본 재료
            { id: 'wood', name: '나무', category: 'basic', description: '기본적인 나무 재료' },
            { id: 'rope', name: '밧줄', category: 'basic', description: '튼튼한 밧줄' },
            { id: 'leather', name: '가죽', category: 'basic', description: '동물의 가죽' },
            { id: 'thread', name: '실', category: 'basic', description: '꿰매는 실' },
            { id: 'bottle', name: '병', category: 'basic', description: '유리병' },
            { id: 'herb', name: '약초', category: 'basic', description: '치유 효과가 있는 약초' },
            { id: 'water', name: '물', category: 'basic', description: '깨끗한 물' },
            
            // 광물 재료
            { id: 'iron_ore', name: '철광석', category: 'mineral', description: '철이 든 광석' },
            { id: 'coal', name: '석탄', category: 'mineral', description: '연료용 석탄' },
            { id: 'gold_ore', name: '금광석', category: 'mineral', description: '금이 든 귀한 광석' },
            { id: 'silver_ore', name: '은광석', category: 'mineral', description: '은이 든 광석' },
            { id: 'steel_ingot', name: '강철 주괴', category: 'mineral', description: '제련된 강철' },
            { id: 'mithril_ore', name: '미스릴 광석', category: 'mineral', description: '전설의 미스릴 광석' },
            
            // 마법 재료
            { id: 'magic_crystal', name: '마법 수정', category: 'magical', description: '마법이 깃든 수정' },
            { id: 'fire_crystal', name: '화염 수정', category: 'magical', description: '화염의 힘이 깃든 수정' },
            { id: 'ice_crystal', name: '얼음 수정', category: 'magical', description: '얼음의 힘이 깃든 수정' },
            { id: 'time_crystal', name: '시간 수정', category: 'magical', description: '시간의 힘이 깃든 수정' },
            { id: 'enchant_dust', name: '마법 가루', category: 'magical', description: '마법 부여용 가루' },
            { id: 'magic_ink', name: '마법 잉크', category: 'magical', description: '마법이 깃든 잉크' },
            
            // 희귀 재료
            { id: 'dragon_scale', name: '용의 비늘', category: 'legendary', description: '고대 용의 비늘' },
            { id: 'dragon_blood', name: '용의 피', category: 'legendary', description: '용의 신비한 피' },
            { id: 'phoenix_feather', name: '불사조 깃털', category: 'legendary', description: '불사조의 신성한 깃털' },
            { id: 'pure_gold', name: '순금', category: 'legendary', description: '완전히 정제된 금' },
            { id: 'life_essence', name: '생명의 정수', category: 'legendary', description: '생명의 핵심 에너지' },
            { id: 'philosophers_powder', name: '현자의 가루', category: 'legendary', description: '현자의 돌을 만드는 신비한 가루' }
        ];
    }

    async initializeCraftingSystem() {
        // 제작법 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS crafting_recipes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                recipe_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                level_requirement INTEGER DEFAULT 1,
                crafting_skill TEXT NOT NULL,
                skill_level_requirement INTEGER DEFAULT 1,
                materials TEXT NOT NULL,
                result_item TEXT NOT NULL,
                result_quantity INTEGER DEFAULT 1,
                success_rate INTEGER DEFAULT 100,
                exp_gain INTEGER DEFAULT 0,
                description TEXT
            )
        `);

        // 제작 기술 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS crafting_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                skill_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                description TEXT
            )
        `);

        // 플레이어 제작 기술 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS player_crafting_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                skill_id TEXT NOT NULL,
                skill_level INTEGER DEFAULT 1,
                skill_exp INTEGER DEFAULT 0,
                max_exp INTEGER DEFAULT 100,
                learned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (player_id) REFERENCES players(id),
                UNIQUE(player_id, skill_id)
            )
        `);

        // 제작 재료 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS crafting_materials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                material_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT
            )
        `);

        // 제작 기록 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS crafting_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                recipe_id TEXT NOT NULL,
                success BOOLEAN NOT NULL,
                exp_gained INTEGER DEFAULT 0,
                materials_used TEXT,
                crafted_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (player_id) REFERENCES players(id)
            )
        `);

        // 워크벤치 테이블 (제작 시설)
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS crafting_stations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                station_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                required_skills TEXT,
                bonus_success_rate INTEGER DEFAULT 0,
                bonus_exp INTEGER DEFAULT 0,
                cost REAL DEFAULT 0,
                description TEXT
            )
        `);

        // 데이터 삽입
        await this.seedCraftingData();

        // 장비 합성 테이블 생성
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS equipment_synthesis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                base_item TEXT NOT NULL,
                material_items TEXT NOT NULL,
                result_item TEXT,
                synthesis_type TEXT NOT NULL,
                success BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('제작 시스템 초기화 완료');
    }

    async seedCraftingData() {
        // 제작법 데이터 삽입
        for (const recipe of this.craftingRecipes) {
            await this.db.run(`
                INSERT OR IGNORE INTO crafting_recipes 
                (recipe_id, name, category, level_requirement, crafting_skill, skill_level_requirement, 
                 materials, result_item, result_quantity, success_rate, exp_gain, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [recipe.id, recipe.name, recipe.category, recipe.level_req, recipe.crafting_skill,
                recipe.skill_level_req, recipe.materials, recipe.result_item, recipe.result_quantity,
                recipe.success_rate, recipe.exp_gain, recipe.description]);
        }

        // 제작 기술 데이터 삽입
        for (const skill of this.craftingSkills) {
            await this.db.run(`
                INSERT OR IGNORE INTO crafting_skills (skill_id, name, description)
                VALUES (?, ?, ?)
            `, [skill.id, skill.name, skill.description]);
        }

        // 제작 재료 데이터 삽입
        for (const material of this.craftingMaterials) {
            await this.db.run(`
                INSERT OR IGNORE INTO crafting_materials (material_id, name, category, description)
                VALUES (?, ?, ?, ?)
            `, [material.id, material.name, material.category, material.description]);
        }

        // 제작 시설 데이터 삽입
        const stations = [
            { id: 'basic_forge', name: '기본 대장간', skills: JSON.stringify(['blacksmithing']), bonus_success: 5, bonus_exp: 0, cost: 100000 },
            { id: 'advanced_forge', name: '고급 대장간', skills: JSON.stringify(['blacksmithing']), bonus_success: 15, bonus_exp: 50, cost: 500000 },
            { id: 'alchemy_lab', name: '연금술 실험실', skills: JSON.stringify(['alchemy']), bonus_success: 10, bonus_exp: 25, cost: 300000 },
            { id: 'enchanting_table', name: '마법 부여 대', skills: JSON.stringify(['enchanting']), bonus_success: 8, bonus_exp: 30, cost: 400000 },
            { id: 'master_workshop', name: '마스터 작업장', skills: JSON.stringify(['blacksmithing', 'alchemy', 'enchanting']), bonus_success: 20, bonus_exp: 100, cost: 2000000 }
        ];

        for (const station of stations) {
            await this.db.run(`
                INSERT OR IGNORE INTO crafting_stations 
                (station_id, name, required_skills, bonus_success_rate, bonus_exp, cost, description)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [station.id, station.name, station.skills, station.bonus_success, 
                station.bonus_exp, station.cost, `${station.name} 제작 시설`]);
        }
    }

    async learnCraftingSkill(playerId, skillId) {
        try {
            // 스킬 존재 확인
            const skill = await this.db.get('SELECT * FROM crafting_skills WHERE skill_id = ?', [skillId]);
            if (!skill) {
                return { success: false, message: '존재하지 않는 제작 기술입니다.' };
            }

            // 이미 배운 스킬인지 확인
            const existing = await this.db.get(`
                SELECT * FROM player_crafting_skills WHERE player_id = ? AND skill_id = ?
            `, [playerId, skillId]);

            if (existing) {
                return { success: false, message: '이미 배운 제작 기술입니다.' };
            }

            // 플레이어 정보 확인
            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [playerId]);
            const cost = 10000; // 기본 학습 비용

            if (player.money < cost) {
                return { 
                    success: false, 
                    message: `돈이 부족합니다. 필요: ${cost.toLocaleString()}원` 
                };
            }

            // 스킬 학습
            await this.db.run(`
                INSERT INTO player_crafting_skills (player_id, skill_id)
                VALUES (?, ?)
            `, [playerId, skillId]);

            // 비용 차감
            await this.db.run(`
                UPDATE players SET money = money - ? WHERE id = ?
            `, [cost, playerId]);

            return {
                success: true,
                message: `${skill.name} 기술을 배웠습니다!`,
                cost: cost
            };

        } catch (error) {
            console.error('제작 기술 학습 오류:', error);
            return { success: false, message: '제작 기술 학습 중 오류가 발생했습니다.' };
        }
    }

    async craftItem(playerId, recipeId, quantity = 1, stationId = null) {
        try {
            // 레시피 확인
            const recipe = await this.db.get('SELECT * FROM crafting_recipes WHERE recipe_id = ?', [recipeId]);
            if (!recipe) {
                return { success: false, message: '존재하지 않는 제작법입니다.' };
            }

            // 플레이어 레벨 확인
            const player = await this.db.get('SELECT level FROM players WHERE id = ?', [playerId]);
            if (player.level < recipe.level_requirement) {
                return { 
                    success: false, 
                    message: `레벨이 부족합니다. 필요 레벨: ${recipe.level_requirement}` 
                };
            }

            // 제작 기술 확인
            const playerSkill = await this.db.get(`
                SELECT * FROM player_crafting_skills 
                WHERE player_id = ? AND skill_id = ?
            `, [playerId, recipe.crafting_skill]);

            if (!playerSkill) {
                return { 
                    success: false, 
                    message: `${recipe.crafting_skill} 기술을 배우지 않았습니다.` 
                };
            }

            if (playerSkill.skill_level < recipe.skill_level_requirement) {
                return { 
                    success: false, 
                    message: `기술 레벨이 부족합니다. 필요: ${recipe.skill_level_requirement}, 보유: ${playerSkill.skill_level}` 
                };
            }

            // 재료 확인 및 소모
            const materials = JSON.parse(recipe.materials);
            const materialCheck = await this.checkAndConsumeMaterials(playerId, materials, quantity);
            
            if (!materialCheck.success) {
                return materialCheck;
            }

            // 제작 시설 보너스
            let bonusSuccessRate = 0;
            let bonusExp = 0;
            
            if (stationId) {
                const station = await this.db.get('SELECT * FROM crafting_stations WHERE station_id = ?', [stationId]);
                if (station) {
                    const requiredSkills = JSON.parse(station.required_skills);
                    if (requiredSkills.includes(recipe.crafting_skill)) {
                        bonusSuccessRate = station.bonus_success_rate;
                        bonusExp = station.bonus_exp;
                    }
                }
            }

            // 제작 시도
            const results = [];
            let totalExpGained = 0;
            let successCount = 0;

            for (let i = 0; i < quantity; i++) {
                const successRate = Math.min(95, recipe.success_rate + bonusSuccessRate + (playerSkill.skill_level * 2));
                const isSuccess = Math.random() * 100 < successRate;
                
                if (isSuccess) {
                    // 성공: 아이템 지급
                    await this.giveItem(playerId, recipe.result_item, recipe.result_quantity);
                    successCount++;
                }

                // 경험치 획득 (실패해도 일부 획득)
                const expGained = Math.floor((recipe.exp_gain + bonusExp) * (isSuccess ? 1 : 0.3));
                totalExpGained += expGained;

                results.push({
                    attempt: i + 1,
                    success: isSuccess,
                    expGained: expGained
                });
            }

            // 기술 경험치 업데이트
            await this.updateCraftingSkillExp(playerId, recipe.crafting_skill, totalExpGained);

            // 제작 기록 저장
            await this.db.run(`
                INSERT INTO crafting_history (player_id, recipe_id, success, exp_gained, materials_used)
                VALUES (?, ?, ?, ?, ?)
            `, [playerId, recipeId, successCount > 0, totalExpGained, JSON.stringify(materials)]);

            return {
                success: true,
                message: `제작 완료! 성공: ${successCount}/${quantity}`,
                results: results,
                successCount: successCount,
                totalExpGained: totalExpGained,
                recipe: recipe
            };

        } catch (error) {
            console.error('아이템 제작 오류:', error);
            return { success: false, message: '아이템 제작 중 오류가 발생했습니다.' };
        }
    }

    async checkAndConsumeMaterials(playerId, materials, quantity) {
        // 재료 보유 확인
        for (const material of materials) {
            const needed = material.quantity * quantity;
            const inventory = await this.db.get(`
                SELECT pi.quantity
                FROM player_inventory pi
                JOIN items i ON pi.item_id = i.id
                WHERE pi.player_id = ? AND (i.name = ? OR i.description LIKE ?)
            `, [playerId, material.item, `%${material.item}%`]);

            if (!inventory || inventory.quantity < needed) {
                return { 
                    success: false, 
                    message: `재료가 부족합니다: ${material.item} (필요: ${needed}, 보유: ${inventory ? inventory.quantity : 0})` 
                };
            }
        }

        // 재료 소모
        for (const material of materials) {
            const needed = material.quantity * quantity;
            await this.db.run(`
                UPDATE player_inventory 
                SET quantity = quantity - ?
                WHERE id IN (
                    SELECT pi.id
                    FROM player_inventory pi
                    JOIN items i ON pi.item_id = i.id
                    WHERE pi.player_id = ? AND (i.name = ? OR i.description LIKE ?)
                    LIMIT 1
                )
            `, [needed, playerId, material.item, `%${material.item}%`]);
        }

        return { success: true };
    }

    async giveItem(playerId, itemName, quantity) {
        // 아이템 ID 찾기
        let item = await this.db.get('SELECT id FROM items WHERE name = ?', [itemName]);
        
        if (!item) {
            // 아이템이 없으면 생성 (기본 제작 아이템)
            const result = await this.db.run(`
                INSERT INTO items (name, category, rarity, price, description)
                VALUES (?, 'crafted', 'common', 1000, '제작된 아이템')
            `, [itemName]);
            item = { id: result.lastID };
        }

        // 인벤토리에 추가
        const existing = await this.db.get(`
            SELECT * FROM player_inventory WHERE player_id = ? AND item_id = ?
        `, [playerId, item.id]);

        if (existing) {
            await this.db.run(`
                UPDATE player_inventory SET quantity = quantity + ? WHERE id = ?
            `, [quantity, existing.id]);
        } else {
            await this.db.run(`
                INSERT INTO player_inventory (player_id, item_id, quantity)
                VALUES (?, ?, ?)
            `, [playerId, item.id, quantity]);
        }
    }

    async updateCraftingSkillExp(playerId, skillId, expGained) {
        const skill = await this.db.get(`
            SELECT * FROM player_crafting_skills WHERE player_id = ? AND skill_id = ?
        `, [playerId, skillId]);

        if (!skill) return;

        let newExp = skill.skill_exp + expGained;
        let newLevel = skill.skill_level;
        let maxExp = skill.max_exp;

        // 레벨업 확인
        while (newExp >= maxExp) {
            newExp -= maxExp;
            newLevel++;
            maxExp = Math.floor(maxExp * 1.5); // 다음 레벨 필요 경험치 증가
        }

        await this.db.run(`
            UPDATE player_crafting_skills 
            SET skill_level = ?, skill_exp = ?, max_exp = ?
            WHERE player_id = ? AND skill_id = ?
        `, [newLevel, newExp, maxExp, playerId, skillId]);

        return { leveledUp: newLevel > skill.skill_level, newLevel: newLevel };
    }

    async getPlayerCraftingSkills(playerId) {
        return await this.db.all(`
            SELECT pcs.*, cs.name, cs.description
            FROM player_crafting_skills pcs
            JOIN crafting_skills cs ON pcs.skill_id = cs.skill_id
            WHERE pcs.player_id = ?
            ORDER BY pcs.skill_level DESC
        `, [playerId]);
    }

    async getAvailableRecipes(playerId, skillId = null) {
        const player = await this.db.get('SELECT level FROM players WHERE id = ?', [playerId]);
        const playerSkills = await this.getPlayerCraftingSkills(playerId);
        
        let sql = `
            SELECT cr.*, cs.name as skill_name
            FROM crafting_recipes cr
            JOIN crafting_skills cs ON cr.crafting_skill = cs.skill_id
            WHERE cr.level_requirement <= ?
        `;
        const params = [player.level];

        if (skillId) {
            sql += ' AND cr.crafting_skill = ?';
            params.push(skillId);
        }

        // 플레이어가 배운 기술만 표시
        const learnedSkills = playerSkills.map(s => s.skill_id);
        if (learnedSkills.length > 0) {
            sql += ` AND cr.crafting_skill IN (${learnedSkills.map(() => '?').join(',')})`;
            params.push(...learnedSkills);
        } else {
            return []; // 배운 기술이 없으면 빈 배열 반환
        }

        sql += ' ORDER BY cr.level_requirement ASC, cr.skill_level_requirement ASC';

        const recipes = await this.db.all(sql, params);
        
        // 기술 레벨 확인하여 제작 가능한 레시피만 반환
        return recipes.filter(recipe => {
            const playerSkill = playerSkills.find(s => s.skill_id === recipe.crafting_skill);
            return playerSkill && playerSkill.skill_level >= recipe.skill_level_requirement;
        });
    }

    async getCraftingStations() {
        return await this.db.all('SELECT * FROM crafting_stations ORDER BY cost ASC');
    }

    createCraftingSkillsEmbed(skills) {
        const embed = new EmbedBuilder()
            .setColor('#ffaa00')
            .setTitle('🔨 제작 기술')
            .setDescription('다양한 제작 기술을 익혀 강력한 아이템을 만들어보세요!')
            .setTimestamp();

        if (skills.length === 0) {
            embed.addFields({
                name: '📝 시작하기',
                value: '아직 배운 제작 기술이 없습니다. 제작 기술을 배워보세요!',
                inline: false
            });
            return embed;
        }

        for (const skill of skills) {
            const expBar = this.createExpBar(skill.skill_exp, skill.max_exp);
            
            embed.addFields({
                name: `🔧 ${skill.name} (Lv.${skill.skill_level})`,
                value: [
                    `📊 ${expBar} ${skill.skill_exp}/${skill.max_exp}`,
                    `📝 ${skill.description}`
                ].join('\n'),
                inline: false
            });
        }

        return embed;
    }

    createRecipeListEmbed(recipes, title = '제작법 목록') {
        const embed = new EmbedBuilder()
            .setColor('#00aa44')
            .setTitle(`📜 ${title}`)
            .setTimestamp();

        if (recipes.length === 0) {
            embed.setDescription('제작 가능한 레시피가 없습니다.');
            return embed;
        }

        // 카테고리별로 그룹화
        const groupedRecipes = {};
        recipes.forEach(recipe => {
            if (!groupedRecipes[recipe.category]) {
                groupedRecipes[recipe.category] = [];
            }
            groupedRecipes[recipe.category].push(recipe);
        });

        for (const [category, categoryRecipes] of Object.entries(groupedRecipes)) {
            const recipeTexts = categoryRecipes.map(recipe => {
                const materials = JSON.parse(recipe.materials);
                const materialText = materials.map(m => `${m.item} x${m.quantity}`).join(', ');
                
                return [
                    `**${recipe.name}** (${recipe.recipe_id})`,
                    `🔧 필요 기술: ${recipe.skill_name} Lv.${recipe.skill_level_requirement}`,
                    `📦 재료: ${materialText}`,
                    `⚡ 성공률: ${recipe.success_rate}%`,
                    `🎯 경험치: ${recipe.exp_gain}`,
                    `📝 ${recipe.description}`
                ].join('\n');
            }).join('\n\n');

            embed.addFields({
                name: `📂 ${category.toUpperCase()}`,
                value: recipeTexts.length > 1024 ? recipeTexts.substring(0, 1020) + '...' : recipeTexts,
                inline: false
            });
        }

        return embed;
    }

    createCraftingResultEmbed(result) {
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#00ff00' : '#ff0000')
            .setTitle('🔨 제작 결과')
            .setDescription(result.message)
            .setTimestamp();

        if (result.results) {
            const successResults = result.results.filter(r => r.success);
            const failResults = result.results.filter(r => !r.success);

            if (successResults.length > 0) {
                embed.addFields({
                    name: '✅ 성공한 제작',
                    value: `${successResults.length}개 성공`,
                    inline: true
                });
            }

            if (failResults.length > 0) {
                embed.addFields({
                    name: '❌ 실패한 제작',
                    value: `${failResults.length}개 실패`,
                    inline: true
                });
            }

            if (result.totalExpGained > 0) {
                embed.addFields({
                    name: '📈 획득 경험치',
                    value: `${result.totalExpGained} EXP`,
                    inline: true
                });
            }
        }

        return embed;
    }

    createExpBar(current, max) {
        const percentage = current / max;
        const barLength = 10;
        const filledBars = Math.floor(percentage * barLength);
        const emptyBars = barLength - filledBars;
        
        return '🟨'.repeat(filledBars) + '⬜'.repeat(emptyBars);
    }
    // === 장비 합성/조합 시스템 ===
    
    // 장비 강화 합성
    async enhanceEquipment(playerId, baseItemId, materialItems) {
        try {
            // 기본 아이템 확인
            const baseItem = await this.getPlayerItem(playerId, baseItemId);
            if (!baseItem) {
                return { success: false, message: '강화할 장비를 찾을 수 없습니다.' };
            }

            // 강화 재료 확인
            const requiredMaterials = this.getEnhancementMaterials(baseItem.rarity);
            const hasAllMaterials = await this.checkMaterials(playerId, requiredMaterials);
            
            if (!hasAllMaterials.success) {
                return { success: false, message: `필요한 재료가 부족합니다: ${hasAllMaterials.missing.join(', ')}` };
            }

            // 강화 성공률 계산
            const successRate = this.calculateEnhancementRate(baseItem);
            const isSuccess = Math.random() * 100 < successRate;

            // 재료 소모
            await this.consumeMaterials(playerId, requiredMaterials);

            if (isSuccess) {
                // 강화 성공 - 아이템 스탯 증가
                const enhancedItem = await this.createEnhancedItem(baseItem);
                await this.replacePlayerItem(playerId, baseItemId, enhancedItem);

                // 기록 저장
                await this.recordSynthesis(playerId, baseItemId, requiredMaterials, enhancedItem.id, 'enhancement', true);

                return {
                    success: true,
                    message: `${baseItem.name}이(가) 성공적으로 강화되었습니다!`,
                    result: enhancedItem,
                    type: 'enhancement'
                };
            } else {
                // 강화 실패
                await this.recordSynthesis(playerId, baseItemId, requiredMaterials, null, 'enhancement', false);
                
                return {
                    success: false,
                    message: `${baseItem.name} 강화에 실패했습니다. 장비는 파괴되지 않았습니다.`,
                    type: 'enhancement'
                };
            }

        } catch (error) {
            console.error('장비 강화 오류:', error);
            return { success: false, message: '장비 강화 중 오류가 발생했습니다.' };
        }
    }

    // 장비 조합 합성
    async combineEquipment(playerId, recipe_id, materials) {
        try {
            const recipe = this.equipmentCombinationRecipes.find(r => r.id === recipe_id);
            if (!recipe) {
                return { success: false, message: '존재하지 않는 조합법입니다.' };
            }

            // 플레이어 레벨 및 스킬 체크
            const playerData = await this.getPlayerCraftingData(playerId);
            if (playerData.level < recipe.level_req) {
                return { success: false, message: `레벨 ${recipe.level_req} 이상이 필요합니다.` };
            }

            if (playerData[recipe.crafting_skill] < recipe.skill_level_req) {
                return { success: false, message: `${recipe.crafting_skill} 스킬 레벨 ${recipe.skill_level_req} 이상이 필요합니다.` };
            }

            // 재료 확인
            const requiredMaterials = JSON.parse(recipe.materials);
            const hasAllMaterials = await this.checkMaterials(playerId, requiredMaterials);
            
            if (!hasAllMaterials.success) {
                return { success: false, message: `필요한 재료가 부족합니다: ${hasAllMaterials.missing.join(', ')}` };
            }

            // 조합 성공률 적용
            const isSuccess = Math.random() * 100 < recipe.success_rate;

            // 재료 소모
            await this.consumeMaterials(playerId, requiredMaterials);

            if (isSuccess) {
                // 조합 성공
                const resultItem = await this.createCombinedItem(recipe);
                await this.addItemToInventory(playerId, resultItem);

                // 경험치 지급
                await this.addCraftingExp(playerId, recipe.crafting_skill, recipe.exp_gain);

                // 기록 저장
                await this.recordSynthesis(playerId, 'combination', requiredMaterials, resultItem.id, 'combination', true);

                return {
                    success: true,
                    message: `${recipe.name} 조합에 성공했습니다!`,
                    result: resultItem,
                    exp_gained: recipe.exp_gain,
                    type: 'combination'
                };
            } else {
                // 조합 실패
                await this.recordSynthesis(playerId, 'combination', requiredMaterials, null, 'combination', false);
                
                return {
                    success: false,
                    message: `${recipe.name} 조합에 실패했습니다. 재료가 소모되었습니다.`,
                    type: 'combination'
                };
            }

        } catch (error) {
            console.error('장비 조합 오류:', error);
            return { success: false, message: '장비 조합 중 오류가 발생했습니다.' };
        }
    }

    // 장비 분해
    async disassembleEquipment(playerId, itemId) {
        try {
            const item = await this.getPlayerItem(playerId, itemId);
            if (!item) {
                return { success: false, message: '분해할 장비를 찾을 수 없습니다.' };
            }

            // 분해 가능한 장비인지 확인
            if (!this.canDisassemble(item)) {
                return { success: false, message: '분해할 수 없는 아이템입니다.' };
            }

            // 분해 결과물 계산
            const disassemblyResults = this.calculateDisassemblyResults(item);

            // 원본 아이템 제거
            await this.removePlayerItem(playerId, itemId);

            // 분해 결과물 지급
            for (const result of disassemblyResults) {
                await this.addItemToInventory(playerId, result.item, result.quantity);
            }

            // 기록 저장
            await this.recordSynthesis(playerId, itemId, [], disassemblyResults, 'disassembly', true);

            return {
                success: true,
                message: `${item.name}을(를) 분해했습니다!`,
                results: disassemblyResults,
                type: 'disassembly'
            };

        } catch (error) {
            console.error('장비 분해 오류:', error);
            return { success: false, message: '장비 분해 중 오류가 발생했습니다.' };
        }
    }

    // 강화 재료 계산
    getEnhancementMaterials(rarity) {
        const materials = {
            'common': [
                { item: 'enhancement_stone', quantity: 1 },
                { item: 'iron_ore', quantity: 2 }
            ],
            'rare': [
                { item: 'enhancement_stone', quantity: 2 },
                { item: 'silver_ore', quantity: 3 },
                { item: 'magic_crystal', quantity: 1 }
            ],
            'epic': [
                { item: 'enhancement_stone', quantity: 3 },
                { item: 'gold_ore', quantity: 2 },
                { item: 'rare_crystal', quantity: 2 }
            ],
            'legendary': [
                { item: 'enhancement_stone', quantity: 5 },
                { item: 'platinum_ore', quantity: 3 },
                { item: 'legendary_crystal', quantity: 1 }
            ],
            'mythic': [
                { item: 'enhancement_stone', quantity: 10 },
                { item: 'mythril_ore', quantity: 5 },
                { item: 'cosmic_essence', quantity: 2 }
            ]
        };

        return materials[rarity] || materials['common'];
    }

    // 강화 성공률 계산
    calculateEnhancementRate(item) {
        const baseRates = {
            'common': 80,
            'rare': 70,
            'epic': 60,
            'legendary': 40,
            'mythic': 20
        };

        const enhanceLevel = item.enhance_level || 0;
        const baseRate = baseRates[item.rarity] || 50;
        
        // 강화 레벨이 높을수록 성공률 감소
        return Math.max(10, baseRate - (enhanceLevel * 5));
    }

    // 강화된 아이템 생성
    async createEnhancedItem(baseItem) {
        const enhanceLevel = (baseItem.enhance_level || 0) + 1;
        const enhanceMultiplier = 1 + (enhanceLevel * 0.1); // 10%씩 증가

        // 기존 스탯 파싱
        const baseStats = JSON.parse(baseItem.stats || '{}');
        const enhancedStats = {};

        // 모든 스탯을 강화
        for (const [stat, value] of Object.entries(baseStats)) {
            enhancedStats[stat] = Math.floor(value * enhanceMultiplier);
        }

        return {
            ...baseItem,
            name: `${baseItem.name} +${enhanceLevel}`,
            enhance_level: enhanceLevel,
            stats: JSON.stringify(enhancedStats),
            description: `${baseItem.description} (강화 +${enhanceLevel})`
        };
    }

    // 조합된 아이템 생성
    async createCombinedItem(recipe) {
        return {
            id: recipe.result_item,
            name: recipe.result_name || recipe.name,
            category: recipe.category,
            rarity: recipe.result_rarity || 'rare',
            stats: recipe.result_stats || '{}',
            description: recipe.description
        };
    }

    // 분해 결과 계산
    calculateDisassemblyResults(item) {
        const rarityMaterials = {
            'common': [
                { item: 'scrap_metal', quantity: 1 },
                { item: 'cloth_piece', quantity: 2 }
            ],
            'rare': [
                { item: 'quality_metal', quantity: 1 },
                { item: 'magic_essence', quantity: 1 },
                { item: 'cloth_piece', quantity: 3 }
            ],
            'epic': [
                { item: 'refined_metal', quantity: 2 },
                { item: 'concentrated_essence', quantity: 1 },
                { item: 'rare_gem', quantity: 1 }
            ],
            'legendary': [
                { item: 'legendary_metal', quantity: 1 },
                { item: 'pure_essence', quantity: 2 },
                { item: 'rare_gem', quantity: 2 }
            ],
            'mythic': [
                { item: 'mythic_fragment', quantity: 1 },
                { item: 'cosmic_essence', quantity: 1 },
                { item: 'divine_crystal', quantity: 1 }
            ]
        };

        let results = rarityMaterials[item.rarity] || rarityMaterials['common'];
        
        // 강화 레벨에 따른 추가 재료
        if (item.enhance_level > 0) {
            results.push({ item: 'enhancement_stone', quantity: item.enhance_level });
        }

        return results;
    }

    // 분해 가능 여부 확인
    canDisassemble(item) {
        const disassemblableCategories = ['weapon', 'armor', 'helmet', 'gloves', 'boots'];
        return disassemblableCategories.includes(item.category);
    }

    // 합성 기록 저장
    async recordSynthesis(playerId, baseItem, materials, result, type, success) {
        await this.db.run(`
            INSERT INTO equipment_synthesis 
            (player_id, base_item, material_items, result_item, synthesis_type, success) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            playerId, 
            typeof baseItem === 'string' ? baseItem : JSON.stringify(baseItem),
            JSON.stringify(materials), 
            result ? (typeof result === 'string' ? result : JSON.stringify(result)) : null,
            type, 
            success
        ]);
    }

    // 장비 조합 레시피들
    get equipmentCombinationRecipes() {
        return [
            // 무기 조합
            {
                id: 'flame_sword',
                name: '화염의 검',
                category: 'weapon',
                level_req: 15,
                crafting_skill: 'blacksmithing',
                skill_level_req: 8,
                materials: JSON.stringify([
                    { item: 'iron_sword', quantity: 1 },
                    { item: 'fire_crystal', quantity: 3 },
                    { item: 'phoenix_feather', quantity: 1 }
                ]),
                result_item: 'flame_sword',
                result_name: '화염의 검',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ strength: 45, intelligence: 20 }),
                success_rate: 70,
                exp_gain: 80,
                description: '화염의 힘이 깃든 검을 조합합니다'
            },
            {
                id: 'ice_bow',
                name: '얼음 활',
                category: 'weapon',
                level_req: 18,
                crafting_skill: 'enchanting',
                skill_level_req: 10,
                materials: JSON.stringify([
                    { item: 'silver_bow', quantity: 1 },
                    { item: 'ice_crystal', quantity: 4 },
                    { item: 'frost_essence', quantity: 2 }
                ]),
                result_item: 'ice_bow',
                result_name: '얼음 활',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ agility: 50, intelligence: 15 }),
                success_rate: 65,
                exp_gain: 90,
                description: '얼음의 힘이 깃든 활을 조합합니다'
            },

            // 방어구 조합
            {
                id: 'dragon_scale_armor',
                name: '용린 갑옷',
                category: 'armor',
                level_req: 25,
                crafting_skill: 'armorsmithing',
                skill_level_req: 15,
                materials: JSON.stringify([
                    { item: 'steel_armor', quantity: 1 },
                    { item: 'dragon_scale', quantity: 10 },
                    { item: 'fire_resistance_potion', quantity: 3 }
                ]),
                result_item: 'dragon_scale_armor',
                result_name: '용린 갑옷',
                result_rarity: 'legendary',
                result_stats: JSON.stringify({ health: 150, strength: 30, fire_resistance: 50 }),
                success_rate: 50,
                exp_gain: 150,
                description: '용의 비늘로 만든 강력한 갑옷을 조합합니다'
            },

            // 액세서리 조합
            {
                id: 'mana_crystal_amulet',
                name: '마나 수정 목걸이',
                category: 'accessory',
                level_req: 20,
                crafting_skill: 'jewelcrafting',
                skill_level_req: 12,
                materials: JSON.stringify([
                    { item: 'silver_amulet', quantity: 1 },
                    { item: 'pure_mana_crystal', quantity: 5 },
                    { item: 'enchanted_thread', quantity: 3 }
                ]),
                result_item: 'mana_crystal_amulet',
                result_name: '마나 수정 목걸이',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ intelligence: 40, mana_regen: 20 }),
                success_rate: 60,
                exp_gain: 100,
                description: '마나 회복력을 증가시키는 목걸이를 조합합니다'
            },

            // 전설급 조합
            {
                id: 'excalibur',
                name: '엑스칼리버',
                category: 'weapon',
                level_req: 40,
                crafting_skill: 'legendary_smithing',
                skill_level_req: 25,
                materials: JSON.stringify([
                    { item: 'holy_sword', quantity: 1 },
                    { item: 'star_metal', quantity: 5 },
                    { item: 'divine_blessing', quantity: 1 },
                    { item: 'king_crystal', quantity: 3 }
                ]),
                result_item: 'excalibur',
                result_name: '엑스칼리버',
                result_rarity: 'mythic',
                result_stats: JSON.stringify({ strength: 100, charm: 50, holy_power: 80 }),
                success_rate: 25,
                exp_gain: 500,
                description: '전설의 성검 엑스칼리버를 조합합니다'
            },

            // === 추가 무기 조합 (50개+) ===
            // 검류
            {
                id: 'wind_blade',
                name: '바람의 검',
                category: 'weapon',
                level_req: 12,
                crafting_skill: 'blacksmithing',
                skill_level_req: 6,
                materials: JSON.stringify([
                    { item: 'steel_sword', quantity: 1 },
                    { item: 'wind_crystal', quantity: 2 },
                    { item: 'feather', quantity: 5 }
                ]),
                result_item: 'wind_blade',
                result_rarity: 'rare',
                result_stats: JSON.stringify({ strength: 25, agility: 15 }),
                success_rate: 75,
                exp_gain: 40,
                description: '바람의 힘이 깃든 빠른 검'
            },
            {
                id: 'thunder_sword',
                name: '번개 검',
                category: 'weapon',
                level_req: 20,
                crafting_skill: 'enchanting',
                skill_level_req: 12,
                materials: JSON.stringify([
                    { item: 'silver_sword', quantity: 1 },
                    { item: 'lightning_stone', quantity: 3 },
                    { item: 'storm_essence', quantity: 2 }
                ]),
                result_item: 'thunder_sword',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ strength: 40, intelligence: 25, lightning_damage: 30 }),
                success_rate: 65,
                exp_gain: 75,
                description: '번개의 힘으로 적을 마비시키는 검'
            },
            {
                id: 'cursed_blade',
                name: '저주받은 검',
                category: 'weapon',
                level_req: 25,
                crafting_skill: 'dark_magic',
                skill_level_req: 15,
                materials: JSON.stringify([
                    { item: 'black_steel_sword', quantity: 1 },
                    { item: 'soul_fragment', quantity: 5 },
                    { item: 'cursed_gem', quantity: 1 }
                ]),
                result_item: 'cursed_blade',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ strength: 55, curse_power: 40, health: -10 }),
                success_rate: 55,
                exp_gain: 100,
                description: '사용자를 약화시키지만 강력한 저주의 검'
            },
            {
                id: 'demon_slayer',
                name: '악마 도살자',
                category: 'weapon',
                level_req: 35,
                crafting_skill: 'holy_smithing',
                skill_level_req: 20,
                materials: JSON.stringify([
                    { item: 'blessed_steel', quantity: 8 },
                    { item: 'demon_horn', quantity: 3 },
                    { item: 'holy_water', quantity: 10 },
                    { item: 'silver_dust', quantity: 5 }
                ]),
                result_item: 'demon_slayer',
                result_rarity: 'legendary',
                result_stats: JSON.stringify({ strength: 75, holy_power: 60, demon_damage: 100 }),
                success_rate: 40,
                exp_gain: 200,
                description: '악마에게 특별한 피해를 주는 성스러운 검'
            },

            // 활류
            {
                id: 'poison_bow',
                name: '독의 활',
                category: 'weapon',
                level_req: 16,
                crafting_skill: 'bowcrafting',
                skill_level_req: 8,
                materials: JSON.stringify([
                    { item: 'yew_bow', quantity: 1 },
                    { item: 'poison_sac', quantity: 4 },
                    { item: 'snake_fang', quantity: 2 }
                ]),
                result_item: 'poison_bow',
                result_rarity: 'rare',
                result_stats: JSON.stringify({ agility: 30, poison_damage: 25 }),
                success_rate: 70,
                exp_gain: 50,
                description: '화살에 독을 입히는 위험한 활'
            },
            {
                id: 'explosive_bow',
                name: '폭발 활',
                category: 'weapon',
                level_req: 28,
                crafting_skill: 'alchemy',
                skill_level_req: 16,
                materials: JSON.stringify([
                    { item: 'composite_bow', quantity: 1 },
                    { item: 'explosive_powder', quantity: 6 },
                    { item: 'fire_crystal', quantity: 3 }
                ]),
                result_item: 'explosive_bow',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ agility: 45, explosive_damage: 50 }),
                success_rate: 55,
                exp_gain: 90,
                description: '폭발하는 화살을 쏘는 위험한 활'
            },

            // 지팡이류
            {
                id: 'necromancer_staff',
                name: '네크로맨서 지팡이',
                category: 'weapon',
                level_req: 22,
                crafting_skill: 'dark_magic',
                skill_level_req: 12,
                materials: JSON.stringify([
                    { item: 'bone_staff', quantity: 1 },
                    { item: 'death_crystal', quantity: 2 },
                    { item: 'ghost_essence', quantity: 4 }
                ]),
                result_item: 'necromancer_staff',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ intelligence: 50, necromancy_power: 40 }),
                success_rate: 60,
                exp_gain: 85,
                description: '언데드를 조종하는 어둠의 지팡이'
            },
            {
                id: 'archmage_staff',
                name: '대마법사 지팡이',
                category: 'weapon',
                level_req: 38,
                crafting_skill: 'legendary_enchanting',
                skill_level_req: 22,
                materials: JSON.stringify([
                    { item: 'master_staff', quantity: 1 },
                    { item: 'arcane_crystal', quantity: 5 },
                    { item: 'wizard_beard', quantity: 1 },
                    { item: 'time_essence', quantity: 3 }
                ]),
                result_item: 'archmage_staff',
                result_rarity: 'legendary',
                result_stats: JSON.stringify({ intelligence: 85, mana_regen: 50, spell_power: 70 }),
                success_rate: 35,
                exp_gain: 250,
                description: '최고의 마법사만이 다룰 수 있는 전설의 지팡이'
            },

            // 도끼류
            {
                id: 'berserker_axe',
                name: '광전사의 도끼',
                category: 'weapon',
                level_req: 18,
                crafting_skill: 'blacksmithing',
                skill_level_req: 10,
                materials: JSON.stringify([
                    { item: 'battle_axe', quantity: 1 },
                    { item: 'blood_crystal', quantity: 3 },
                    { item: 'rage_essence', quantity: 2 }
                ]),
                result_item: 'berserker_axe',
                result_rarity: 'rare',
                result_stats: JSON.stringify({ strength: 40, rage_damage: 30 }),
                success_rate: 65,
                exp_gain: 60,
                description: '분노할수록 강해지는 야만적인 도끼'
            },
            {
                id: 'giant_slayer_axe',
                name: '거인 학살자',
                category: 'weapon',
                level_req: 32,
                crafting_skill: 'giant_smithing',
                skill_level_req: 18,
                materials: JSON.stringify([
                    { item: 'great_axe', quantity: 1 },
                    { item: 'giant_bone', quantity: 5 },
                    { item: 'mountain_stone', quantity: 8 }
                ]),
                result_item: 'giant_slayer_axe',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ strength: 70, giant_damage: 80 }),
                success_rate: 45,
                exp_gain: 120,
                description: '거인족에게 특별한 피해를 주는 거대한 도끼'
            },

            // 창/스피어류
            {
                id: 'dragon_spear',
                name: '용의 창',
                category: 'weapon',
                level_req: 26,
                crafting_skill: 'dragonsmithing',
                skill_level_req: 14,
                materials: JSON.stringify([
                    { item: 'steel_spear', quantity: 1 },
                    { item: 'dragon_claw', quantity: 4 },
                    { item: 'fire_resistance_gem', quantity: 2 }
                ]),
                result_item: 'dragon_spear',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ strength: 55, dragon_damage: 45, fire_resistance: 30 }),
                success_rate: 50,
                exp_gain: 95,
                description: '용을 사냥하기 위해 만들어진 특별한 창'
            },

            // === 방어구 조합 (30개+) ===
            // 투구류
            {
                id: 'crown_of_wisdom',
                name: '지혜의 왕관',
                category: 'helmet',
                level_req: 24,
                crafting_skill: 'jewelcrafting',
                skill_level_req: 14,
                materials: JSON.stringify([
                    { item: 'gold_circlet', quantity: 1 },
                    { item: 'wisdom_gem', quantity: 3 },
                    { item: 'owl_feather', quantity: 5 }
                ]),
                result_item: 'crown_of_wisdom',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ intelligence: 45, wisdom: 30, mana_regen: 20 }),
                success_rate: 55,
                exp_gain: 85,
                description: '착용자의 지혜를 크게 증가시키는 왕관'
            },
            {
                id: 'demon_helm',
                name: '악마의 투구',
                category: 'helmet',
                level_req: 30,
                crafting_skill: 'dark_smithing',
                skill_level_req: 16,
                materials: JSON.stringify([
                    { item: 'black_steel_helm', quantity: 1 },
                    { item: 'demon_horn', quantity: 2 },
                    { item: 'fear_essence', quantity: 4 }
                ]),
                result_item: 'demon_helm',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ strength: 35, fear_aura: 40, dark_resistance: 50 }),
                success_rate: 50,
                exp_gain: 100,
                description: '적에게 공포를 주는 악마의 투구'
            },

            // 갑옷류
            {
                id: 'phoenix_armor',
                name: '불사조 갑옷',
                category: 'armor',
                level_req: 34,
                crafting_skill: 'legendary_smithing',
                skill_level_req: 20,
                materials: JSON.stringify([
                    { item: 'flame_armor', quantity: 1 },
                    { item: 'phoenix_feather', quantity: 8 },
                    { item: 'rebirth_crystal', quantity: 2 }
                ]),
                result_item: 'phoenix_armor',
                result_rarity: 'legendary',
                result_stats: JSON.stringify({ health: 120, fire_immunity: 100, rebirth_chance: 15 }),
                success_rate: 40,
                exp_gain: 180,
                description: '죽음으로부터 되살아날 수 있는 불사조의 갑옷'
            },
            {
                id: 'shadow_cloak',
                name: '그림자 망토',
                category: 'armor',
                level_req: 21,
                crafting_skill: 'shadow_weaving',
                skill_level_req: 12,
                materials: JSON.stringify([
                    { item: 'dark_cloth', quantity: 10 },
                    { item: 'shadow_essence', quantity: 6 },
                    { item: 'void_thread', quantity: 4 }
                ]),
                result_item: 'shadow_cloak',
                result_rarity: 'rare',
                result_stats: JSON.stringify({ agility: 35, stealth: 50, shadow_resistance: 40 }),
                success_rate: 60,
                exp_gain: 70,
                description: '그림자에 숨어 은밀하게 이동할 수 있는 망토'
            },

            // 장갑류
            {
                id: 'gauntlets_of_power',
                name: '힘의 건틀릿',
                category: 'gloves',
                level_req: 19,
                crafting_skill: 'blacksmithing',
                skill_level_req: 11,
                materials: JSON.stringify([
                    { item: 'steel_gauntlets', quantity: 1 },
                    { item: 'giant_muscle', quantity: 3 },
                    { item: 'power_crystal', quantity: 2 }
                ]),
                result_item: 'gauntlets_of_power',
                result_rarity: 'rare',
                result_stats: JSON.stringify({ strength: 30, grip_power: 25 }),
                success_rate: 70,
                exp_gain: 55,
                description: '착용자의 완력을 크게 증가시키는 건틀릿'
            },

            // 신발류
            {
                id: 'boots_of_speed',
                name: '신속의 부츠',
                category: 'boots',
                level_req: 17,
                crafting_skill: 'leatherworking',
                skill_level_req: 9,
                materials: JSON.stringify([
                    { item: 'leather_boots', quantity: 1 },
                    { item: 'cheetah_fur', quantity: 4 },
                    { item: 'speed_potion', quantity: 2 }
                ]),
                result_item: 'boots_of_speed',
                result_rarity: 'rare',
                result_stats: JSON.stringify({ agility: 40, movement_speed: 30 }),
                success_rate: 75,
                exp_gain: 45,
                description: '착용자의 이동속도를 극대화하는 부츠'
            },

            // === 액세서리 조합 (25개+) ===
            // 목걸이류
            {
                id: 'amulet_of_protection',
                name: '보호의 목걸이',
                category: 'accessory',
                level_req: 15,
                crafting_skill: 'jewelcrafting',
                skill_level_req: 8,
                materials: JSON.stringify([
                    { item: 'silver_chain', quantity: 1 },
                    { item: 'protection_gem', quantity: 2 },
                    { item: 'blessed_oil', quantity: 3 }
                ]),
                result_item: 'amulet_of_protection',
                result_rarity: 'rare',
                result_stats: JSON.stringify({ health: 25, magic_resistance: 20 }),
                success_rate: 80,
                exp_gain: 40,
                description: '마법 공격으로부터 보호해주는 목걸이'
            },
            {
                id: 'necklace_of_dragons',
                name: '용의 목걸이',
                category: 'accessory',
                level_req: 29,
                crafting_skill: 'dragon_jewelcrafting',
                skill_level_req: 16,
                materials: JSON.stringify([
                    { item: 'dragon_scale_chain', quantity: 1 },
                    { item: 'dragon_heart', quantity: 1 },
                    { item: 'fire_opal', quantity: 3 }
                ]),
                result_item: 'necklace_of_dragons',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ strength: 40, fire_power: 35, dragon_speak: 100 }),
                success_rate: 45,
                exp_gain: 110,
                description: '용족과 소통할 수 있게 해주는 신비한 목걸이'
            },

            // 반지류
            {
                id: 'ring_of_regeneration',
                name: '재생의 반지',
                category: 'ring',
                level_req: 20,
                crafting_skill: 'healing_magic',
                skill_level_req: 12,
                materials: JSON.stringify([
                    { item: 'healing_crystal', quantity: 3 },
                    { item: 'troll_blood', quantity: 2 },
                    { item: 'life_essence', quantity: 4 }
                ]),
                result_item: 'ring_of_regeneration',
                result_rarity: 'rare',
                result_stats: JSON.stringify({ health_regen: 15, healing_power: 25 }),
                success_rate: 65,
                exp_gain: 65,
                description: '지속적으로 체력을 회복시켜주는 반지'
            },
            {
                id: 'ring_of_teleportation',
                name: '순간이동 반지',
                category: 'ring',
                level_req: 33,
                crafting_skill: 'space_magic',
                skill_level_req: 18,
                materials: JSON.stringify([
                    { item: 'void_crystal', quantity: 2 },
                    { item: 'spatial_essence', quantity: 5 },
                    { item: 'mithril_band', quantity: 1 }
                ]),
                result_item: 'ring_of_teleportation',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ teleport_charges: 5, space_magic: 40 }),
                success_rate: 40,
                exp_gain: 130,
                description: '짧은 거리를 순간이동할 수 있는 마법의 반지'
            },

            // === 소비 아이템 조합 (40개+) ===
            // 물약류
            {
                id: 'super_healing_potion',
                name: '대치유 물약',
                category: 'consumable',
                level_req: 14,
                crafting_skill: 'alchemy',
                skill_level_req: 8,
                materials: JSON.stringify([
                    { item: 'healing_potion', quantity: 3 },
                    { item: 'life_herb', quantity: 5 },
                    { item: 'crystal_water', quantity: 1 }
                ]),
                result_item: 'super_healing_potion',
                result_rarity: 'rare',
                success_rate: 85,
                exp_gain: 35,
                description: '강력한 치유 효과를 가진 고급 물약'
            },
            {
                id: 'berserker_potion',
                name: '광전사 물약',
                category: 'consumable',
                level_req: 18,
                crafting_skill: 'alchemy',
                skill_level_req: 10,
                materials: JSON.stringify([
                    { item: 'strength_potion', quantity: 2 },
                    { item: 'rage_mushroom', quantity: 4 },
                    { item: 'blood_of_beast', quantity: 1 }
                ]),
                result_item: 'berserker_potion',
                result_rarity: 'rare',
                success_rate: 70,
                exp_gain: 50,
                description: '일시적으로 분노 상태가 되어 공격력이 크게 증가'
            },
            {
                id: 'elixir_of_immortality',
                name: '불멸의 엘릭서',
                category: 'consumable',
                level_req: 45,
                crafting_skill: 'divine_alchemy',
                skill_level_req: 30,
                materials: JSON.stringify([
                    { item: 'phoenix_tears', quantity: 1 },
                    { item: 'eternal_flower', quantity: 3 },
                    { item: 'time_essence', quantity: 5 },
                    { item: 'philosopher_stone', quantity: 1 }
                ]),
                result_item: 'elixir_of_immortality',
                result_rarity: 'mythic',
                success_rate: 15,
                exp_gain: 800,
                description: '죽음을 무효화하는 전설의 엘릭서'
            },

            // 음식류
            {
                id: 'dragon_steak',
                name: '드래곤 스테이크',
                category: 'food',
                level_req: 25,
                crafting_skill: 'cooking',
                skill_level_req: 15,
                materials: JSON.stringify([
                    { item: 'dragon_meat', quantity: 1 },
                    { item: 'fire_spice', quantity: 3 },
                    { item: 'magic_salt', quantity: 2 }
                ]),
                result_item: 'dragon_steak',
                result_rarity: 'epic',
                success_rate: 60,
                exp_gain: 80,
                description: '용의 고기로 만든 최고급 요리'
            },

            // 특수 아이템
            {
                id: 'resurrection_scroll',
                name: '부활 주문서',
                category: 'special',
                level_req: 35,
                crafting_skill: 'divine_magic',
                skill_level_req: 20,
                materials: JSON.stringify([
                    { item: 'sacred_parchment', quantity: 1 },
                    { item: 'angel_feather', quantity: 5 },
                    { item: 'divine_ink', quantity: 3 }
                ]),
                result_item: 'resurrection_scroll',
                result_rarity: 'legendary',
                success_rate: 30,
                exp_gain: 200,
                description: '죽은 동료를 되살릴 수 있는 신성한 주문서'
            },

            // === 도구류 조합 (15개+) ===
            {
                id: 'master_pickaxe',
                name: '마스터 곡괭이',
                category: 'tool',
                level_req: 22,
                crafting_skill: 'toolmaking',
                skill_level_req: 12,
                materials: JSON.stringify([
                    { item: 'steel_pickaxe', quantity: 1 },
                    { item: 'diamond_tip', quantity: 3 },
                    { item: 'efficiency_gem', quantity: 2 }
                ]),
                result_item: 'master_pickaxe',
                result_rarity: 'rare',
                success_rate: 75,
                exp_gain: 60,
                description: '채굴 효율이 크게 향상된 고급 곡괭이'
            },
            {
                id: 'eternal_fishing_rod',
                name: '영원한 낚시대',
                category: 'tool',
                level_req: 40,
                crafting_skill: 'fishing_mastery',
                skill_level_req: 25,
                materials: JSON.stringify([
                    { item: 'legendary_rod', quantity: 1 },
                    { item: 'sea_god_blessing', quantity: 1 },
                    { item: 'eternal_line', quantity: 1 }
                ]),
                result_item: 'eternal_fishing_rod',
                result_rarity: 'mythic',
                success_rate: 20,
                exp_gain: 500,
                description: '어떤 물고기든 잡을 수 있는 전설의 낚시대'
            },

            // === 더 많은 무기 조합 ===
            // 단검류
            {
                id: 'shadow_dagger',
                name: '그림자 단검',
                category: 'weapon',
                level_req: 15,
                crafting_skill: 'rogue_crafting',
                skill_level_req: 8,
                materials: JSON.stringify([
                    { item: 'steel_dagger', quantity: 1 },
                    { item: 'shadow_essence', quantity: 3 },
                    { item: 'void_metal', quantity: 2 }
                ]),
                result_item: 'shadow_dagger',
                result_rarity: 'rare',
                result_stats: JSON.stringify({ agility: 25, stealth: 35, critical_chance: 20 }),
                success_rate: 70,
                exp_gain: 50,
                description: '그림자에 숨어 치명타를 노리는 암살자의 단검'
            },
            {
                id: 'vampire_blade',
                name: '뱀파이어 칼날',
                category: 'weapon',
                level_req: 28,
                crafting_skill: 'blood_magic',
                skill_level_req: 15,
                materials: JSON.stringify([
                    { item: 'cursed_dagger', quantity: 1 },
                    { item: 'vampire_fang', quantity: 4 },
                    { item: 'blood_ruby', quantity: 2 }
                ]),
                result_item: 'vampire_blade',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ strength: 45, life_steal: 30, blood_magic: 40 }),
                success_rate: 55,
                exp_gain: 90,
                description: '적의 생명력을 흡수하는 피의 칼날'
            },

            // 망치류
            {
                id: 'storm_hammer',
                name: '폭풍 망치',
                category: 'weapon',
                level_req: 23,
                crafting_skill: 'storm_smithing',
                skill_level_req: 13,
                materials: JSON.stringify([
                    { item: 'war_hammer', quantity: 1 },
                    { item: 'storm_core', quantity: 2 },
                    { item: 'lightning_rod', quantity: 3 }
                ]),
                result_item: 'storm_hammer',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ strength: 50, lightning_damage: 45, area_damage: 25 }),
                success_rate: 60,
                exp_gain: 75,
                description: '천둥번개를 부르는 신의 망치'
            },
            {
                id: 'earth_shaker',
                name: '대지의 파괴자',
                category: 'weapon',
                level_req: 31,
                crafting_skill: 'earth_magic',
                skill_level_req: 17,
                materials: JSON.stringify([
                    { item: 'giant_hammer', quantity: 1 },
                    { item: 'earth_core', quantity: 3 },
                    { item: 'mountain_crystal', quantity: 5 }
                ]),
                result_item: 'earth_shaker',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ strength: 65, earthquake_power: 50, stun_chance: 30 }),
                success_rate: 50,
                exp_gain: 105,
                description: '땅을 갈라뜨리는 거대한 대지의 망치'
            },

            // 특수 무기
            {
                id: 'soul_reaper',
                name: '영혼 수확자',
                category: 'weapon',
                level_req: 36,
                crafting_skill: 'death_magic',
                skill_level_req: 20,
                materials: JSON.stringify([
                    { item: 'death_scythe', quantity: 1 },
                    { item: 'soul_crystal', quantity: 5 },
                    { item: 'reaper_cloak', quantity: 1 }
                ]),
                result_item: 'soul_reaper',
                result_rarity: 'legendary',
                result_stats: JSON.stringify({ strength: 70, soul_damage: 60, instant_kill_chance: 5 }),
                success_rate: 35,
                exp_gain: 180,
                description: '적의 영혼을 수확하는 죽음의 낫'
            },

            // === 더 많은 방어구 ===
            // 특수 투구
            {
                id: 'mind_guard_helm',
                name: '정신 수호 투구',
                category: 'helmet',
                level_req: 19,
                crafting_skill: 'mind_magic',
                skill_level_req: 10,
                materials: JSON.stringify([
                    { item: 'steel_helm', quantity: 1 },
                    { item: 'psychic_crystal', quantity: 3 },
                    { item: 'mental_ward', quantity: 2 }
                ]),
                result_item: 'mind_guard_helm',
                result_rarity: 'rare',
                result_stats: JSON.stringify({ intelligence: 30, mental_resistance: 40, clarity: 25 }),
                success_rate: 75,
                exp_gain: 55,
                description: '정신 공격을 막아주는 투구'
            },
            {
                id: 'berserker_helm',
                name: '광전사 투구',
                category: 'helmet',
                level_req: 26,
                crafting_skill: 'berserker_crafting',
                skill_level_req: 14,
                materials: JSON.stringify([
                    { item: 'battle_helm', quantity: 1 },
                    { item: 'rage_crystal', quantity: 4 },
                    { item: 'blood_rune', quantity: 2 }
                ]),
                result_item: 'berserker_helm',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ strength: 40, rage_power: 35, fear_immunity: 100 }),
                success_rate: 55,
                exp_gain: 80,
                description: '분노를 증폭시키는 야만적인 투구'
            },

            // 특수 갑옷
            {
                id: 'arcane_robes',
                name: '비전 로브',
                category: 'armor',
                level_req: 27,
                crafting_skill: 'arcane_weaving',
                skill_level_req: 15,
                materials: JSON.stringify([
                    { item: 'magic_cloth', quantity: 12 },
                    { item: 'arcane_thread', quantity: 8 },
                    { item: 'mana_crystal', quantity: 4 }
                ]),
                result_item: 'arcane_robes',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ intelligence: 55, mana_efficiency: 30, spell_power: 25 }),
                success_rate: 60,
                exp_gain: 85,
                description: '마법사의 마나 효율을 극대화하는 로브'
            },
            {
                id: 'plate_of_the_immortal',
                name: '불멸자의 판금갑',
                category: 'armor',
                level_req: 39,
                crafting_skill: 'divine_smithing',
                skill_level_req: 22,
                materials: JSON.stringify([
                    { item: 'blessed_plate', quantity: 1 },
                    { item: 'immortal_essence', quantity: 3 },
                    { item: 'divine_metal', quantity: 8 }
                ]),
                result_item: 'plate_of_the_immortal',
                result_rarity: 'legendary',
                result_stats: JSON.stringify({ health: 150, divine_protection: 50, damage_reduction: 25 }),
                success_rate: 30,
                exp_gain: 220,
                description: '신의 축복을 받은 불멸의 갑옷'
            },

            // === 더 많은 액세서리 ===
            // 특수 목걸이
            {
                id: 'charm_of_luck',
                name: '행운의 부적',
                category: 'accessory',
                level_req: 12,
                crafting_skill: 'luck_magic',
                skill_level_req: 6,
                materials: JSON.stringify([
                    { item: 'rabbit_foot', quantity: 4 },
                    { item: 'four_leaf_clover', quantity: 7 },
                    { item: 'fortune_crystal', quantity: 1 }
                ]),
                result_item: 'charm_of_luck',
                result_rarity: 'rare',
                result_stats: JSON.stringify({ luck: 35, critical_chance: 15, drop_rate: 20 }),
                success_rate: 85,
                exp_gain: 30,
                description: '착용자에게 행운을 가져다주는 부적'
            },
            {
                id: 'amulet_of_the_phoenix',
                name: '불사조의 부적',
                category: 'accessory',
                level_req: 33,
                crafting_skill: 'phoenix_magic',
                skill_level_req: 18,
                materials: JSON.stringify([
                    { item: 'phoenix_down', quantity: 5 },
                    { item: 'rebirth_stone', quantity: 2 },
                    { item: 'eternal_flame', quantity: 1 }
                ]),
                result_item: 'amulet_of_the_phoenix',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ health: 60, fire_immunity: 50, resurrection_chance: 10 }),
                success_rate: 45,
                exp_gain: 120,
                description: '죽음에서 되살아날 수 있는 불사조의 부적'
            },

            // 특수 반지
            {
                id: 'ring_of_elements',
                name: '원소의 반지',
                category: 'ring',
                level_req: 25,
                crafting_skill: 'elemental_magic',
                skill_level_req: 14,
                materials: JSON.stringify([
                    { item: 'fire_gem', quantity: 1 },
                    { item: 'water_gem', quantity: 1 },
                    { item: 'earth_gem', quantity: 1 },
                    { item: 'air_gem', quantity: 1 }
                ]),
                result_item: 'ring_of_elements',
                result_rarity: 'epic',
                result_stats: JSON.stringify({ elemental_power: 40, resistance_all: 25 }),
                success_rate: 50,
                exp_gain: 90,
                description: '모든 원소의 힘을 다룰 수 있는 반지'
            },

            // === 더 많은 소비 아이템 ===
            // 고급 물약
            {
                id: 'potion_of_giant_strength',
                name: '거인의 힘 물약',
                category: 'consumable',
                level_req: 20,
                crafting_skill: 'alchemy',
                skill_level_req: 12,
                materials: JSON.stringify([
                    { item: 'giant_blood', quantity: 2 },
                    { item: 'strength_herb', quantity: 6 },
                    { item: 'power_essence', quantity: 3 }
                ]),
                result_item: 'potion_of_giant_strength',
                result_rarity: 'rare',
                success_rate: 70,
                exp_gain: 60,
                description: '일시적으로 거인과 같은 힘을 얻는 물약'
            },
            {
                id: 'elixir_of_dragon_power',
                name: '용의 힘 엘릭서',
                category: 'consumable',
                level_req: 35,
                crafting_skill: 'dragon_alchemy',
                skill_level_req: 20,
                materials: JSON.stringify([
                    { item: 'dragon_blood', quantity: 1 },
                    { item: 'dragon_scale_powder', quantity: 5 },
                    { item: 'ancient_herb', quantity: 3 }
                ]),
                result_item: 'elixir_of_dragon_power',
                result_rarity: 'legendary',
                success_rate: 40,
                exp_gain: 150,
                description: '용의 힘을 일시적으로 얻는 전설의 엘릭서'
            },

            // 특수 음식
            {
                id: 'phoenix_egg_omelet',
                name: '불사조 알 오믈렛',
                category: 'food',
                level_req: 30,
                crafting_skill: 'divine_cooking',
                skill_level_req: 16,
                materials: JSON.stringify([
                    { item: 'phoenix_egg', quantity: 1 },
                    { item: 'holy_milk', quantity: 2 },
                    { item: 'celestial_butter', quantity: 1 }
                ]),
                result_item: 'phoenix_egg_omelet',
                result_rarity: 'epic',
                success_rate: 50,
                exp_gain: 100,
                description: '영원한 생명력을 주는 신성한 요리'
            },
            {
                id: 'feast_of_gods',
                name: '신들의 만찬',
                category: 'food',
                level_req: 42,
                crafting_skill: 'divine_cooking',
                skill_level_req: 25,
                materials: JSON.stringify([
                    { item: 'ambrosia', quantity: 3 },
                    { item: 'nectar', quantity: 2 },
                    { item: 'divine_spice', quantity: 5 }
                ]),
                result_item: 'feast_of_gods',
                result_rarity: 'mythic',
                success_rate: 25,
                exp_gain: 300,
                description: '신들이 먹는다는 전설의 요리'
            },

            // === 더 많은 특수 아이템 ===
            {
                id: 'portal_scroll',
                name: '차원문 주문서',
                category: 'special',
                level_req: 28,
                crafting_skill: 'space_magic',
                skill_level_req: 16,
                materials: JSON.stringify([
                    { item: 'void_parchment', quantity: 1 },
                    { item: 'dimension_crystal', quantity: 3 },
                    { item: 'space_ink', quantity: 2 }
                ]),
                result_item: 'portal_scroll',
                result_rarity: 'epic',
                success_rate: 55,
                exp_gain: 85,
                description: '다른 차원으로 이동할 수 있는 주문서'
            },
            {
                id: 'time_stop_scroll',
                name: '시간 정지 주문서',
                category: 'special',
                level_req: 38,
                crafting_skill: 'time_magic',
                skill_level_req: 22,
                materials: JSON.stringify([
                    { item: 'temporal_parchment', quantity: 1 },
                    { item: 'time_crystal', quantity: 4 },
                    { item: 'chronos_ink', quantity: 2 }
                ]),
                result_item: 'time_stop_scroll',
                result_rarity: 'legendary',
                success_rate: 30,
                exp_gain: 180,
                description: '시간을 정지시킬 수 있는 강력한 주문서'
            },

            // === 더 많은 도구 ===
            {
                id: 'blessed_hoe',
                name: '축복받은 괭이',
                category: 'tool',
                level_req: 18,
                crafting_skill: 'farming_mastery',
                skill_level_req: 10,
                materials: JSON.stringify([
                    { item: 'steel_hoe', quantity: 1 },
                    { item: 'growth_crystal', quantity: 3 },
                    { item: 'nature_blessing', quantity: 2 }
                ]),
                result_item: 'blessed_hoe',
                result_rarity: 'rare',
                success_rate: 80,
                exp_gain: 45,
                description: '작물 성장을 촉진시키는 신성한 괭이'
            },
            {
                id: 'void_hammer',
                name: '공허의 망치',
                category: 'tool',
                level_req: 35,
                crafting_skill: 'void_crafting',
                skill_level_req: 20,
                materials: JSON.stringify([
                    { item: 'master_hammer', quantity: 1 },
                    { item: 'void_essence', quantity: 5 },
                    { item: 'nothing_metal', quantity: 3 }
                ]),
                result_item: 'void_hammer',
                result_rarity: 'legendary',
                success_rate: 40,
                exp_gain: 160,
                description: '무엇이든 무로 돌릴 수 있는 공허의 망치'
            },

            // === 신화급 조합 ===
            {
                id: 'infinity_blade',
                name: '무한의 검',
                category: 'weapon',
                level_req: 50,
                crafting_skill: 'cosmic_smithing',
                skill_level_req: 35,
                materials: JSON.stringify([
                    { item: 'cosmic_metal', quantity: 10 },
                    { item: 'infinity_crystal', quantity: 3 },
                    { item: 'universe_essence', quantity: 5 },
                    { item: 'time_steel', quantity: 7 }
                ]),
                result_item: 'infinity_blade',
                result_rarity: 'mythic',
                success_rate: 15,
                exp_gain: 1000,
                description: '무한한 힘을 가진 우주의 검'
            },
            {
                id: 'armor_of_creation',
                name: '창조의 갑옷',
                category: 'armor',
                level_req: 48,
                crafting_skill: 'divine_creation',
                skill_level_req: 32,
                materials: JSON.stringify([
                    { item: 'creation_essence', quantity: 5 },
                    { item: 'divine_thread', quantity: 20 },
                    { item: 'reality_fabric', quantity: 8 }
                ]),
                result_item: 'armor_of_creation',
                result_rarity: 'mythic',
                success_rate: 10,
                exp_gain: 1200,
                description: '창조의 힘이 깃든 절대적 방어구'
            },
            {
                id: 'ring_of_omnipotence',
                name: '전능의 반지',
                category: 'ring',
                level_req: 55,
                crafting_skill: 'god_crafting',
                skill_level_req: 40,
                materials: JSON.stringify([
                    { item: 'omnipotent_gem', quantity: 1 },
                    { item: 'god_metal', quantity: 5 },
                    { item: 'absolute_power', quantity: 3 }
                ]),
                result_item: 'ring_of_omnipotence',
                result_rarity: 'mythic',
                success_rate: 5,
                exp_gain: 2000,
                description: '모든 것을 할 수 있는 전능의 반지'
            }
        ];
    }

    // 유틸리티 메서드들 (실제 구현시 다른 시스템과 연동 필요)
    async getPlayerItem(playerId, itemId) {
        // 플레이어 인벤토리에서 아이템 조회
        // 실제 구현시 인벤토리 시스템과 연동
        return null;
    }

    async replacePlayerItem(playerId, oldItemId, newItem) {
        // 플레이어 인벤토리의 아이템 교체
        // 실제 구현시 인벤토리 시스템과 연동
    }

    async removePlayerItem(playerId, itemId) {
        // 플레이어 인벤토리에서 아이템 제거
        // 실제 구현시 인벤토리 시스템과 연동
    }

    async addItemToInventory(playerId, item, quantity = 1) {
        // 플레이어 인벤토리에 아이템 추가
        // 실제 구현시 인벤토리 시스템과 연동
    }

    async getSynthesisHistory(playerId) {
        return await this.db.run(
            'SELECT * FROM equipment_synthesis WHERE player_id = ? ORDER BY created_at DESC LIMIT 20',
            [playerId]
        );
    }
}

module.exports = CraftingSystem;
