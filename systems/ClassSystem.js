const { EmbedBuilder } = require('discord.js');

class ClassSystem {
    constructor(database) {
        this.db = database;
        
        // === RPG 직업 시스템 (대폭 확장) ===
        this.classes = [
            // === 기본 전투 직업 ===
            {
                id: 'warrior',
                name: '전사',
                category: 'combat',
                description: '근접 전투에 특화된 용맹한 전사',
                base_stats: { strength: 15, health: 20, agility: 8, intelligence: 5, charm: 7, luck: 10 },
                growth_stats: { strength: 3, health: 4, agility: 1, intelligence: 1, charm: 1, luck: 1 },
                primary_weapon: 'sword',
                secondary_weapon: 'shield',
                class_skills: ['slash', 'shield_bash', 'berserker_rage', 'whirlwind', 'execute'],
                passive_abilities: ['weapon_mastery', 'combat_endurance'],
                unlock_condition: 'default'
            },
            {
                id: 'knight',
                name: '기사',
                category: 'combat',
                description: '명예와 정의를 중시하는 성스러운 기사',
                base_stats: { strength: 14, health: 18, agility: 7, intelligence: 8, charm: 12, luck: 8 },
                growth_stats: { strength: 2, health: 3, agility: 1, intelligence: 2, charm: 2, luck: 1 },
                primary_weapon: 'sword',
                secondary_weapon: 'shield',
                class_skills: ['holy_strike', 'divine_protection', 'righteous_fury', 'blessing_aura'],
                passive_abilities: ['holy_resistance', 'leadership'],
                unlock_condition: { achievement: '정의의 수호자' }
            },
            {
                id: 'berserker',
                name: '광전사',
                category: 'combat',
                description: '분노의 힘으로 싸우는 야만적인 전사',
                base_stats: { strength: 18, health: 15, agility: 12, intelligence: 4, charm: 5, luck: 8 },
                growth_stats: { strength: 4, health: 2, agility: 2, intelligence: 0, charm: 0, luck: 1 },
                primary_weapon: 'axe',
                secondary_weapon: 'none',
                class_skills: ['rage', 'blood_frenzy', 'intimidate', 'rampage'],
                passive_abilities: ['fury_mode', 'pain_resistance'],
                unlock_condition: { level: 15, stat_requirement: { strength: 50 } }
            },
            {
                id: 'paladin',
                name: '성기사',
                category: 'hybrid',
                description: '신성한 힘과 무력을 겸비한 성스러운 전사',
                base_stats: { strength: 13, health: 16, agility: 6, intelligence: 10, charm: 14, luck: 9 },
                growth_stats: { strength: 2, health: 3, agility: 1, intelligence: 2, charm: 3, luck: 1 },
                primary_weapon: 'mace',
                secondary_weapon: 'shield',
                class_skills: ['smite', 'heal', 'consecration', 'divine_favor'],
                passive_abilities: ['undead_bane', 'holy_aura'],
                unlock_condition: { quest: '신성한 시련' }
            },

            // === 마법 직업 ===
            {
                id: 'mage',
                name: '마법사',
                category: 'magic',
                description: '강력한 마법을 다루는 지식의 탐구자',
                base_stats: { strength: 5, health: 8, agility: 7, intelligence: 20, charm: 10, luck: 12 },
                growth_stats: { strength: 1, health: 1, agility: 1, intelligence: 4, charm: 1, luck: 2 },
                primary_weapon: 'staff',
                secondary_weapon: 'tome',
                class_skills: ['fireball', 'ice_shard', 'lightning_bolt', 'meteor', 'time_stop'],
                passive_abilities: ['mana_efficiency', 'spell_power'],
                unlock_condition: 'default'
            },
            {
                id: 'wizard',
                name: '마법사 (상급)',
                category: 'magic',
                description: '고등 마법을 마스터한 현자',
                base_stats: { strength: 4, health: 10, agility: 8, intelligence: 25, charm: 12, luck: 15 },
                growth_stats: { strength: 0, health: 1, agility: 1, intelligence: 5, charm: 2, luck: 2 },
                primary_weapon: 'arcane_staff',
                secondary_weapon: 'grimoire',
                class_skills: ['arcane_orb', 'reality_rift', 'time_manipulation', 'world_end'],
                passive_abilities: ['arcane_mastery', 'spell_immunity'],
                unlock_condition: { class_evolution: 'mage', level: 30 }
            },
            {
                id: 'elementalist',
                name: '원소술사',
                category: 'magic',
                description: '원소의 힘을 자유자재로 다루는 마법사',
                base_stats: { strength: 6, health: 9, agility: 9, intelligence: 18, charm: 8, luck: 10 },
                growth_stats: { strength: 1, health: 1, agility: 2, intelligence: 4, charm: 1, luck: 1 },
                primary_weapon: 'elemental_orb',
                secondary_weapon: 'none',
                class_skills: ['fire_storm', 'ice_age', 'lightning_tempest', 'earth_quake'],
                passive_abilities: ['elemental_affinity', 'element_resistance'],
                unlock_condition: { achievement: '원소의 마스터' }
            },
            {
                id: 'necromancer',
                name: '네크로맨서',
                category: 'dark_magic',
                description: '죽음의 마법을 다루는 금기의 술사',
                base_stats: { strength: 4, health: 7, agility: 6, intelligence: 19, charm: 3, luck: 8 },
                growth_stats: { strength: 1, health: 1, agility: 1, intelligence: 4, charm: -1, luck: 2 },
                primary_weapon: 'bone_staff',
                secondary_weapon: 'skull',
                class_skills: ['raise_dead', 'soul_drain', 'death_coil', 'bone_prison'],
                passive_abilities: ['undead_command', 'life_drain'],
                unlock_condition: { dungeon_clear: '죽음의 계곡', alignment: 'evil' }
            },

            // === 원거리 직업 ===
            {
                id: 'archer',
                name: '궁수',
                category: 'ranged',
                description: '정확한 사격으로 적을 제압하는 원거리 전사',
                base_stats: { strength: 8, health: 10, agility: 18, intelligence: 7, charm: 9, luck: 15 },
                growth_stats: { strength: 1, health: 2, agility: 4, intelligence: 1, charm: 1, luck: 2 },
                primary_weapon: 'bow',
                secondary_weapon: 'quiver',
                class_skills: ['precise_shot', 'multi_shot', 'explosive_arrow', 'arrow_rain'],
                passive_abilities: ['eagle_eye', 'steady_aim'],
                unlock_condition: 'default'
            },
            {
                id: 'ranger',
                name: '레인저',
                category: 'ranged',
                description: '자연과 하나되어 싸우는 숲의 수호자',
                base_stats: { strength: 10, health: 12, agility: 16, intelligence: 9, charm: 8, luck: 12 },
                growth_stats: { strength: 2, health: 2, agility: 3, intelligence: 2, charm: 1, luck: 2 },
                primary_weapon: 'composite_bow',
                secondary_weapon: 'hunting_knife',
                class_skills: ['animal_companion', 'track', 'camouflage', 'nature_magic'],
                passive_abilities: ['forest_movement', 'animal_friendship'],
                unlock_condition: { achievement: '자연의 친구' }
            },
            {
                id: 'sniper',
                name: '저격수',
                category: 'ranged',
                description: '한 발의 완벽한 사격으로 승부하는 정밀사수',
                base_stats: { strength: 7, health: 8, agility: 20, intelligence: 12, charm: 6, luck: 18 },
                growth_stats: { strength: 1, health: 1, agility: 4, intelligence: 2, charm: 0, luck: 3 },
                primary_weapon: 'sniper_bow',
                secondary_weapon: 'scope',
                class_skills: ['headshot', 'perfect_aim', 'stealth_shot', 'critical_strike'],
                passive_abilities: ['perfect_accuracy', 'one_shot_one_kill'],
                unlock_condition: { level: 25, stat_requirement: { agility: 80, luck: 60 } }
            },

            // === 은밀 직업 ===
            {
                id: 'rogue',
                name: '도적',
                category: 'stealth',
                description: '은밀함과 빠른 손놀림으로 승부하는 그림자의 전사',
                base_stats: { strength: 10, health: 9, agility: 17, intelligence: 8, charm: 7, luck: 16 },
                growth_stats: { strength: 2, health: 1, agility: 4, intelligence: 1, charm: 1, luck: 3 },
                primary_weapon: 'dagger',
                secondary_weapon: 'throwing_knife',
                class_skills: ['backstab', 'poison_blade', 'shadow_step', 'assassinate'],
                passive_abilities: ['stealth_mastery', 'critical_hit'],
                unlock_condition: 'default'
            },
            {
                id: 'assassin',
                name: '암살자',
                category: 'stealth',
                description: '완벽한 암살 기술을 보유한 그림자의 달인',
                base_stats: { strength: 12, health: 8, agility: 19, intelligence: 10, charm: 5, luck: 18 },
                growth_stats: { strength: 2, health: 1, agility: 5, intelligence: 2, charm: 0, luck: 3 },
                primary_weapon: 'assassin_blade',
                secondary_weapon: 'poison_vial',
                class_skills: ['silent_kill', 'poison_mastery', 'shadow_clone', 'death_mark'],
                passive_abilities: ['killing_intent', 'poison_immunity'],
                unlock_condition: { class_evolution: 'rogue', level: 20, quest: '암살자 길드 입문' }
            },
            {
                id: 'ninja',
                name: '닌자',
                category: 'stealth',
                description: '동양의 신비한 인술을 구사하는 그림자 전사',
                base_stats: { strength: 11, health: 10, agility: 18, intelligence: 12, charm: 8, luck: 14 },
                growth_stats: { strength: 2, health: 2, agility: 4, intelligence: 2, charm: 1, luck: 2 },
                primary_weapon: 'katana',
                secondary_weapon: 'shuriken',
                class_skills: ['ninjutsu', 'shadow_substitution', 'fire_jutsu', 'teleportation'],
                passive_abilities: ['ninjutsu_mastery', 'shadow_movement'],
                unlock_condition: { achievement: '동양의 신비', level: 30 }
            },

            // === 지원 직업 ===
            {
                id: 'priest',
                name: '성직자',
                category: 'support',
                description: '신의 은총으로 동료를 치유하고 보호하는 성스러운 치료사',
                base_stats: { strength: 6, health: 12, agility: 5, intelligence: 15, charm: 18, luck: 12 },
                growth_stats: { strength: 1, health: 2, agility: 1, intelligence: 3, charm: 4, luck: 2 },
                primary_weapon: 'holy_staff',
                secondary_weapon: 'holy_symbol',
                class_skills: ['heal', 'holy_light', 'blessing', 'resurrection'],
                passive_abilities: ['divine_protection', 'mana_regeneration'],
                unlock_condition: 'default'
            },
            {
                id: 'cleric',
                name: '성전사',
                category: 'hybrid',
                description: '치유와 전투를 겸비한 신의 전사',
                base_stats: { strength: 11, health: 14, agility: 7, intelligence: 13, charm: 16, luck: 10 },
                growth_stats: { strength: 2, health: 3, agility: 1, intelligence: 2, charm: 3, luck: 1 },
                primary_weapon: 'war_hammer',
                secondary_weapon: 'shield',
                class_skills: ['divine_strike', 'mass_heal', 'turn_undead', 'divine_wrath'],
                passive_abilities: ['battle_priest', 'divine_favor'],
                unlock_condition: { class_evolution: 'priest', level: 15 }
            },
            {
                id: 'druid',
                name: '드루이드',
                category: 'nature',
                description: '자연의 힘을 빌려 마법을 사용하는 자연의 수호자',
                base_stats: { strength: 8, health: 13, agility: 10, intelligence: 16, charm: 12, luck: 13 },
                growth_stats: { strength: 1, health: 2, agility: 2, intelligence: 3, charm: 2, luck: 2 },
                primary_weapon: 'nature_staff',
                secondary_weapon: 'animal_companion',
                class_skills: ['nature_magic', 'animal_form', 'entangle', 'storm_call'],
                passive_abilities: ['nature_communion', 'shape_shift'],
                unlock_condition: { achievement: '자연과의 조화' }
            },

            // === 고급/특수 직업 ===
            {
                id: 'demon_hunter',
                name: '악마사냥꾼',
                category: 'special',
                description: '악마를 사냥하기 위해 악마의 힘을 빌린 복수자',
                base_stats: { strength: 14, health: 11, agility: 16, intelligence: 11, charm: 6, luck: 12 },
                growth_stats: { strength: 3, health: 2, agility: 3, intelligence: 2, charm: 0, luck: 2 },
                primary_weapon: 'demon_blade',
                secondary_weapon: 'cursed_crossbow',
                class_skills: ['demon_sight', 'soul_burn', 'demonic_power', 'banish'],
                passive_abilities: ['demon_resistance', 'demonic_contract'],
                unlock_condition: { boss_kill: '대악마', level: 35 }
            },
            {
                id: 'dragon_knight',
                name: '드래곤 나이트',
                category: 'legendary',
                description: '용과 계약을 맺은 전설의 기사',
                base_stats: { strength: 16, health: 18, agility: 12, intelligence: 14, charm: 15, luck: 16 },
                growth_stats: { strength: 3, health: 3, agility: 2, intelligence: 2, charm: 2, luck: 3 },
                primary_weapon: 'dragon_lance',
                secondary_weapon: 'dragon_scale_shield',
                class_skills: ['dragon_breath', 'dragon_flight', 'dragon_roar', 'dragon_bond'],
                passive_abilities: ['dragon_soul', 'fire_immunity'],
                unlock_condition: { dragon_contract: '고대 용', level: 40 }
            },
            {
                id: 'time_mage',
                name: '시간술사',
                category: 'temporal',
                description: '시간을 조작하는 금기의 마법을 다루는 술사',
                base_stats: { strength: 5, health: 9, agility: 11, intelligence: 22, charm: 10, luck: 20 },
                growth_stats: { strength: 0, health: 1, agility: 2, intelligence: 5, charm: 1, luck: 4 },
                primary_weapon: 'temporal_staff',
                secondary_weapon: 'time_crystal',
                class_skills: ['time_stop', 'temporal_rewind', 'future_sight', 'age_manipulation'],
                passive_abilities: ['temporal_immunity', 'precognition'],
                unlock_condition: { special_quest: '시간의 비밀', level: 45 }
            },
            {
                id: 'void_walker',
                name: '공허행자',
                category: 'void',
                description: '공허의 힘을 다루는 위험한 존재',
                base_stats: { strength: 13, health: 10, agility: 15, intelligence: 18, charm: 4, luck: 25 },
                growth_stats: { strength: 2, health: 1, agility: 3, intelligence: 4, charm: -1, luck: 5 },
                primary_weapon: 'void_blade',
                secondary_weapon: 'void_orb',
                class_skills: ['void_step', 'reality_tear', 'existence_drain', 'void_portal'],
                passive_abilities: ['void_resistance', 'reality_manipulation'],
                unlock_condition: { special_event: '공허와의 조우', sanity_cost: 50 }
            },
            {
                id: 'god_slayer',
                name: '신살자',
                category: 'ultimate',
                description: '신을 죽일 수 있는 절대적 힘을 가진 존재',
                base_stats: { strength: 20, health: 20, agility: 20, intelligence: 20, charm: 10, luck: 30 },
                growth_stats: { strength: 5, health: 5, agility: 5, intelligence: 5, charm: 2, luck: 6 },
                primary_weapon: 'god_killer_blade',
                secondary_weapon: 'divine_essence',
                class_skills: ['divine_slayer', 'god_killer', 'absolute_power', 'divine_transcendence'],
                passive_abilities: ['divine_immunity', 'god_slaying_aura'],
                unlock_condition: { god_kill: '창조신', level: 80, all_stats: 100 }
            }
        ];
    }

    async initializeClassSystem() {
        // 직업 테이블 생성
        await this.db.query(`
            CREATE TABLE IF NOT EXISTS player_classes (
                player_id TEXT PRIMARY KEY,
                current_class TEXT NOT NULL DEFAULT 'warrior',
                unlocked_classes TEXT DEFAULT '["warrior","mage","archer","rogue","priest"]',
                class_level INTEGER DEFAULT 1,
                class_exp INTEGER DEFAULT 0,
                total_class_changes INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 직업별 스킬 테이블
        await this.db.query(`
            CREATE TABLE IF NOT EXISTS player_class_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                class_id TEXT NOT NULL,
                skill_id TEXT NOT NULL,
                skill_level INTEGER DEFAULT 1,
                skill_exp INTEGER DEFAULT 0,
                learned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(player_id, class_id, skill_id)
            )
        `);

        console.log('직업 시스템이 초기화되었습니다.');
    }

    async getPlayerClass(playerId) {
        const result = await this.db.query(
            'SELECT * FROM player_classes WHERE player_id = ?',
            [playerId]
        );

        if (result.length === 0) {
            // 새 플레이어는 기본 직업 설정
            await this.db.query(
                'INSERT INTO player_classes (player_id) VALUES (?)',
                [playerId]
            );
            return {
                player_id: playerId,
                current_class: 'warrior',
                unlocked_classes: ['warrior', 'mage', 'archer', 'rogue', 'priest'],
                class_level: 1,
                class_exp: 0,
                total_class_changes: 0
            };
        }

        const classData = result[0];
        classData.unlocked_classes = JSON.parse(classData.unlocked_classes || '[]');
        return classData;
    }

    async changeClass(playerId, newClassId) {
        const playerClass = await this.getPlayerClass(playerId);
        const targetClass = this.classes.find(c => c.id === newClassId);

        if (!targetClass) {
            return { success: false, message: '존재하지 않는 직업입니다.' };
        }

        if (!playerClass.unlocked_classes.includes(newClassId)) {
            return { success: false, message: '아직 해금되지 않은 직업입니다.' };
        }

        if (playerClass.current_class === newClassId) {
            return { success: false, message: '이미 해당 직업입니다.' };
        }

        await this.db.query(`
            UPDATE player_classes 
            SET current_class = ?, 
                total_class_changes = total_class_changes + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE player_id = ?
        `, [newClassId, playerId]);

        return { 
            success: true, 
            message: `${targetClass.name}로 직업을 변경했습니다!`,
            class: targetClass
        };
    }

    getClassInfo(classId) {
        return this.classes.find(c => c.id === classId);
    }

    async checkClassUnlocks(playerId, playerStats) {
        const playerClass = await this.getPlayerClass(playerId);
        const newUnlocks = [];

        for (const gameClass of this.classes) {
            if (playerClass.unlocked_classes.includes(gameClass.id)) continue;

            let canUnlock = false;
            const condition = gameClass.unlock_condition;

            if (condition === 'default') {
                canUnlock = true;
            } else if (condition.level && playerStats.level >= condition.level) {
                canUnlock = true;
            } else if (condition.stat_requirement) {
                canUnlock = Object.entries(condition.stat_requirement).every(
                    ([stat, value]) => playerStats[stat] >= value
                );
            }
            // 추가 조건들 (퀘스트, 업적 등)은 다른 시스템과 연동하여 체크

            if (canUnlock) {
                playerClass.unlocked_classes.push(gameClass.id);
                newUnlocks.push(gameClass);
            }
        }

        if (newUnlocks.length > 0) {
            await this.db.query(`
                UPDATE player_classes 
                SET unlocked_classes = ?, updated_at = CURRENT_TIMESTAMP
                WHERE player_id = ?
            `, [JSON.stringify(playerClass.unlocked_classes), playerId]);
        }

        return newUnlocks;
    }
}

module.exports = ClassSystem;



