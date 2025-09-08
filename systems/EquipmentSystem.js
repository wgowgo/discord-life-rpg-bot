const { EmbedBuilder } = require('discord.js');

class EquipmentSystem {
    constructor(database) {
        this.db = database;
        this.equipmentSlots = ['weapon', 'helmet', 'armor', 'gloves', 'boots', 'accessory1', 'accessory2', 'ring1', 'ring2'];
        this.equipmentTypes = [
            // === 기본 무기 (상점 구매 가능) ===
            { name: '나무 검', category: 'weapon', rarity: 'common', level_req: 1, price: 5000, stats: JSON.stringify({strength: 5, agility: 2}), description: '초보자용 나무 검', source: 'shop' },
            { name: '강철 검', category: 'weapon', rarity: 'common', level_req: 5, price: 25000, stats: JSON.stringify({strength: 12, agility: 5}), description: '튼튼한 강철 검', source: 'shop' },
            { name: '청동 단검', category: 'weapon', rarity: 'common', level_req: 3, price: 15000, stats: JSON.stringify({agility: 10, luck: 5}), description: '기본적인 청동 단검', source: 'shop' },
            { name: '철 도끼', category: 'weapon', rarity: 'common', level_req: 8, price: 35000, stats: JSON.stringify({strength: 18, health: 8}), description: '무거운 철 도끼', source: 'shop' },
            { name: '사냥용 활', category: 'weapon', rarity: 'common', level_req: 4, price: 20000, stats: JSON.stringify({agility: 15, luck: 8}), description: '기본적인 사냥용 활', source: 'shop' },
            { name: '견습 지팡이', category: 'weapon', rarity: 'common', level_req: 2, price: 12000, stats: JSON.stringify({intelligence: 12, charm: 6}), description: '견습 마법사의 지팡이', source: 'shop' },
            
            // === 희귀 무기 (특별 획득) ===
            { name: '미스릴 검', category: 'weapon', rarity: 'rare', level_req: 15, price: 0, stats: JSON.stringify({strength: 25, agility: 15}), description: '마법이 깃든 미스릴 검', source: 'crafting', craft_materials: ['mithril_ore:3', 'magic_crystal:1'] },
            { name: '바람의 검', category: 'weapon', rarity: 'rare', level_req: 18, price: 0, stats: JSON.stringify({strength: 22, agility: 28, luck: 12}), description: '바람의 속도를 가진 검', source: 'dungeon', dungeon_name: '바람의 동굴' },
            { name: '저주받은 검', category: 'weapon', rarity: 'rare', level_req: 20, price: 0, stats: JSON.stringify({strength: 35, charm: -10, luck: 15}), description: '강력하지만 저주가 깃든 검', source: 'boss', boss_name: '저주받은 기사' },
            { name: '달빛 단검', category: 'weapon', rarity: 'rare', level_req: 16, price: 0, stats: JSON.stringify({agility: 30, luck: 20, charm: 8}), description: '달빛에 빛나는 신비한 단검', source: 'mining', mine_name: '달빛 동굴' },
            
            // === 영웅 무기 (고난이도 획득) ===
            { name: '용의 검', category: 'weapon', rarity: 'epic', level_req: 30, price: 0, stats: JSON.stringify({strength: 50, agility: 25, luck: 10}), description: '용의 힘이 깃든 전설의 검', source: 'boss', boss_name: '고대 용' },
            { name: '얼음의 창', category: 'weapon', rarity: 'epic', level_req: 28, price: 0, stats: JSON.stringify({strength: 45, intelligence: 20, agility: 15}), description: '영원히 얼지 않는 얼음 창', source: 'dungeon', dungeon_name: '얼음 여왕의 궁전' },
            { name: '천둥의 망치', category: 'weapon', rarity: 'epic', level_req: 32, price: 0, stats: JSON.stringify({strength: 60, health: 30, luck: 12}), description: '천둥번개의 힘을 담은 망치', source: 'achievement', achievement_name: '천둥신의 인정' },
            { name: '그림자 활', category: 'weapon', rarity: 'epic', level_req: 35, price: 0, stats: JSON.stringify({agility: 55, luck: 35, intelligence: 15}), description: '그림자에서 나타나는 신비한 활', source: 'crafting', craft_materials: ['shadow_essence:2', 'void_crystal:1', 'ancient_wood:5'] },
            { name: '현자의 스태프', category: 'weapon', rarity: 'epic', level_req: 33, price: 0, stats: JSON.stringify({intelligence: 65, charm: 35, luck: 20}), description: '수많은 지식이 담긴 현자의 지팡이', source: 'quest', quest_name: '현자의 시험' },
            
            // === 전설 무기 (최고 난이도) ===
            { name: '신성한 성검', category: 'weapon', rarity: 'legendary', level_req: 50, price: 0, stats: JSON.stringify({strength: 100, agility: 50, luck: 30}), description: '신이 내린 성스러운 검', source: 'raid', raid_name: '천상계 침입' },
            { name: '세계수의 활', category: 'weapon', rarity: 'legendary', level_req: 48, price: 0, stats: JSON.stringify({agility: 90, luck: 60, intelligence: 40}), description: '세계수의 가지로 만든 신성한 활', source: 'world_boss', boss_name: '세계수 수호자' },
            { name: '창조의 지팡이', category: 'weapon', rarity: 'legendary', level_req: 52, price: 0, stats: JSON.stringify({intelligence: 120, charm: 70, strength: 20}), description: '세상을 창조할 수 있는 신의 지팡이', source: 'ultimate_quest', quest_name: '창조신의 시련' },
            { name: '파멸의 낫', category: 'weapon', rarity: 'legendary', level_req: 55, price: 0, stats: JSON.stringify({strength: 110, agility: 60, charm: -30, luck: 40}), description: '모든 것을 파멸로 이끄는 죽음의 낫', source: 'secret_boss', boss_name: '사신' },
            
            // === 신화 무기 (유일무이) ===
            { name: '영원의 검', category: 'weapon', rarity: 'mythic', level_req: 60, price: 0, stats: JSON.stringify({strength: 150, agility: 100, intelligence: 50, health: 50, charm: 50, luck: 100}), description: '시간을 초월한 영원의 힘을 담은 검', source: 'unique_event', event_name: '시공간의 균열' },
            { name: '무한의 활', category: 'weapon', rarity: 'mythic', level_req: 58, price: 0, stats: JSON.stringify({agility: 120, luck: 150, intelligence: 80, strength: 30, charm: 70}), description: '무한한 가능성을 쏘아내는 활', source: 'unique_craft', materials: ['infinite_crystal:1', 'time_essence:3', 'space_fragment:5'] },
            
            // === 기본 방어구 (상점 구매) ===
            { name: '가죽 모자', category: 'helmet', rarity: 'common', level_req: 1, price: 3000, stats: JSON.stringify({health: 5, agility: 3}), description: '기본적인 가죽 모자', source: 'shop' },
            { name: '강철 투구', category: 'helmet', rarity: 'common', level_req: 8, price: 20000, stats: JSON.stringify({health: 15, strength: 5}), description: '견고한 강철 투구', source: 'shop' },
            { name: '가죽 갑옷', category: 'armor', rarity: 'common', level_req: 1, price: 8000, stats: JSON.stringify({health: 15, agility: 5}), description: '기본적인 가죽 갑옷', source: 'shop' },
            { name: '사슬 갑옷', category: 'armor', rarity: 'common', level_req: 10, price: 40000, stats: JSON.stringify({health: 35, strength: 10}), description: '사슬로 엮은 갑옷', source: 'shop' },
            { name: '가죽 장갑', category: 'gloves', rarity: 'common', level_req: 1, price: 2000, stats: JSON.stringify({agility: 5}), description: '기본적인 가죽 장갑', source: 'shop' },
            { name: '가죽 부츠', category: 'boots', rarity: 'common', level_req: 1, price: 3000, stats: JSON.stringify({agility: 8, health: 5}), description: '기본적인 가죽 부츠', source: 'shop' },
            
            // === 희귀 방어구 (특별 획득) ===
            { name: '기사 투구', category: 'helmet', rarity: 'rare', level_req: 18, price: 0, stats: JSON.stringify({health: 30, strength: 15, charm: 10}), description: '기사의 위엄있는 투구', source: 'achievement', achievement_name: '기사도 정신' },
            { name: '마법사 모자', category: 'helmet', rarity: 'rare', level_req: 15, price: 0, stats: JSON.stringify({intelligence: 25, charm: 15}), description: '마법사의 뾰족한 모자', source: 'crafting', craft_materials: ['magic_fabric:3', 'wisdom_crystal:1'] },
            { name: '도적 두건', category: 'helmet', rarity: 'rare', level_req: 12, price: 0, stats: JSON.stringify({agility: 25, luck: 18}), description: '은밀함을 돕는 두건', source: 'dungeon', dungeon_name: '도적들의 소굴' },
            { name: '강철 갑옷', category: 'armor', rarity: 'rare', level_req: 20, price: 0, stats: JSON.stringify({health: 70, strength: 25}), description: '견고한 강철 판금 갑옷', source: 'crafting', craft_materials: ['steel_ingot:8', 'reinforcement_crystal:2'] },
            { name: '마법사 로브', category: 'armor', rarity: 'rare', level_req: 15, price: 0, stats: JSON.stringify({intelligence: 35, charm: 20}), description: '마법이 깃든 로브', source: 'boss', boss_name: '대마법사' },
            { name: '도적 복장', category: 'armor', rarity: 'rare', level_req: 16, price: 0, stats: JSON.stringify({agility: 30, luck: 22}), description: '은밀한 활동에 적합한 복장', source: 'mining', mine_name: '그림자 광산' },
            
            // === 영웅 방어구 ===
            { name: '용 투구', category: 'helmet', rarity: 'epic', level_req: 35, price: 0, stats: JSON.stringify({health: 60, strength: 25, luck: 15}), description: '용의 머리를 본뜬 투구', source: 'boss', boss_name: '화염 드래곤' },
            { name: '기사 갑옷', category: 'armor', rarity: 'epic', level_req: 30, price: 0, stats: JSON.stringify({health: 120, strength: 40, charm: 20}), description: '성스러운 기사의 갑옷', source: 'quest', quest_name: '성기사의 맹세' },
            { name: '대마법사 로브', category: 'armor', rarity: 'epic', level_req: 38, price: 0, stats: JSON.stringify({intelligence: 80, charm: 45}), description: '대마법사의 화려한 로브', source: 'crafting', craft_materials: ['arcane_fabric:5', 'grand_magic_crystal:2', 'celestial_thread:3'] },
            { name: '암살자 복장', category: 'armor', rarity: 'epic', level_req: 35, price: 0, stats: JSON.stringify({agility: 60, luck: 40}), description: '완벽한 은신을 위한 복장', source: 'achievement', achievement_name: '완벽한 암살자' },
            
            // === 전설 방어구 ===
            { name: '신성한 왕관', category: 'helmet', rarity: 'legendary', level_req: 50, price: 0, stats: JSON.stringify({health: 100, charm: 50, intelligence: 30}), description: '신성한 힘이 깃든 왕관', source: 'raid', raid_name: '고대 왕국의 부활' },
            { name: '용린 갑옷', category: 'armor', rarity: 'legendary', level_req: 45, price: 0, stats: JSON.stringify({health: 200, strength: 70, luck: 30}), description: '용의 비늘로 만든 전설의 갑옷', source: 'world_boss', boss_name: '고대 용왕' },
            { name: '영웅의 갑옷', category: 'armor', rarity: 'legendary', level_req: 50, price: 0, stats: JSON.stringify({health: 250, strength: 100, charm: 50}), description: '영웅이 착용했던 전설의 갑옷', source: 'ultimate_quest', quest_name: '영웅의 유산' },
            
            // === 무기에 내재된 스킬/패시브가 있는 특별 장비 ===
            // 전설 무기 (스킬 내재)
            { name: '빛의 검', category: 'weapon', rarity: 'legendary', level_req: 45, price: 0, stats: JSON.stringify({strength: 90, charm: 40, luck: 25}), description: '빛의 힘이 깃든 신성한 검', source: 'raid', raid_name: '빛의 성전', passive_skill: 'light_aura', active_skill: 'divine_slash' },
            { name: '어둠의 검', category: 'weapon', rarity: 'legendary', level_req: 45, price: 0, stats: JSON.stringify({strength: 95, agility: 35, charm: -20}), description: '어둠의 힘이 깃든 사악한 검', source: 'boss', boss_name: '어둠의 군주', passive_skill: 'shadow_strike', active_skill: 'darkness_wave' },
            { name: '시간의 검', category: 'weapon', rarity: 'legendary', level_req: 48, price: 0, stats: JSON.stringify({strength: 85, agility: 60, intelligence: 30}), description: '시간을 자르는 신비한 검', source: 'temporal_dungeon', passive_skill: 'time_cut', active_skill: 'temporal_slash' },
            { name: '공간의 검', category: 'weapon', rarity: 'legendary', level_req: 50, price: 0, stats: JSON.stringify({strength: 88, agility: 55, luck: 35}), description: '공간을 베는 차원의 검', source: 'dimension_rift', passive_skill: 'space_rend', active_skill: 'dimensional_cut' },
            { name: '생명의 검', category: 'weapon', rarity: 'legendary', level_req: 47, price: 0, stats: JSON.stringify({strength: 80, health: 100, charm: 30}), description: '생명력이 넘치는 자연의 검', source: 'world_tree', passive_skill: 'life_steal', active_skill: 'nature_blessing' },
            { name: '죽음의 검', category: 'weapon', rarity: 'legendary', level_req: 52, price: 0, stats: JSON.stringify({strength: 110, agility: 45, charm: -30}), description: '죽음의 신이 내린 저주받은 검', source: 'death_realm', passive_skill: 'death_touch', active_skill: 'soul_reaper' },
            
            // 신화 무기 (다중 스킬)
            { name: '운명의 검', category: 'weapon', rarity: 'mythic', level_req: 55, price: 0, stats: JSON.stringify({strength: 130, agility: 80, intelligence: 50, luck: 70}), description: '운명을 바꿀 수 있는 절대적 힘의 검', source: 'fate_trial', passive_skill: 'fate_control', active_skill: 'destiny_strike', special_skill: 'rewrite_fate' },
            { name: '창조와 파괴의 검', category: 'weapon', rarity: 'mythic', level_req: 60, price: 0, stats: JSON.stringify({strength: 140, intelligence: 90, health: 80, charm: 60}), description: '창조와 파괴의 양면성을 가진 궁극의 검', source: 'cosmic_balance', passive_skill: 'dual_nature', active_skill: 'creation_destruction', special_skill: 'cosmic_balance' },
            
            // 마법 무기 (지팡이)
            { name: '원소의 지팡이', category: 'weapon', rarity: 'epic', level_req: 35, price: 0, stats: JSON.stringify({intelligence: 70, charm: 30, luck: 20}), description: '모든 원소를 다루는 마법사의 지팡이', source: 'elemental_tower', passive_skill: 'elemental_mastery', active_skill: 'elemental_storm' },
            { name: '시공의 지팡이', category: 'weapon', rarity: 'legendary', level_req: 50, price: 0, stats: JSON.stringify({intelligence: 110, agility: 40, luck: 45}), description: '시간과 공간을 조작하는 지팡이', source: 'spacetime_nexus', passive_skill: 'spacetime_control', active_skill: 'reality_warp' },
            { name: '무한의 지팡이', category: 'weapon', rarity: 'mythic', level_req: 58, price: 0, stats: JSON.stringify({intelligence: 150, charm: 80, luck: 60, health: 50}), description: '무한한 마법력을 가진 신의 지팡이', source: 'infinity_realm', passive_skill: 'infinite_mana', active_skill: 'reality_break', special_skill: 'omnipotence' },
            
            // 특수 활
            { name: '천사의 활', category: 'weapon', rarity: 'legendary', level_req: 46, price: 0, stats: JSON.stringify({agility: 95, luck: 50, charm: 40}), description: '천사가 사용했던 신성한 활', source: 'heaven_gate', passive_skill: 'holy_arrows', active_skill: 'angel_shot' },
            { name: '악마의 활', category: 'weapon', rarity: 'legendary', level_req: 48, price: 0, stats: JSON.stringify({agility: 100, strength: 30, luck: 45}), description: '악마의 힘이 깃든 저주받은 활', source: 'hell_gate', passive_skill: 'cursed_arrows', active_skill: 'demon_shot' },
            { name: '별의 활', category: 'weapon', rarity: 'mythic', level_req: 56, price: 0, stats: JSON.stringify({agility: 120, intelligence: 60, luck: 80, charm: 50}), description: '별빛으로 만들어진 우주의 활', source: 'stellar_observatory', passive_skill: 'star_guidance', active_skill: 'meteor_rain', special_skill: 'constellation_strike' },
            
            // 특수 도끼/망치
            { name: '천둥의 도끼', category: 'weapon', rarity: 'epic', level_req: 32, price: 0, stats: JSON.stringify({strength: 80, agility: 25, luck: 30}), description: '천둥의 힘이 깃든 도끼', source: 'storm_peak', passive_skill: 'lightning_edge', active_skill: 'thunder_split' },
            { name: '대지의 망치', category: 'weapon', rarity: 'epic', level_req: 35, price: 0, stats: JSON.stringify({strength: 85, health: 40, luck: 20}), description: '대지의 힘을 담은 거대한 망치', source: 'earth_core', passive_skill: 'earth_shaker', active_skill: 'seismic_slam' },
            { name: '신의 망치', category: 'weapon', rarity: 'legendary', level_req: 52, price: 0, stats: JSON.stringify({strength: 115, health: 70, charm: 50}), description: '신이 직접 제작한 신성한 망치', source: 'divine_forge', passive_skill: 'divine_power', active_skill: 'gods_judgment' },
            
            // === 방어구 대폭 확장 ===
            // 특수 투구들
            { name: '지혜의 왕관', category: 'helmet', rarity: 'epic', level_req: 30, price: 0, stats: JSON.stringify({intelligence: 50, charm: 30, luck: 25}), description: '고대 현자의 지혜가 담긴 왕관', source: 'wisdom_temple', passive_skill: 'knowledge_boost' },
            { name: '용의 왕관', category: 'helmet', rarity: 'legendary', level_req: 45, price: 0, stats: JSON.stringify({strength: 40, health: 80, charm: 40}), description: '용왕의 위엄이 담긴 왕관', source: 'dragon_throne', passive_skill: 'dragon_majesty', active_skill: 'dragons_roar' },
            { name: '시간의 투구', category: 'helmet', rarity: 'legendary', level_req: 48, price: 0, stats: JSON.stringify({intelligence: 60, agility: 35, luck: 30}), description: '시간의 흐름을 보는 투구', source: 'temporal_observatory', passive_skill: 'time_sight', active_skill: 'temporal_shield' },
            { name: '무한의 왕관', category: 'helmet', rarity: 'mythic', level_req: 55, price: 0, stats: JSON.stringify({intelligence: 80, strength: 60, health: 70, charm: 60}), description: '무한한 권능의 상징', source: 'infinity_throne', passive_skill: 'infinite_wisdom', active_skill: 'omniscience' },
            
            // 특수 갑옷들 (패시브 스킬 보유)
            { name: '원소의 로브', category: 'armor', rarity: 'epic', level_req: 32, price: 0, stats: JSON.stringify({intelligence: 60, health: 50, luck: 25}), description: '모든 원소에 친화적인 로브', source: 'elemental_council', passive_skill: 'elemental_resistance' },
            { name: '그림자 망토', category: 'armor', rarity: 'epic', level_req: 28, price: 0, stats: JSON.stringify({agility: 70, luck: 40, charm: -10}), description: '그림자에 숨을 수 있는 망토', source: 'shadow_guild', passive_skill: 'shadow_blend', active_skill: 'vanish' },
            { name: '빛의 갑옷', category: 'armor', rarity: 'legendary', level_req: 46, price: 0, stats: JSON.stringify({health: 180, charm: 60, strength: 40}), description: '신성한 빛으로 만든 갑옷', source: 'celestial_forge', passive_skill: 'light_barrier', active_skill: 'purification_aura' },
            { name: '용의 갑옷', category: 'armor', rarity: 'legendary', level_req: 48, price: 0, stats: JSON.stringify({health: 220, strength: 80, agility: 30}), description: '고대 용의 힘이 깃든 갑옷', source: 'dragon_hoard', passive_skill: 'dragon_scale', active_skill: 'dragon_transformation' },
            { name: '시공의 갑옷', category: 'armor', rarity: 'legendary', level_req: 50, price: 0, stats: JSON.stringify({health: 200, intelligence: 70, agility: 50}), description: '시공간을 조작하는 갑옷', source: 'time_nexus', passive_skill: 'temporal_dodge', active_skill: 'time_acceleration' },
            { name: '무한의 갑옷', category: 'armor', rarity: 'mythic', level_req: 58, price: 0, stats: JSON.stringify({health: 300, strength: 100, intelligence: 80, agility: 60}), description: '무한한 방어력을 가진 궁극의 갑옷', source: 'infinity_forge', passive_skill: 'infinite_defense', active_skill: 'absolute_protection' },
            
            // 특수 장갑들
            { name: '화염의 장갑', category: 'gloves', rarity: 'rare', level_req: 25, price: 0, stats: JSON.stringify({strength: 35, intelligence: 20}), description: '화염을 다루는 장갑', source: 'fire_temple', passive_skill: 'fire_touch' },
            { name: '얼음의 장갑', category: 'gloves', rarity: 'rare', level_req: 25, price: 0, stats: JSON.stringify({agility: 35, intelligence: 20}), description: '얼음을 다루는 장갑', source: 'ice_temple', passive_skill: 'frost_touch' },
            { name: '번개의 장갑', category: 'gloves', rarity: 'epic', level_req: 30, price: 0, stats: JSON.stringify({agility: 40, intelligence: 30}), description: '번개를 다루는 장갑', source: 'storm_temple', passive_skill: 'lightning_touch', active_skill: 'shock_wave' },
            { name: '공허의 장갑', category: 'gloves', rarity: 'legendary', level_req: 45, price: 0, stats: JSON.stringify({strength: 60, agility: 50, luck: 30}), description: '공허의 힘을 다루는 장갑', source: 'void_sanctuary', passive_skill: 'void_grasp', active_skill: 'reality_tear' },
            { name: '창조의 장갑', category: 'gloves', rarity: 'mythic', level_req: 55, price: 0, stats: JSON.stringify({strength: 70, intelligence: 70, charm: 50}), description: '무엇이든 창조할 수 있는 장갑', source: 'creation_chamber', passive_skill: 'matter_creation', active_skill: 'divine_crafting' },
            
            // 특수 신발들
            { name: '하늘을 걷는 신발', category: 'boots', rarity: 'epic', level_req: 35, price: 0, stats: JSON.stringify({agility: 60, luck: 35, charm: 20}), description: '하늘을 걸을 수 있는 신발', source: 'sky_palace', passive_skill: 'air_walk', active_skill: 'flight' },
            { name: '그림자 신발', category: 'boots', rarity: 'epic', level_req: 32, price: 0, stats: JSON.stringify({agility: 65, luck: 40}), description: '그림자 속을 걷는 신발', source: 'shadow_realm', passive_skill: 'shadow_walk', active_skill: 'phase_step' },
            { name: '순간이동 부츠', category: 'boots', rarity: 'legendary', level_req: 42, price: 0, stats: JSON.stringify({agility: 80, intelligence: 40, luck: 35}), description: '순간이동이 가능한 부츠', source: 'mage_tower', passive_skill: 'blink_step', active_skill: 'mass_teleport' },
            { name: '시간의 신발', category: 'boots', rarity: 'legendary', level_req: 46, price: 0, stats: JSON.stringify({agility: 85, intelligence: 50, luck: 40}), description: '시간을 조작하는 신발', source: 'temporal_shrine', passive_skill: 'time_step', active_skill: 'temporal_rewind' },
            { name: '차원의 부츠', category: 'boots', rarity: 'mythic', level_req: 54, price: 0, stats: JSON.stringify({agility: 110, intelligence: 60, luck: 50, strength: 30}), description: '차원을 넘나드는 부츠', source: 'dimensional_gateway', passive_skill: 'dimension_hop', active_skill: 'multiverse_travel' },
            
            { name: '나무 활', category: 'weapon', rarity: 'common', level_req: 1, price: 4000, stats: JSON.stringify({agility: 8, luck: 3}), description: '기본적인 나무 활' },
            { name: '엘프의 활', category: 'weapon', rarity: 'rare', level_req: 20, price: 150000, stats: JSON.stringify({agility: 35, luck: 20}), description: '엘프가 만든 정교한 활' },
            { name: '바람의 활', category: 'weapon', rarity: 'epic', level_req: 35, price: 750000, stats: JSON.stringify({agility: 60, luck: 35, intelligence: 15}), description: '바람의 정령이 깃든 활' },
            
            { name: '마법 지팡이', category: 'weapon', rarity: 'common', level_req: 3, price: 8000, stats: JSON.stringify({intelligence: 10, charm: 5}), description: '초보 마법사의 지팡이' },
            { name: '현자의 지팡이', category: 'weapon', rarity: 'rare', level_req: 25, price: 200000, stats: JSON.stringify({intelligence: 40, charm: 20}), description: '현자가 사용하던 지팡이' },
            { name: '대마법사의 스태프', category: 'weapon', rarity: 'epic', level_req: 40, price: 1000000, stats: JSON.stringify({intelligence: 80, charm: 40, luck: 25}), description: '대마법사의 강력한 스태프' },
            
            { name: '철퇴', category: 'weapon', rarity: 'common', level_req: 8, price: 30000, stats: JSON.stringify({strength: 20, health: 10}), description: '무거운 철퇴' },
            { name: '전쟁 망치', category: 'weapon', rarity: 'rare', level_req: 22, price: 180000, stats: JSON.stringify({strength: 45, health: 25}), description: '전장에서 사용하는 거대한 망치' },
            { name: '단검', category: 'weapon', rarity: 'common', level_req: 3, price: 15000, stats: JSON.stringify({agility: 15, luck: 8}), description: '빠르고 날카로운 단검' },
            { name: '암살자의 칼날', category: 'weapon', rarity: 'epic', level_req: 28, price: 600000, stats: JSON.stringify({agility: 55, luck: 40}), description: '그림자에서 번뜩이는 칼날' },
            
            { name: '창', category: 'weapon', rarity: 'common', level_req: 6, price: 20000, stats: JSON.stringify({strength: 15, agility: 10}), description: '긴 리치의 창' },
            { name: '용기사의 창', category: 'weapon', rarity: 'epic', level_req: 32, price: 700000, stats: JSON.stringify({strength: 65, agility: 35, charm: 20}), description: '용기사가 사용하던 명창' },
            { name: '도끼', category: 'weapon', rarity: 'common', level_req: 10, price: 35000, stats: JSON.stringify({strength: 25, health: 15}), description: '묵직한 전투 도끼' },
            { name: '바이킹의 도끼', category: 'weapon', rarity: 'rare', level_req: 26, price: 250000, stats: JSON.stringify({strength: 50, health: 30}), description: '바이킹 전사의 전투 도끼' },
            { name: '둔기', category: 'weapon', rarity: 'common', level_req: 12, price: 40000, stats: JSON.stringify({strength: 30, health: 20}), description: '단순하지만 강력한 둔기' },

            // 방어구 - 투구 (10개)
            { name: '가죽 모자', category: 'helmet', rarity: 'common', level_req: 1, price: 3000, stats: JSON.stringify({health: 5, agility: 3}), description: '기본적인 가죽 모자' },
            { name: '강철 투구', category: 'helmet', rarity: 'common', level_req: 8, price: 20000, stats: JSON.stringify({health: 15, strength: 5}), description: '견고한 강철 투구' },
            { name: '기사 투구', category: 'helmet', rarity: 'rare', level_req: 18, price: 80000, stats: JSON.stringify({health: 30, strength: 15, charm: 10}), description: '기사의 위엄있는 투구' },
            { name: '용 투구', category: 'helmet', rarity: 'epic', level_req: 35, price: 400000, stats: JSON.stringify({health: 60, strength: 25, luck: 15}), description: '용의 머리를 본뜬 투구' },
            { name: '신성한 왕관', category: 'helmet', rarity: 'legendary', level_req: 50, price: 1500000, stats: JSON.stringify({health: 100, charm: 50, intelligence: 30}), description: '신성한 힘이 깃든 왕관' },
            { name: '마법사 모자', category: 'helmet', rarity: 'rare', level_req: 15, price: 60000, stats: JSON.stringify({intelligence: 25, charm: 15}), description: '마법사의 뾰족한 모자' },
            { name: '도적 두건', category: 'helmet', rarity: 'common', level_req: 5, price: 12000, stats: JSON.stringify({agility: 12, luck: 8}), description: '은밀함을 돕는 두건' },
            { name: '전쟁 투구', category: 'helmet', rarity: 'rare', level_req: 25, price: 150000, stats: JSON.stringify({health: 45, strength: 20}), description: '전장의 베테랑이 쓰는 투구' },
            { name: '현자의 관', category: 'helmet', rarity: 'epic', level_req: 40, price: 800000, stats: JSON.stringify({intelligence: 70, charm: 35}), description: '현자의 지혜가 깃든 관' },
            { name: '악마 투구', category: 'helmet', rarity: 'epic', level_req: 45, price: 1000000, stats: JSON.stringify({strength: 50, health: 50, charm: -10}), description: '악마의 힘이 깃든 어둠의 투구' },

            // 방어구 - 갑옷 (12개)
            { name: '가죽 갑옷', category: 'armor', rarity: 'common', level_req: 1, price: 8000, stats: JSON.stringify({health: 15, agility: 5}), description: '기본적인 가죽 갑옷' },
            { name: '사슬 갑옷', category: 'armor', rarity: 'common', level_req: 10, price: 40000, stats: JSON.stringify({health: 35, strength: 10}), description: '사슬로 엮은 갑옷' },
            { name: '강철 갑옷', category: 'armor', rarity: 'rare', level_req: 20, price: 120000, stats: JSON.stringify({health: 70, strength: 25}), description: '견고한 강철 판금 갑옷' },
            { name: '기사 갑옷', category: 'armor', rarity: 'epic', level_req: 30, price: 500000, stats: JSON.stringify({health: 120, strength: 40, charm: 20}), description: '성스러운 기사의 갑옷' },
            { name: '용린 갑옷', category: 'armor', rarity: 'legendary', level_req: 45, price: 2000000, stats: JSON.stringify({health: 200, strength: 70, luck: 30}), description: '용의 비늘로 만든 전설의 갑옷' },
            { name: '마법사 로브', category: 'armor', rarity: 'rare', level_req: 15, price: 80000, stats: JSON.stringify({intelligence: 35, charm: 20}), description: '마법이 깃든 로브' },
            { name: '도적 복장', category: 'armor', rarity: 'common', level_req: 8, price: 25000, stats: JSON.stringify({agility: 20, luck: 15}), description: '은밀한 활동에 적합한 복장' },
            { name: '대마법사 로브', category: 'armor', rarity: 'epic', level_req: 38, price: 900000, stats: JSON.stringify({intelligence: 80, charm: 45}), description: '대마법사의 화려한 로브' },
            { name: '암살자 복장', category: 'armor', rarity: 'epic', level_req: 35, price: 700000, stats: JSON.stringify({agility: 60, luck: 40}), description: '완벽한 은신을 위한 복장' },
            { name: '성직자 의복', category: 'armor', rarity: 'rare', level_req: 25, price: 200000, stats: JSON.stringify({health: 50, intelligence: 30, charm: 25}), description: '신성한 힘이 깃든 의복' },
            { name: '전쟁 갑옷', category: 'armor', rarity: 'epic', level_req: 40, price: 1200000, stats: JSON.stringify({health: 150, strength: 60}), description: '무수한 전투를 견뎌낸 갑옷' },
            { name: '영웅의 갑옷', category: 'armor', rarity: 'legendary', level_req: 50, price: 3000000, stats: JSON.stringify({health: 250, strength: 100, charm: 50}), description: '영웅이 착용했던 전설의 갑옷' },

            // 장갑 (8개)
            { name: '가죽 장갑', category: 'gloves', rarity: 'common', level_req: 1, price: 2000, stats: JSON.stringify({agility: 5}), description: '기본적인 가죽 장갑' },
            { name: '강철 장갑', category: 'gloves', rarity: 'common', level_req: 12, price: 30000, stats: JSON.stringify({strength: 15, health: 10}), description: '강철로 된 장갑' },
            { name: '마법 장갑', category: 'gloves', rarity: 'rare', level_req: 20, price: 100000, stats: JSON.stringify({intelligence: 25, agility: 15}), description: '마법이 깃든 장갑' },
            { name: '도적 장갑', category: 'gloves', rarity: 'rare', level_req: 18, price: 70000, stats: JSON.stringify({agility: 30, luck: 20}), description: '민첩함을 높여주는 장갑' },
            { name: '힘의 장갑', category: 'gloves', rarity: 'epic', level_req: 35, price: 600000, stats: JSON.stringify({strength: 45, health: 25}), description: '엄청난 힘을 주는 장갑' },
            { name: '지혜의 장갑', category: 'gloves', rarity: 'epic', level_req: 32, price: 550000, stats: JSON.stringify({intelligence: 50, charm: 25}), description: '지혜를 높여주는 장갑' },
            { name: '용의 손톱', category: 'gloves', rarity: 'legendary', level_req: 45, price: 1800000, stats: JSON.stringify({strength: 70, agility: 40, luck: 25}), description: '용의 손톱으로 만든 장갑' },
            { name: '신의 축복', category: 'gloves', rarity: 'legendary', level_req: 50, price: 2500000, stats: JSON.stringify({strength: 50, intelligence: 50, charm: 30}), description: '신의 축복이 깃든 장갑' },

            // 신발 (8개)
            { name: '가죽 부츠', category: 'boots', rarity: 'common', level_req: 1, price: 3000, stats: JSON.stringify({agility: 8, health: 5}), description: '기본적인 가죽 부츠' },
            { name: '강철 부츠', category: 'boots', rarity: 'common', level_req: 15, price: 50000, stats: JSON.stringify({strength: 20, health: 15}), description: '무거운 강철 부츠' },
            { name: '바람의 신발', category: 'boots', rarity: 'rare', level_req: 22, price: 150000, stats: JSON.stringify({agility: 40, luck: 20}), description: '바람처럼 빠른 신발' },
            { name: '대지의 부츠', category: 'boots', rarity: 'rare', level_req: 25, price: 180000, stats: JSON.stringify({strength: 35, health: 30}), description: '대지의 힘이 깃든 부츠' },
            { name: '은밀한 신발', category: 'boots', rarity: 'epic', level_req: 30, price: 500000, stats: JSON.stringify({agility: 55, luck: 35}), description: '소리 없이 움직이는 신발' },
            { name: '화염 부츠', category: 'boots', rarity: 'epic', level_req: 38, price: 800000, stats: JSON.stringify({strength: 50, agility: 30, health: 25}), description: '화염의 힘이 깃든 부츠' },
            { name: '천사의 날개', category: 'boots', rarity: 'legendary', level_req: 45, price: 2000000, stats: JSON.stringify({agility: 80, charm: 50, happiness: 30}), description: '천사의 날개가 달린 신발' },
            { name: '신속의 부츠', category: 'boots', rarity: 'legendary', level_req: 50, price: 2800000, stats: JSON.stringify({agility: 100, luck: 50}), description: '최고의 속도를 자랑하는 부츠' },

            // === 장갑 확장 ===
            { name: '강철 장갑', category: 'gloves', rarity: 'common', level_req: 12, price: 30000, stats: JSON.stringify({strength: 15, health: 10}), description: '강철로 된 장갑', source: 'shop' },
            { name: '마법 장갑', category: 'gloves', rarity: 'rare', level_req: 20, price: 0, stats: JSON.stringify({intelligence: 25, agility: 15}), description: '마법이 깃든 장갑', source: 'crafting', craft_materials: ['magic_leather:3', 'enchant_crystal:2'] },
            { name: '도적 장갑', category: 'gloves', rarity: 'rare', level_req: 18, price: 0, stats: JSON.stringify({agility: 30, luck: 20}), description: '민첩함을 높여주는 장갑', source: 'dungeon', dungeon_name: '암살자의 길드' },
            { name: '힘의 장갑', category: 'gloves', rarity: 'epic', level_req: 35, price: 0, stats: JSON.stringify({strength: 45, health: 25}), description: '엄청난 힘을 주는 장갑', source: 'boss', boss_name: '거인족 족장' },
            { name: '지혜의 장갑', category: 'gloves', rarity: 'epic', level_req: 32, price: 0, stats: JSON.stringify({intelligence: 50, charm: 25}), description: '지혜를 높여주는 장갑', source: 'achievement', achievement_name: '지식의 탐구자' },
            { name: '용의 손톱', category: 'gloves', rarity: 'legendary', level_req: 45, price: 0, stats: JSON.stringify({strength: 70, agility: 40, luck: 25}), description: '용의 손톱으로 만든 장갑', source: 'raid', raid_name: '용족의 보물고' },
            { name: '신의 축복', category: 'gloves', rarity: 'legendary', level_req: 50, price: 0, stats: JSON.stringify({strength: 50, intelligence: 50, charm: 30}), description: '신의 축복이 깃든 장갑', source: 'ultimate_quest', quest_name: '신의 시험' },
            { name: '시공간 조작 장갑', category: 'gloves', rarity: 'mythic', level_req: 60, price: 0, stats: JSON.stringify({strength: 80, intelligence: 80, agility: 80, luck: 60}), description: '시공간을 조작할 수 있는 신비한 장갑', source: 'unique_event', event_name: '차원의 틈새' },
            
            // === 신발 확장 ===
            { name: '강철 부츠', category: 'boots', rarity: 'common', level_req: 15, price: 50000, stats: JSON.stringify({strength: 20, health: 15}), description: '무거운 강철 부츠', source: 'shop' },
            { name: '바람의 신발', category: 'boots', rarity: 'rare', level_req: 22, price: 0, stats: JSON.stringify({agility: 40, luck: 20}), description: '바람처럼 빠른 신발', source: 'dungeon', dungeon_name: '바람의 성역' },
            { name: '대지의 부츠', category: 'boots', rarity: 'rare', level_req: 25, price: 0, stats: JSON.stringify({strength: 35, health: 30}), description: '대지의 힘이 깃든 부츠', source: 'mining', mine_name: '대지의 핵심' },
            { name: '은밀한 신발', category: 'boots', rarity: 'epic', level_req: 30, price: 0, stats: JSON.stringify({agility: 55, luck: 35}), description: '소리 없이 움직이는 신발', source: 'crafting', craft_materials: ['shadow_silk:4', 'silence_crystal:2'] },
            { name: '화염 부츠', category: 'boots', rarity: 'epic', level_req: 38, price: 0, stats: JSON.stringify({strength: 50, agility: 30, health: 25}), description: '화염의 힘이 깃든 부츠', source: 'boss', boss_name: '화염 정령왕' },
            { name: '천사의 날개', category: 'boots', rarity: 'legendary', level_req: 45, price: 0, stats: JSON.stringify({agility: 80, charm: 50, happiness: 30}), description: '천사의 날개가 달린 신발', source: 'raid', raid_name: '천사계 정벌' },
            { name: '신속의 부츠', category: 'boots', rarity: 'legendary', level_req: 50, price: 0, stats: JSON.stringify({agility: 100, luck: 50}), description: '최고의 속도를 자랑하는 부츠', source: 'world_boss', boss_name: '바람의 군주' },
            { name: '무한 이동 부츠', category: 'boots', rarity: 'mythic', level_req: 58, price: 0, stats: JSON.stringify({agility: 120, luck: 80, intelligence: 40, strength: 20}), description: '공간을 초월해 이동할 수 있는 부츠', source: 'unique_craft', materials: ['space_essence:5', 'time_crystal:2', 'void_leather:3'] },
            
            // 악세서리 (대폭 확장)
            { name: '힘의 목걸이', category: 'accessory', rarity: 'common', level_req: 5, price: 15000, stats: JSON.stringify({strength: 10}), description: '힘을 올려주는 목걸이', source: 'shop' },
            { name: '지혜의 목걸이', category: 'accessory', rarity: 'common', level_req: 5, price: 15000, stats: JSON.stringify({intelligence: 10}), description: '지혜를 올려주는 목걸이', source: 'shop' },
            { name: '민첩의 목걸이', category: 'accessory', rarity: 'common', level_req: 5, price: 15000, stats: JSON.stringify({agility: 10}), description: '민첩성을 올려주는 목걸이', source: 'shop' },
            { name: '생명의 목걸이', category: 'accessory', rarity: 'rare', level_req: 15, price: 0, stats: JSON.stringify({health: 30}), description: '생명력을 크게 올려주는 목걸이', source: 'crafting', craft_materials: ['life_crystal:2', 'healing_herb:5'] },
            { name: '행운의 목걸이', category: 'accessory', rarity: 'rare', level_req: 18, price: 0, stats: JSON.stringify({luck: 25}), description: '행운을 올려주는 목걸이', source: 'dungeon', dungeon_name: '운명의 미로' },
            { name: '매력의 목걸이', category: 'accessory', rarity: 'rare', level_req: 20, price: 0, stats: JSON.stringify({charm: 25}), description: '매력을 올려주는 목걸이', source: 'achievement', achievement_name: '사교계의 스타' },
            { name: '불의 목걸이', category: 'accessory', rarity: 'rare', level_req: 22, price: 0, stats: JSON.stringify({strength: 20, intelligence: 15}), description: '화염의 힘이 깃든 목걸이', source: 'boss', boss_name: '화염 악마' },
            { name: '얼음의 목걸이', category: 'accessory', rarity: 'rare', level_req: 22, price: 0, stats: JSON.stringify({agility: 20, intelligence: 15}), description: '얼음의 힘이 깃든 목걸이', source: 'mining', mine_name: '얼음 동굴' },
            { name: '바람의 목걸이', category: 'accessory', rarity: 'rare', level_req: 24, price: 0, stats: JSON.stringify({agility: 25, luck: 20}), description: '바람의 힘이 깃든 목걸이', source: 'dungeon', dungeon_name: '하늘의 탑' },
            { name: '대지의 목걸이', category: 'accessory', rarity: 'rare', level_req: 24, price: 0, stats: JSON.stringify({strength: 22, health: 25}), description: '대지의 힘이 깃든 목걸이', source: 'crafting', craft_materials: ['earth_essence:3', 'mountain_stone:4'] },
            { name: '균형의 목걸이', category: 'accessory', rarity: 'epic', level_req: 30, price: 0, stats: JSON.stringify({strength: 20, intelligence: 20, agility: 20}), description: '모든 능력을 균형있게 올려주는 목걸이', source: 'achievement', achievement_name: '완벽한 균형' },
            { name: '무한의 목걸이', category: 'accessory', rarity: 'epic', level_req: 35, price: 0, stats: JSON.stringify({strength: 30, intelligence: 30, agility: 30, luck: 25}), description: '무한한 가능성을 품은 목걸이', source: 'boss', boss_name: '무한의 수호자' },
            { name: '시간의 목걸이', category: 'accessory', rarity: 'epic', level_req: 40, price: 0, stats: JSON.stringify({intelligence: 50, agility: 40, luck: 35}), description: '시간을 조작할 수 있는 신비한 목걸이', source: 'crafting', craft_materials: ['time_crystal:2', 'temporal_essence:3'] },
            { name: '공간의 목걸이', category: 'accessory', rarity: 'epic', level_req: 42, price: 0, stats: JSON.stringify({agility: 50, intelligence: 40, charm: 25}), description: '공간을 왜곡할 수 있는 목걸이', source: 'quest', quest_name: '차원 여행자' },
            { name: '용의 심장', category: 'accessory', rarity: 'legendary', level_req: 40, price: 0, stats: JSON.stringify({strength: 50, health: 80, luck: 30}), description: '용의 심장으로 만든 목걸이', source: 'world_boss', boss_name: '고대 용제' },
            { name: '현자의 돌', category: 'accessory', rarity: 'legendary', level_req: 45, price: 0, stats: JSON.stringify({intelligence: 80, charm: 40}), description: '모든 지혜가 담긴 돌', source: 'ultimate_quest', quest_name: '연금술사의 궁극 목표' },
            { name: '천사의 깃털', category: 'accessory', rarity: 'legendary', level_req: 48, price: 0, stats: JSON.stringify({charm: 60, happiness: 50, luck: 40}), description: '천사의 깃털로 만든 목걸이', source: 'raid', raid_name: '천상계 성전' },
            { name: '태양의 목걸이', category: 'accessory', rarity: 'legendary', level_req: 50, price: 0, stats: JSON.stringify({strength: 40, intelligence: 40, health: 60, happiness: 50}), description: '태양의 힘이 깃든 목걸이', source: 'secret_quest', quest_name: '태양신의 축복' },
            { name: '달의 목걸이', category: 'accessory', rarity: 'legendary', level_req: 50, price: 0, stats: JSON.stringify({agility: 60, charm: 50, luck: 40}), description: '달의 신비한 힘이 깃든 목걸이', source: 'secret_quest', quest_name: '달의 여신의 시험' },
            { name: '별의 목걸이', category: 'accessory', rarity: 'legendary', level_req: 52, price: 0, stats: JSON.stringify({intelligence: 70, luck: 50, happiness: 40}), description: '별들의 지혜가 깃든 목걸이', source: 'cosmic_event', event_name: '별들의 정렬' },
            { name: '창조의 목걸이', category: 'accessory', rarity: 'mythic', level_req: 55, price: 0, stats: JSON.stringify({strength: 80, intelligence: 80, agility: 80, health: 80, charm: 80, luck: 80}), description: '창조의 힘을 담은 궁극의 목걸이', source: 'unique_event', event_name: '우주의 탄생' },
            { name: '파괴의 목걸이', category: 'accessory', rarity: 'mythic', level_req: 58, price: 0, stats: JSON.stringify({strength: 120, agility: 100, charm: -50, luck: 90}), description: '모든 것을 파괴할 수 있는 위험한 목걸이', source: 'apocalypse_event', event_name: '종말의 전령' },
            { name: '균형의 목걸이', category: 'accessory', rarity: 'epic', level_req: 30, price: 500000, stats: JSON.stringify({strength: 20, intelligence: 20, agility: 20}), description: '모든 능력을 균형있게 올려주는 목걸이' },
            { name: '용의 심장', category: 'accessory', rarity: 'legendary', level_req: 40, price: 1500000, stats: JSON.stringify({strength: 50, health: 80, luck: 30}), description: '용의 심장으로 만든 목걸이' },
            { name: '현자의 돌', category: 'accessory', rarity: 'legendary', level_req: 45, price: 2000000, stats: JSON.stringify({intelligence: 80, charm: 40}), description: '모든 지혜가 담긴 돌' },
            { name: '천사의 깃털', category: 'accessory', rarity: 'epic', level_req: 35, price: 800000, stats: JSON.stringify({charm: 40, happiness: 30, luck: 25}), description: '천사의 깃털로 만든 목걸이' },
            { name: '악마의 계약서', category: 'accessory', rarity: 'epic', level_req: 40, price: 1000000, stats: JSON.stringify({strength: 60, intelligence: 40, charm: -20}), description: '악마와의 계약이 담긴 목걸이' },
            { name: '태양의 목걸이', category: 'accessory', rarity: 'legendary', level_req: 50, price: 3000000, stats: JSON.stringify({strength: 40, intelligence: 40, health: 60, happiness: 50}), description: '태양의 힘이 깃든 목걸이' },
            { name: '달의 목걸이', category: 'accessory', rarity: 'legendary', level_req: 50, price: 3000000, stats: JSON.stringify({agility: 60, charm: 50, luck: 40}), description: '달의 신비한 힘이 깃든 목걸이' },
            { name: '별의 목걸이', category: 'accessory', rarity: 'legendary', level_req: 50, price: 3500000, stats: JSON.stringify({intelligence: 70, luck: 50, happiness: 40}), description: '별들의 지혜가 깃든 목걸이' },
            { name: '무한의 목걸이', category: 'accessory', rarity: 'mythic', level_req: 60, price: 10000000, stats: JSON.stringify({strength: 100, intelligence: 100, agility: 100, health: 100, charm: 100, luck: 100}), description: '무한한 힘이 깃든 전설의 목걸이' },

            // 반지 (12개)
            { name: '힘의 반지', category: 'ring', rarity: 'common', level_req: 3, price: 8000, stats: JSON.stringify({strength: 8}), description: '힘을 올려주는 반지' },
            { name: '지혜의 반지', category: 'ring', rarity: 'common', level_req: 3, price: 8000, stats: JSON.stringify({intelligence: 8}), description: '지혜를 올려주는 반지' },
            { name: '민첩의 반지', category: 'ring', rarity: 'common', level_req: 3, price: 8000, stats: JSON.stringify({agility: 8}), description: '민첩성을 올려주는 반지' },
            { name: '생명의 반지', category: 'ring', rarity: 'rare', level_req: 12, price: 50000, stats: JSON.stringify({health: 25}), description: '생명력을 올려주는 반지' },
            { name: '행운의 반지', category: 'ring', rarity: 'rare', level_req: 15, price: 70000, stats: JSON.stringify({luck: 20}), description: '행운을 올려주는 반지' },
            { name: '매력의 반지', category: 'ring', rarity: 'rare', level_req: 18, price: 90000, stats: JSON.stringify({charm: 20}), description: '매력을 올려주는 반지' },
            { name: '마법의 반지', category: 'ring', rarity: 'epic', level_req: 25, price: 300000, stats: JSON.stringify({intelligence: 35, charm: 20}), description: '마법이 깃든 반지' },
            { name: '전사의 반지', category: 'ring', rarity: 'epic', level_req: 28, price: 400000, stats: JSON.stringify({strength: 40, health: 30}), description: '전사의 영혼이 깃든 반지' },
            { name: '도적의 반지', category: 'ring', rarity: 'epic', level_req: 30, price: 350000, stats: JSON.stringify({agility: 45, luck: 25}), description: '도적의 기술이 깃든 반지' },
            { name: '왕의 반지', category: 'ring', rarity: 'legendary', level_req: 40, price: 1200000, stats: JSON.stringify({charm: 50, intelligence: 30, luck: 25}), description: '왕권을 상징하는 반지' },
            { name: '불멸의 반지', category: 'ring', rarity: 'legendary', level_req: 45, price: 1800000, stats: JSON.stringify({health: 100, strength: 40}), description: '불멸의 힘이 깃든 반지' },
            { name: '창조의 반지', category: 'ring', rarity: 'mythic', level_req: 50, price: 5000000, stats: JSON.stringify({strength: 50, intelligence: 50, agility: 50, health: 50, charm: 50, luck: 50}), description: '모든 것을 창조할 수 있는 반지' }
        ];
    }

    async initializeEquipmentSystem() {
        // 장비 테이블 생성
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS equipment (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                rarity TEXT NOT NULL,
                level_requirement INTEGER DEFAULT 1,
                price REAL DEFAULT 0,
                stats_effect TEXT,
                special_effects TEXT,
                description TEXT
            )
        `);

        // 플레이어 장비 착용 상태 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS player_equipment (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                equipment_id INTEGER,
                slot TEXT NOT NULL,
                equipped_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (player_id) REFERENCES players(id),
                FOREIGN KEY (equipment_id) REFERENCES equipment(id)
            )
        `);

        // 장비 데이터 삽입
        for (const equipment of this.equipmentTypes) {
            await this.db.run(`
                INSERT OR IGNORE INTO equipment (name, category, rarity, level_requirement, price, stats_effect, description)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [equipment.name, equipment.category, equipment.rarity, equipment.level_req, 
                equipment.price, equipment.stats, equipment.description]);
        }

        console.log('장비 시스템 초기화 완료');
    }

    async equipItem(playerId, itemId, slot) {
        try {
            // 아이템 정보 확인
            const item = await this.db.get('SELECT * FROM equipment WHERE id = ?', [itemId]);
            if (!item) {
                return { success: false, message: '존재하지 않는 장비입니다.' };
            }

            // 플레이어 레벨 확인
            const player = await this.db.get('SELECT level FROM players WHERE id = ?', [playerId]);
            if (player.level < item.level_requirement) {
                return { 
                    success: false, 
                    message: `레벨이 부족합니다. 필요 레벨: ${item.level_requirement}` 
                };
            }

            // 플레이어가 해당 아이템을 보유하고 있는지 확인
            const hasItem = await this.db.get(`
                SELECT * FROM player_inventory WHERE player_id = ? AND item_id = ? AND quantity > 0
            `, [playerId, itemId]);

            if (!hasItem) {
                return { success: false, message: '보유하지 않은 장비입니다.' };
            }

            // 기존 장착 장비 해제
            await this.db.run(`
                DELETE FROM player_equipment WHERE player_id = ? AND slot = ?
            `, [playerId, slot]);

            // 새 장비 착용
            await this.db.run(`
                INSERT INTO player_equipment (player_id, equipment_id, slot)
                VALUES (?, ?, ?)
            `, [playerId, itemId, slot]);

            // 인벤토리에서 아이템 제거
            await this.db.run(`
                UPDATE player_inventory SET quantity = quantity - 1 WHERE player_id = ? AND item_id = ?
            `, [playerId, itemId]);

            return {
                success: true,
                message: `${item.name}을(를) ${slot} 슬롯에 장착했습니다.`,
                item: item
            };

        } catch (error) {
            console.error('장비 착용 오류:', error);
            return { success: false, message: '장비 착용 중 오류가 발생했습니다.' };
        }
    }

    async unequipItem(playerId, slot) {
        try {
            // 현재 장착된 장비 확인
            const equippedItem = await this.db.get(`
                SELECT pe.*, e.name, e.category
                FROM player_equipment pe
                JOIN equipment e ON pe.equipment_id = e.id
                WHERE pe.player_id = ? AND pe.slot = ?
            `, [playerId, slot]);

            if (!equippedItem) {
                return { success: false, message: '해당 슬롯에 장착된 장비가 없습니다.' };
            }

            // 장비 해제
            await this.db.run(`
                DELETE FROM player_equipment WHERE player_id = ? AND slot = ?
            `, [playerId, slot]);

            // 인벤토리에 아이템 추가
            const existingItem = await this.db.get(`
                SELECT * FROM player_inventory WHERE player_id = ? AND item_id = ?
            `, [playerId, equippedItem.equipment_id]);

            if (existingItem) {
                await this.db.run(`
                    UPDATE player_inventory SET quantity = quantity + 1 WHERE id = ?
                `, [existingItem.id]);
            } else {
                await this.db.run(`
                    INSERT INTO player_inventory (player_id, item_id, quantity)
                    VALUES (?, ?, 1)
                `, [playerId, equippedItem.equipment_id]);
            }

            return {
                success: true,
                message: `${equippedItem.name}을(를) 해제했습니다.`,
                item: equippedItem
            };

        } catch (error) {
            console.error('장비 해제 오류:', error);
            return { success: false, message: '장비 해제 중 오류가 발생했습니다.' };
        }
    }

    async getPlayerEquipment(playerId) {
        return await this.db.all(`
            SELECT pe.slot, e.*
            FROM player_equipment pe
            JOIN equipment e ON pe.equipment_id = e.id
            WHERE pe.player_id = ?
            ORDER BY pe.slot
        `, [playerId]);
    }

    async calculateEquipmentStats(playerId) {
        const equipment = await this.getPlayerEquipment(playerId);
        let totalStats = {
            strength: 0,
            intelligence: 0,
            agility: 0,
            health: 0,
            charm: 0,
            luck: 0,
            happiness: 0
        };

        for (const item of equipment) {
            if (item.stats_effect) {
                const stats = JSON.parse(item.stats_effect);
                for (const [stat, value] of Object.entries(stats)) {
                    if (totalStats.hasOwnProperty(stat)) {
                        totalStats[stat] += value;
                    }
                }
            }
        }

        return totalStats;
    }

    async getEquipmentShop(category = null, rarity = null) {
        let sql = 'SELECT * FROM equipment WHERE 1=1';
        let params = [];

        if (category) {
            sql += ' AND category = ?';
            params.push(category);
        }

        if (rarity) {
            sql += ' AND rarity = ?';
            params.push(rarity);
        }

        sql += ' ORDER BY level_requirement ASC, price ASC';

        return await this.db.all(sql, params);
    }

    createEquipmentEmbed(equipment, title = '장비 목록') {
        const embed = new EmbedBuilder()
            .setColor('#ff9900')
            .setTitle(`⚔️ ${title}`)
            .setTimestamp();

        if (equipment.length === 0) {
            embed.setDescription('장비가 없습니다.');
            return embed;
        }

        const rarityEmojis = {
            'common': '⚪',
            'rare': '🔵', 
            'epic': '🟣',
            'legendary': '🟡',
            'mythic': '🔴'
        };

        const categoryEmojis = {
            'weapon': '⚔️',
            'helmet': '🛡️',
            'armor': '🥋',
            'gloves': '🧤',
            'boots': '👢',
            'accessory': '📿',
            'ring': '💍'
        };

        // 카테고리별로 그룹화
        const groupedEquipment = {};
        equipment.forEach(item => {
            if (!groupedEquipment[item.category]) {
                groupedEquipment[item.category] = [];
            }
            groupedEquipment[item.category].push(item);
        });

        for (const [category, items] of Object.entries(groupedEquipment)) {
            const itemsText = items.map(item => {
                const stats = item.stats_effect ? JSON.parse(item.stats_effect) : {};
                const statsText = Object.entries(stats)
                    .map(([stat, value]) => `${stat}: +${value}`)
                    .join(', ');

                return [
                    `${rarityEmojis[item.rarity]} **${item.name}** (ID: ${item.id})`,
                    `📊 레벨 요구: ${item.level_requirement}`,
                    `💰 가격: ${item.price.toLocaleString()}원`,
                    `⚡ 능력치: ${statsText}`,
                    `📝 ${item.description}`
                ].join('\n');
            }).join('\n\n');

            embed.addFields({
                name: `${categoryEmojis[category]} ${category.toUpperCase()}`,
                value: itemsText.length > 1024 ? itemsText.substring(0, 1020) + '...' : itemsText,
                inline: false
            });
        }

        return embed;
    }

    createPlayerEquipmentEmbed(playerId, equipment, stats) {
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('⚔️ 장착 중인 장비')
            .setTimestamp();

        if (equipment.length === 0) {
            embed.setDescription('착용 중인 장비가 없습니다.');
        } else {
            const slotEmojis = {
                'weapon': '⚔️ 무기',
                'helmet': '🛡️ 투구',
                'armor': '🥋 갑옷',
                'gloves': '🧤 장갑',
                'boots': '👢 신발',
                'accessory1': '📿 악세서리 1',
                'accessory2': '📿 악세서리 2',
                'ring1': '💍 반지 1',
                'ring2': '💍 반지 2'
            };

            for (const item of equipment) {
                const stats = item.stats_effect ? JSON.parse(item.stats_effect) : {};
                const statsText = Object.entries(stats)
                    .map(([stat, value]) => `${stat}: +${value}`)
                    .join(', ');

                embed.addFields({
                    name: `${slotEmojis[item.slot]} - ${item.name}`,
                    value: `⚡ ${statsText}\n📝 ${item.description}`,
                    inline: false
                });
            }
        }

        // 총 스탯 보너스 표시
        if (stats) {
            const totalStatsText = Object.entries(stats)
                .filter(([stat, value]) => value > 0)
                .map(([stat, value]) => `${stat}: +${value}`)
                .join('\n');

            if (totalStatsText) {
                embed.addFields({
                    name: '📊 총 장비 보너스',
                    value: totalStatsText,
                    inline: true
                });
            }
        }

        return embed;
    }
}

module.exports = EquipmentSystem;
