const { EmbedBuilder } = require('discord.js');

class CombatSystem {
    constructor(database) {
        this.db = database;
        this.activeBattles = new Map();
        
        this.skillTypes = [
            // === 전사 스킬 (근접 물리 공격) ===
            { id: 'slash', name: '강력한 베기', category: 'warrior', level_req: 1, cost: 10, cooldown: 2, damage_multiplier: 1.5, description: '강력한 베기 공격' },
            { id: 'shield_bash', name: '방패 타격', category: 'warrior', level_req: 5, cost: 15, cooldown: 3, damage_multiplier: 1.2, special: 'stun', description: '적을 기절시키는 방패 공격' },
            { id: 'berserker_rage', name: '광전사의 분노', category: 'warrior', level_req: 10, cost: 25, cooldown: 5, damage_multiplier: 2.0, special: 'self_buff', description: '분노로 공격력 증가' },
            { id: 'whirlwind', name: '회오리 베기', category: 'warrior', level_req: 15, cost: 30, cooldown: 4, damage_multiplier: 1.8, special: 'aoe', description: '주변 적 모두 공격' },
            { id: 'execute', name: '처형', category: 'warrior', level_req: 20, cost: 40, cooldown: 6, damage_multiplier: 3.0, special: 'execute', description: '적의 체력이 낮을 때 즉사 확률' },
            { id: 'charge', name: '돌진', category: 'warrior', level_req: 8, cost: 18, cooldown: 3, damage_multiplier: 1.6, special: 'knockback', description: '적에게 돌진하여 밀쳐내기' },
            { id: 'taunt', name: '도발', category: 'warrior', level_req: 12, cost: 20, cooldown: 4, damage_multiplier: 0, special: 'taunt', description: '적의 공격을 자신에게 집중' },
            { id: 'bloodlust', name: '혈투', category: 'warrior', level_req: 18, cost: 35, cooldown: 6, damage_multiplier: 2.2, special: 'life_steal', description: '공격시 체력 흡수' },
            { id: 'weapon_throw', name: '무기 투척', category: 'warrior', level_req: 22, cost: 28, cooldown: 5, damage_multiplier: 1.9, special: 'ranged', description: '무기를 던져 원거리 공격' },
            { id: 'iron_will', name: '강철 의지', category: 'warrior', level_req: 25, cost: 40, cooldown: 8, damage_multiplier: 0, special: 'immunity', description: '모든 상태이상 면역' },
            { id: 'devastating_blow', name: '파괴적 일격', category: 'warrior', level_req: 30, cost: 50, cooldown: 8, damage_multiplier: 3.5, special: 'armor_break', description: '적의 방어력 무시' },
            { id: 'war_cry', name: '전쟁 함성', category: 'warrior', level_req: 35, cost: 45, cooldown: 10, damage_multiplier: 0, special: 'team_buff', description: '아군 전체 공격력 증가' },
            { id: 'god_slayer', name: '신 살해자', category: 'warrior', level_req: 50, cost: 100, cooldown: 15, damage_multiplier: 6.0, special: 'god_slayer', description: '신급 존재에게 특별한 피해' },

            // === 마법사 스킬 (마법 공격) ===
            { id: 'fireball', name: '파이어볼', category: 'mage', level_req: 1, cost: 15, cooldown: 2, damage_multiplier: 1.6, description: '화염 마법 공격' },
            { id: 'ice_shard', name: '얼음 창', category: 'mage', level_req: 3, cost: 12, cooldown: 2, damage_multiplier: 1.3, special: 'slow', description: '적을 둔화시키는 얼음 공격' },
            { id: 'lightning_bolt', name: '번개', category: 'mage', level_req: 8, cost: 20, cooldown: 3, damage_multiplier: 1.9, special: 'chain', description: '여러 적에게 전해지는 번개' },
            { id: 'magic_missile', name: '마법 미사일', category: 'mage', level_req: 5, cost: 16, cooldown: 2, damage_multiplier: 1.4, special: 'homing', description: '추적하는 마법 미사일' },
            { id: 'frost_nova', name: '프로스트 노바', category: 'mage', level_req: 12, cost: 25, cooldown: 4, damage_multiplier: 1.2, special: 'freeze_aoe', description: '주변 적들을 얼려버림' },
            { id: 'flame_wave', name: '화염파', category: 'mage', level_req: 15, cost: 30, cooldown: 5, damage_multiplier: 1.7, special: 'wave', description: '화염의 파도로 적들을 태움' },
            { id: 'thunder_storm', name: '번개 폭풍', category: 'mage', level_req: 20, cost: 40, cooldown: 6, damage_multiplier: 2.0, special: 'storm', description: '번개 폭풍으로 광역 공격' },
            { id: 'teleport', name: '텔레포트', category: 'mage', level_req: 18, cost: 35, cooldown: 5, damage_multiplier: 0, special: 'teleport', description: '순간이동으로 회피' },
            { id: 'mana_shield', name: '마나 실드', category: 'mage', level_req: 22, cost: 45, cooldown: 8, damage_multiplier: 0, special: 'mana_shield', description: '마나로 피해 흡수' },
            { id: 'meteor', name: '메테오', category: 'mage', level_req: 25, cost: 50, cooldown: 8, damage_multiplier: 2.5, special: 'aoe', description: '거대한 운석 낙하' },
            { id: 'time_stop', name: '시간 정지', category: 'mage', level_req: 30, cost: 60, cooldown: 10, damage_multiplier: 0, special: 'time_stop', description: '시간을 정지시켜 추가 행동' },
            { id: 'disintegrate', name: '분해술', category: 'mage', level_req: 35, cost: 70, cooldown: 12, damage_multiplier: 4.0, special: 'disintegrate', description: '적을 분자 단위로 분해' },
            { id: 'reality_rift', name: '현실 균열', category: 'mage', level_req: 40, cost: 80, cooldown: 15, damage_multiplier: 3.5, special: 'reality_break', description: '현실에 균열을 만들어 공격' },
            { id: 'arcane_orb', name: '비전 오브', category: 'mage', level_req: 45, cost: 90, cooldown: 18, damage_multiplier: 5.0, special: 'piercing', description: '모든 것을 관통하는 비전 구체' },
            { id: 'world_end', name: '세계 종말', category: 'mage', level_req: 55, cost: 150, cooldown: 25, damage_multiplier: 8.0, special: 'apocalypse', description: '세계를 종말로 이끄는 금단의 마법' },

            // === 도적 스킬 (은밀 및 치명타) ===
            { id: 'backstab', name: '백스탭', category: 'rogue', level_req: 1, cost: 12, cooldown: 2, damage_multiplier: 2.0, special: 'critical', description: '뒤에서 치명타 공격' },
            { id: 'poison_blade', name: '독날', category: 'rogue', level_req: 6, cost: 18, cooldown: 3, damage_multiplier: 1.4, special: 'poison', description: '독을 발라 지속 데미지' },
            { id: 'shadow_step', name: '그림자 이동', category: 'rogue', level_req: 12, cost: 25, cooldown: 4, damage_multiplier: 1.7, special: 'teleport', description: '순간이동 후 공격' },
            { id: 'stealth', name: '은신', category: 'rogue', level_req: 8, cost: 20, cooldown: 5, damage_multiplier: 0, special: 'invisibility', description: '일정 시간 은신' },
            { id: 'dual_strike', name: '쌍검술', category: 'rogue', level_req: 15, cost: 30, cooldown: 4, damage_multiplier: 1.8, special: 'dual_hit', description: '두 번 연속 공격' },
            { id: 'caltrops', name: '쇠못 뿌리기', category: 'rogue', level_req: 18, cost: 25, cooldown: 6, damage_multiplier: 1.0, special: 'area_slow', description: '바닥에 쇠못을 뿌려 이동 방해' },
            { id: 'assassinate', name: '암살', category: 'rogue', level_req: 20, cost: 45, cooldown: 7, damage_multiplier: 4.0, special: 'stealth', description: '은신 후 치명적 일격' },
            { id: 'smoke_bomb', name: '연막탄', category: 'rogue', level_req: 22, cost: 35, cooldown: 8, damage_multiplier: 0, special: 'blind_aoe', description: '주변 적들을 실명시킴' },
            { id: 'thousand_cuts', name: '천 번의 칼날', category: 'rogue', level_req: 30, cost: 60, cooldown: 12, damage_multiplier: 3.0, special: 'multi_hit', description: '순식간에 수많은 공격' },
            { id: 'shadow_clone', name: '그림자 분신', category: 'rogue', level_req: 35, cost: 70, cooldown: 15, damage_multiplier: 2.5, special: 'clone', description: '그림자 분신이 함께 공격' },
            { id: 'void_strike', name: '공허의 일격', category: 'rogue', level_req: 45, cost: 80, cooldown: 18, damage_multiplier: 5.5, special: 'void_damage', description: '공허의 힘으로 치명타' },

            // === 성직자 스킬 (치유 및 신성마법) ===
            { id: 'heal', name: '치유', category: 'priest', level_req: 1, cost: 10, cooldown: 1, damage_multiplier: 0, special: 'heal', description: '체력 회복' },
            { id: 'holy_light', name: '성스러운 빛', category: 'priest', level_req: 5, cost: 20, cooldown: 3, damage_multiplier: 1.8, special: 'undead_damage', description: '언데드에게 강한 빛 공격' },
            { id: 'blessing', name: '축복', category: 'priest', level_req: 8, cost: 15, cooldown: 4, damage_multiplier: 0, special: 'buff', description: '아군 능력치 강화' },
            { id: 'cure', name: '정화', category: 'priest', level_req: 10, cost: 18, cooldown: 3, damage_multiplier: 0, special: 'cure', description: '독과 저주 제거' },
            { id: 'sanctuary', name: '성역', category: 'priest', level_req: 12, cost: 30, cooldown: 8, damage_multiplier: 0, special: 'sanctuary', description: '신성한 보호막 생성' },
            { id: 'turn_undead', name: '언데드 퇴치', category: 'priest', level_req: 15, cost: 25, cooldown: 5, damage_multiplier: 3.0, special: 'undead_banish', description: '언데드를 퇴치' },
            { id: 'divine_wrath', name: '신의 분노', category: 'priest', level_req: 18, cost: 35, cooldown: 6, damage_multiplier: 2.2, special: 'divine', description: '신성한 심판' },
            { id: 'mass_heal', name: '집단 치유', category: 'priest', level_req: 22, cost: 50, cooldown: 8, damage_multiplier: 0, special: 'group_heal', description: '모든 아군 치유' },
            { id: 'resurrection', name: '부활', category: 'priest', level_req: 30, cost: 80, cooldown: 15, damage_multiplier: 0, special: 'revive', description: '죽은 자를 되살림' },
            { id: 'divine_punishment', name: '천벌', category: 'priest', level_req: 35, cost: 60, cooldown: 12, damage_multiplier: 4.0, special: 'divine_strike', description: '하늘에서 내리는 벌' },
            { id: 'avatar', name: '화신', category: 'priest', level_req: 40, cost: 100, cooldown: 20, damage_multiplier: 0, special: 'avatar_form', description: '신의 화신으로 변신' },
            { id: 'miracle', name: '기적', category: 'priest', level_req: 50, cost: 120, cooldown: 25, damage_multiplier: 0, special: 'miracle', description: '죽은 자도 되살리는 기적' },

            // === 궁수 스킬 (원거리 공격) ===
            { id: 'precise_shot', name: '정확한 사격', category: 'archer', level_req: 1, cost: 8, cooldown: 1, damage_multiplier: 1.3, special: 'accurate', description: '빗나가지 않는 화살' },
            { id: 'power_shot', name: '강력한 사격', category: 'archer', level_req: 5, cost: 15, cooldown: 3, damage_multiplier: 1.8, special: 'piercing', description: '관통하는 강력한 화살' },
            { id: 'multi_shot', name: '다중 사격', category: 'archer', level_req: 7, cost: 20, cooldown: 3, damage_multiplier: 1.1, special: 'multi', description: '여러 발의 화살 동시 발사' },
            { id: 'poison_arrow', name: '독 화살', category: 'archer', level_req: 10, cost: 18, cooldown: 4, damage_multiplier: 1.4, special: 'poison', description: '독이 발린 화살' },
            { id: 'explosive_arrow', name: '폭발 화살', category: 'archer', level_req: 12, cost: 25, cooldown: 4, damage_multiplier: 2.0, special: 'explosion', description: '폭발하는 화살' },
            { id: 'ice_arrow', name: '얼음 화살', category: 'archer', level_req: 15, cost: 22, cooldown: 4, damage_multiplier: 1.6, special: 'freeze', description: '적을 얼리는 화살' },
            { id: 'arrow_rain', name: '화살비', category: 'archer', level_req: 18, cost: 40, cooldown: 6, damage_multiplier: 1.5, special: 'rain', description: '하늘에서 내리는 화살비' },
            { id: 'guided_arrow', name: '유도 화살', category: 'archer', level_req: 22, cost: 35, cooldown: 5, damage_multiplier: 2.2, special: 'homing', description: '목표를 추적하는 화살' },
            { id: 'phoenix_arrow', name: '불사조 화살', category: 'archer', level_req: 28, cost: 50, cooldown: 8, damage_multiplier: 2.8, special: 'fire_spread', description: '불사조의 화염이 퍼지는 화살' },
            { id: 'void_arrow', name: '공허 화살', category: 'archer', level_req: 35, cost: 60, cooldown: 10, damage_multiplier: 3.5, special: 'void_pierce', description: '모든 것을 관통하는 공허의 화살' },
            { id: 'thousand_arrows', name: '천 개의 화살', category: 'archer', level_req: 40, cost: 80, cooldown: 15, damage_multiplier: 4.0, special: 'arrow_storm', description: '수천 개의 화살이 일제히 발사' },

            // === 특수 스킬 (전설급 기술) ===
            { id: 'dragon_breath', name: '용의 숨결', category: 'special', level_req: 30, cost: 70, cooldown: 10, damage_multiplier: 3.0, special: 'dragon', description: '용의 화염 숨결' },
            { id: 'phoenix_rebirth', name: '불사조 환생', category: 'special', level_req: 35, cost: 80, cooldown: 20, damage_multiplier: 0, special: 'auto_revive', description: '죽으면 자동으로 부활' },
            { id: 'time_reversal', name: '시간 역행', category: 'special', level_req: 40, cost: 90, cooldown: 25, damage_multiplier: 0, special: 'time_rewind', description: '시간을 되돌려 상황 초기화' },
            { id: 'dimension_slash', name: '차원 베기', category: 'special', level_req: 42, cost: 85, cooldown: 18, damage_multiplier: 4.5, special: 'dimension_cut', description: '차원을 베어 공간을 가름' },
            { id: 'soul_burn', name: '영혼 연소', category: 'special', level_req: 45, cost: 95, cooldown: 20, damage_multiplier: 5.0, special: 'soul_damage', description: '적의 영혼을 직접 태움' },
            { id: 'gravity_crush', name: '중력 압축', category: 'special', level_req: 48, cost: 100, cooldown: 22, damage_multiplier: 4.8, special: 'gravity_field', description: '중력으로 적을 압축' },
            { id: 'ultima', name: '얼티마', category: 'special', level_req: 50, cost: 120, cooldown: 15, damage_multiplier: 6.0, special: 'ultima', description: '최강의 마법' },
            { id: 'black_hole', name: '블랙홀', category: 'special', level_req: 55, cost: 130, cooldown: 30, damage_multiplier: 7.0, special: 'black_hole', description: '모든 것을 빨아들이는 블랙홀' },
            { id: 'big_bang', name: '빅뱅', category: 'special', level_req: 58, cost: 140, cooldown: 35, damage_multiplier: 8.0, special: 'universe_birth', description: '새로운 우주를 창조하는 힘' },
            { id: 'world_breaker', name: '세계 파괴자', category: 'special', level_req: 60, cost: 150, cooldown: 20, damage_multiplier: 10.0, special: 'ultimate', description: '세계를 파괴할 수 있는 힘' },
            { id: 'existence_erase', name: '존재 소거', category: 'special', level_req: 65, cost: 200, cooldown: 50, damage_multiplier: 15.0, special: 'erase', description: '적의 존재 자체를 완전히 소거' },
            
            // === 생존 스킬 (던전용) ===
            { id: 'escape', name: '도망', category: 'survival', level_req: 1, cost: 5, cooldown: 3, damage_multiplier: 0, special: 'escape', description: '전투에서 도망침' },
            { id: 'guard', name: '방어', category: 'survival', level_req: 1, cost: 3, cooldown: 1, damage_multiplier: 0, special: 'guard', description: '다음 공격의 피해 감소' },
            { id: 'potion_drink', name: '물약 사용', category: 'survival', level_req: 1, cost: 0, cooldown: 0, damage_multiplier: 0, special: 'use_item', description: '치유 물약 등의 아이템 사용' },
            { id: 'analyze', name: '적 분석', category: 'survival', level_req: 5, cost: 10, cooldown: 2, damage_multiplier: 0, special: 'analyze', description: '적의 정보를 분석' },
            { id: 'emergency_heal', name: '응급 치료', category: 'survival', level_req: 8, cost: 15, cooldown: 5, damage_multiplier: 0, special: 'emergency_heal', description: '응급상황에서 즉시 치료' },
            { id: 'last_stand', name: '최후의 저항', category: 'survival', level_req: 15, cost: 30, cooldown: 10, damage_multiplier: 2.0, special: 'last_stand', description: '체력이 낮을 때 강력해짐' }
        ];

        this.monsterTypes = [
            // === 초급 몬스터 (레벨 1-10) - 30개 ===
            { id: 'goblin', name: '고블린', level: 1, hp: 50, attack: 15, defense: 5, agility: 20, special_abilities: ['quick_attack'], rewards: { money: 100, exp: 50 }},
            { id: 'kobold', name: '코볼드', level: 2, hp: 60, attack: 18, defense: 8, agility: 25, special_abilities: ['pack_hunting'], rewards: { money: 120, exp: 60 }},
            { id: 'rat', name: '거대 쥐', level: 1, hp: 30, attack: 12, defense: 3, agility: 30, special_abilities: ['disease'], rewards: { money: 80, exp: 40 }},
            { id: 'spider', name: '거미', level: 3, hp: 40, attack: 20, defense: 6, agility: 28, special_abilities: ['poison', 'web'], rewards: { money: 150, exp: 75 }},
            { id: 'slime', name: '슬라임', level: 2, hp: 80, attack: 10, defense: 2, agility: 5, special_abilities: ['split', 'acid'], rewards: { money: 100, exp: 50 }},
            { id: 'wolf', name: '늑대', level: 4, hp: 90, attack: 25, defense: 12, agility: 35, special_abilities: ['howl', 'pack_attack'], rewards: { money: 200, exp: 100 }},
            { id: 'bear', name: '곰', level: 6, hp: 200, attack: 40, defense: 25, agility: 15, special_abilities: ['claw_swipe', 'bear_hug'], rewards: { money: 300, exp: 150 }},
            { id: 'bandit', name: '산적', level: 5, hp: 120, attack: 30, defense: 15, agility: 20, special_abilities: ['dirty_fighting', 'steal'], rewards: { money: 250, exp: 125 }},
            { id: 'orc', name: '오크', level: 8, hp: 180, attack: 45, defense: 20, agility: 12, special_abilities: ['rage', 'club_smash'], rewards: { money: 400, exp: 200 }},
            { id: 'skeleton', name: '스켈레톤', level: 7, hp: 100, attack: 35, defense: 18, agility: 22, special_abilities: ['undead', 'bone_throw'], rewards: { money: 350, exp: 175 }},
            
            // 추가 초급 몬스터들
            { id: 'wild_boar', name: '멧돼지', level: 3, hp: 110, attack: 28, defense: 20, agility: 18, special_abilities: ['charge', 'tusks'], rewards: { money: 170, exp: 85 }},
            { id: 'giant_ant', name: '거대 개미', level: 2, hp: 45, attack: 16, defense: 12, agility: 22, special_abilities: ['acid_spray', 'swarm'], rewards: { money: 110, exp: 55 }},
            { id: 'dire_cat', name: '흉포한 고양이', level: 4, hp: 70, attack: 32, defense: 8, agility: 40, special_abilities: ['pounce', 'night_vision'], rewards: { money: 190, exp: 95 }},
            { id: 'mushroom_man', name: '버섯인간', level: 5, hp: 85, attack: 22, defense: 15, agility: 12, special_abilities: ['spore_cloud', 'regeneration'], rewards: { money: 220, exp: 110 }},
            { id: 'imp_spawn', name: '임프 새끼', level: 6, hp: 95, attack: 38, defense: 10, agility: 30, special_abilities: ['fire_bite', 'teleport'], rewards: { money: 280, exp: 140 }},
            { id: 'crystal_golem', name: '수정 골렘', level: 7, hp: 150, attack: 25, defense: 30, agility: 8, special_abilities: ['crystal_shard', 'reflect'], rewards: { money: 320, exp: 160 }},
            { id: 'forest_sprite', name: '숲의 정령', level: 4, hp: 55, attack: 30, defense: 5, agility: 45, special_abilities: ['nature_magic', 'invisibility'], rewards: { money: 200, exp: 100 }},
            { id: 'poison_frog', name: '독 개구리', level: 3, hp: 65, attack: 20, defense: 8, agility: 25, special_abilities: ['poison_spit', 'leap'], rewards: { money: 160, exp: 80 }},
            { id: 'cave_bat', name: '동굴 박쥐', level: 2, hp: 35, attack: 18, defense: 4, agility: 50, special_abilities: ['sonic_screech', 'blood_drain'], rewards: { money: 130, exp: 65 }},
            { id: 'thorn_vine', name: '가시덩굴', level: 5, hp: 120, attack: 26, defense: 18, agility: 6, special_abilities: ['entangle', 'thorn_shot'], rewards: { money: 240, exp: 120 }},
            { id: 'mud_crab', name: '진흙게', level: 4, hp: 90, attack: 24, defense: 22, agility: 15, special_abilities: ['pincer_attack', 'mud_spray'], rewards: { money: 180, exp: 90 }},
            { id: 'fire_beetle', name: '불딱정벌레', level: 6, hp: 80, attack: 35, defense: 16, agility: 20, special_abilities: ['fire_blast', 'armor_pierce'], rewards: { money: 270, exp: 135 }},
            { id: 'ice_sprite', name: '얼음 정령', level: 7, hp: 75, attack: 40, defense: 12, agility: 35, special_abilities: ['frost_bolt', 'ice_armor'], rewards: { money: 330, exp: 165 }},
            { id: 'shadow_hound', name: '그림자 사냥개', level: 8, hp: 130, attack: 42, defense: 14, agility: 38, special_abilities: ['shadow_bite', 'stealth'], rewards: { money: 380, exp: 190 }},
            { id: 'earth_mole', name: '거대 두더지', level: 5, hp: 100, attack: 28, defense: 25, agility: 10, special_abilities: ['burrow', 'earth_spike'], rewards: { money: 230, exp: 115 }},
            { id: 'wind_wisp', name: '바람 요정', level: 6, hp: 60, attack: 38, defense: 8, agility: 50, special_abilities: ['wind_slash', 'evasion'], rewards: { money: 290, exp: 145 }},
            { id: 'bone_hound', name: '해골개', level: 9, hp: 140, attack: 46, defense: 20, agility: 25, special_abilities: ['bone_bite', 'howl_of_dead'], rewards: { money: 420, exp: 210 }},
            { id: 'living_armor', name: '살아있는 갑옷', level: 8, hp: 160, attack: 38, defense: 35, agility: 12, special_abilities: ['armor_slam', 'defend'], rewards: { money: 360, exp: 180 }},
            { id: 'mad_scientist', name: '미친 과학자', level: 9, hp: 110, attack: 48, defense: 15, agility: 28, special_abilities: ['chemical_bomb', 'experiment'], rewards: { money: 440, exp: 220 }},
            { id: 'cursed_doll', name: '저주받은 인형', level: 10, hp: 95, attack: 50, defense: 12, agility: 32, special_abilities: ['curse', 'needle_rain'], rewards: { money: 480, exp: 240 }},
            
            // === 중급 몬스터 (레벨 10-25) - 28개 ===
            { id: 'zombie', name: '좀비', level: 10, hp: 250, attack: 50, defense: 15, agility: 8, special_abilities: ['undead', 'infection', 'slow_regen'], rewards: { money: 500, exp: 250 }},
            { id: 'troll', name: '트롤', level: 12, hp: 350, attack: 65, defense: 35, agility: 10, special_abilities: ['regeneration', 'stone_throw'], rewards: { money: 600, exp: 300 }},
            { id: 'ogre', name: '오거', level: 15, hp: 450, attack: 80, defense: 40, agility: 8, special_abilities: ['club_slam', 'stomp'], rewards: { money: 750, exp: 375 }},
            { id: 'minotaur', name: '미노타우로스', level: 18, hp: 600, attack: 90, defense: 45, agility: 15, special_abilities: ['charge', 'maze_master'], rewards: { money: 900, exp: 450 }},
            { id: 'harpy', name: '하피', level: 16, hp: 300, attack: 70, defense: 25, agility: 45, special_abilities: ['fly', 'sonic_scream'], rewards: { money: 800, exp: 400 }},
            { id: 'gargoyle', name: '가고일', level: 20, hp: 500, attack: 85, defense: 60, agility: 20, special_abilities: ['stone_skin', 'dive_attack'], rewards: { money: 1000, exp: 500 }},
            { id: 'wraith', name: '망령', level: 22, hp: 350, attack: 95, defense: 30, agility: 40, special_abilities: ['incorporeal', 'life_drain'], rewards: { money: 1100, exp: 550 }},
            { id: 'cyclops', name: '사이클롭스', level: 25, hp: 800, attack: 120, defense: 55, agility: 12, special_abilities: ['giant_strength', 'boulder_throw'], rewards: { money: 1250, exp: 625 }},
            
            // 추가 중급 몬스터들
            { id: 'frost_giant', name: '서리거인', level: 24, hp: 750, attack: 110, defense: 50, agility: 14, special_abilities: ['frost_breath', 'ice_armor'], rewards: { money: 1200, exp: 600 }},
            { id: 'flame_knight', name: '화염기사', level: 21, hp: 550, attack: 95, defense: 65, agility: 18, special_abilities: ['flame_sword', 'fire_shield'], rewards: { money: 1050, exp: 525 }},
            { id: 'dark_priest', name: '어둠의 사제', level: 19, hp: 400, attack: 85, defense: 35, agility: 25, special_abilities: ['dark_magic', 'curse'], rewards: { money: 950, exp: 475 }},
            { id: 'stone_guardian', name: '돌 수호자', level: 23, hp: 700, attack: 90, defense: 80, agility: 8, special_abilities: ['stone_slam', 'earthquake'], rewards: { money: 1150, exp: 575 }},
            { id: 'shadow_assassin', name: '그림자 암살자', level: 17, hp: 320, attack: 100, defense: 25, agility: 55, special_abilities: ['stealth_kill', 'shadow_step'], rewards: { money: 850, exp: 425 }},
            { id: 'battle_mage', name: '전투마법사', level: 20, hp: 380, attack: 105, defense: 30, agility: 35, special_abilities: ['magic_missile', 'mana_shield'], rewards: { money: 1000, exp: 500 }},
            { id: 'werewolf', name: '늑대인간', level: 18, hp: 480, attack: 88, defense: 35, agility: 45, special_abilities: ['transformation', 'pack_leader'], rewards: { money: 900, exp: 450 }},
            { id: 'vampire', name: '뱀파이어', level: 22, hp: 420, attack: 98, defense: 40, agility: 50, special_abilities: ['blood_drain', 'bat_form'], rewards: { money: 1100, exp: 550 }},
            { id: 'iron_golem', name: '강철 골렘', level: 20, hp: 650, attack: 75, defense: 90, agility: 5, special_abilities: ['metal_fist', 'repair'], rewards: { money: 1000, exp: 500 }},
            { id: 'wind_serpent', name: '바람뱀', level: 16, hp: 280, attack: 82, defense: 20, agility: 60, special_abilities: ['wind_coil', 'tornado'], rewards: { money: 800, exp: 400 }},
            { id: 'lava_golem', name: '용암 골렘', level: 25, hp: 800, attack: 115, defense: 70, agility: 10, special_abilities: ['lava_punch', 'molten_core'], rewards: { money: 1250, exp: 625 }},
            { id: 'ice_troll', name: '얼음 트롤', level: 14, hp: 420, attack: 70, defense: 45, agility: 12, special_abilities: ['ice_club', 'frost_regeneration'], rewards: { money: 700, exp: 350 }},
            { id: 'plague_doctor', name: '역병의사', level: 21, hp: 360, attack: 92, defense: 38, agility: 28, special_abilities: ['plague_cloud', 'disease'], rewards: { money: 1050, exp: 525 }},
            { id: 'crystal_spider', name: '수정거미', level: 15, hp: 240, attack: 78, defense: 25, agility: 55, special_abilities: ['crystal_web', 'shard_shot'], rewards: { money: 750, exp: 375 }},
            { id: 'bone_dragon', name: '해골드래곤', level: 24, hp: 720, attack: 125, defense: 55, agility: 30, special_abilities: ['bone_breath', 'fear_aura'], rewards: { money: 1200, exp: 600 }},
            { id: 'thunder_bird', name: '천둥새', level: 19, hp: 350, attack: 95, defense: 30, agility: 65, special_abilities: ['lightning_strike', 'storm_wing'], rewards: { money: 950, exp: 475 }},
            { id: 'sand_worm', name: '모래벌레', level: 17, hp: 500, attack: 85, defense: 40, agility: 15, special_abilities: ['burrow_attack', 'sand_storm'], rewards: { money: 850, exp: 425 }},
            { id: 'mind_flayer', name: '마인드 플레이어', level: 23, hp: 380, attack: 100, defense: 35, agility: 40, special_abilities: ['mind_blast', 'telepathy'], rewards: { money: 1150, exp: 575 }},
            { id: 'earth_drake', name: '대지 드레이크', level: 22, hp: 600, attack: 105, defense: 60, agility: 25, special_abilities: ['earth_breath', 'tremor'], rewards: { money: 1100, exp: 550 }},
            { id: 'void_hound', name: '공허 사냥개', level: 25, hp: 450, attack: 118, defense: 25, agility: 50, special_abilities: ['void_bite', 'phase_shift'], rewards: { money: 1250, exp: 625 }},
            { id: 'corrupted_treant', name: '타락한 트리언트', level: 20, hp: 680, attack: 80, defense: 75, agility: 8, special_abilities: ['root_entangle', 'poison_sap'], rewards: { money: 1000, exp: 500 }},

            // === 마법 생물 (레벨 15-30) ===
            { id: 'fire_elemental', name: '화염 정령', level: 18, hp: 350, attack: 90, defense: 25, agility: 30, special_abilities: ['flame_burst', 'fire_immunity'], rewards: { money: 900, exp: 450 }},
            { id: 'ice_elemental', name: '얼음 정령', level: 18, hp: 350, attack: 85, defense: 35, agility: 25, special_abilities: ['frost_aura', 'ice_immunity'], rewards: { money: 900, exp: 450 }},
            { id: 'earth_elemental', name: '대지 정령', level: 20, hp: 500, attack: 70, defense: 60, agility: 15, special_abilities: ['earthquake', 'stone_armor'], rewards: { money: 1000, exp: 500 }},
            { id: 'wind_elemental', name: '바람 정령', level: 19, hp: 280, attack: 100, defense: 20, agility: 50, special_abilities: ['wind_slash', 'flight'], rewards: { money: 950, exp: 475 }},
            { id: 'lightning_elemental', name: '번개 정령', level: 22, hp: 320, attack: 110, defense: 30, agility: 45, special_abilities: ['chain_lightning', 'static_field'], rewards: { money: 1100, exp: 550 }},
            { id: 'shadow_elemental', name: '그림자 정령', level: 25, hp: 400, attack: 105, defense: 25, agility: 55, special_abilities: ['shadow_step', 'darkness'], rewards: { money: 1250, exp: 625 }},
            { id: 'golem', name: '골렘', level: 24, hp: 700, attack: 90, defense: 80, agility: 10, special_abilities: ['magic_resistance', 'slam'], rewards: { money: 1200, exp: 600 }},
            { id: 'djinn', name: '지니', level: 28, hp: 450, attack: 120, defense: 40, agility: 40, special_abilities: ['wish_magic', 'teleport'], rewards: { money: 1400, exp: 700 }},
            
            // === 드래곤류 (레벨 25-60) ===
            { id: 'wyvern', name: '와이번', level: 25, hp: 800, attack: 120, defense: 50, agility: 40, special_abilities: ['fly', 'poison_sting'], rewards: { money: 1500, exp: 750 }},
            { id: 'drake', name: '드레이크', level: 30, hp: 1200, attack: 150, defense: 70, agility: 35, special_abilities: ['flame_breath', 'wing_attack'], rewards: { money: 2000, exp: 1000 }},
            { id: 'young_dragon', name: '어린 용', level: 35, hp: 1600, attack: 180, defense: 90, agility: 45, special_abilities: ['dragon_breath', 'claw_swipe'], rewards: { money: 3000, exp: 1500 }},
            { id: 'adult_dragon', name: '성인 용', level: 45, hp: 3000, attack: 250, defense: 120, agility: 50, special_abilities: ['mega_breath', 'dragon_fear'], rewards: { money: 8000, exp: 4000 }},
            { id: 'ancient_dragon', name: '고대 용', level: 60, hp: 5000, attack: 400, defense: 200, agility: 60, special_abilities: ['ancient_magic', 'time_stop'], rewards: { money: 20000, exp: 10000 }},
            { id: 'elder_dragon', name: '장로 용', level: 70, hp: 8000, attack: 500, defense: 300, agility: 70, special_abilities: ['reality_break', 'dimension_breath'], rewards: { money: 40000, exp: 20000 }},
            
            // === 언데드 (레벨 20-50) ===
            { id: 'ghost', name: '유령', level: 20, hp: 300, attack: 80, defense: 20, agility: 50, special_abilities: ['incorporeal', 'fear'], rewards: { money: 1000, exp: 500 }},
            { id: 'banshee', name: '밴시', level: 30, hp: 500, attack: 120, defense: 30, agility: 60, special_abilities: ['death_wail', 'soul_drain'], rewards: { money: 2000, exp: 1000 }},
            { id: 'lich', name: '리치', level: 40, hp: 1200, attack: 200, defense: 80, agility: 40, special_abilities: ['necromancy', 'death_magic'], rewards: { money: 5000, exp: 2500 }},
            { id: 'death_knight', name: '데스 나이트', level: 35, hp: 1000, attack: 180, defense: 100, agility: 30, special_abilities: ['undead_strength', 'dark_aura'], rewards: { money: 3500, exp: 1750 }},
            { id: 'vampire_lord', name: '뱀파이어 로드', level: 45, hp: 1800, attack: 220, defense: 90, agility: 80, special_abilities: ['blood_drain', 'bat_form'], rewards: { money: 7000, exp: 3500 }},
            
            // === 악마 (레벨 30-60) ===
            { id: 'imp', name: '임프', level: 30, hp: 400, attack: 100, defense: 40, agility: 60, special_abilities: ['fire_magic', 'teleport'], rewards: { money: 1800, exp: 900 }},
            { id: 'succubus', name: '서큐버스', level: 35, hp: 600, attack: 130, defense: 50, agility: 70, special_abilities: ['charm', 'life_drain'], rewards: { money: 2500, exp: 1250 }},
            { id: 'balrog', name: '발록', level: 50, hp: 3500, attack: 300, defense: 150, agility: 40, special_abilities: ['flame_whip', 'demon_roar'], rewards: { money: 10000, exp: 5000 }},
            { id: 'archdevil', name: '대악마', level: 55, hp: 4000, attack: 350, defense: 180, agility: 60, special_abilities: ['hell_fire', 'corruption'], rewards: { money: 15000, exp: 7500 }},
            
            // === 신화 생물 (레벨 40-80) ===
            { id: 'phoenix', name: '불사조', level: 45, hp: 2500, attack: 250, defense: 120, agility: 90, special_abilities: ['rebirth', 'phoenix_fire'], rewards: { money: 8000, exp: 4000 }},
            { id: 'unicorn', name: '유니콘', level: 40, hp: 2000, attack: 180, defense: 100, agility: 100, special_abilities: ['purification', 'heal'], rewards: { money: 6000, exp: 3000 }},
            { id: 'kraken', name: '크라켄', level: 60, hp: 6000, attack: 400, defense: 200, agility: 30, special_abilities: ['tentacle_grab', 'water_spout'], rewards: { money: 25000, exp: 12500 }},
            { id: 'leviathan', name: '리바이어던', level: 65, hp: 8000, attack: 450, defense: 250, agility: 40, special_abilities: ['tidal_wave', 'water_prison'], rewards: { money: 30000, exp: 15000 }},
            { id: 'behemoth', name: '베히모스', level: 70, hp: 10000, attack: 500, defense: 300, agility: 20, special_abilities: ['earth_shatter', 'rampage'], rewards: { money: 35000, exp: 17500 }},
            
            // === 보스 몬스터 (레벨 50-90) ===
            { id: 'demon_lord', name: '마왕', level: 50, hp: 5000, attack: 350, defense: 150, agility: 80, special_abilities: ['demon_magic', 'hellfire_storm'], rewards: { money: 20000, exp: 10000 }},
            { id: 'lich_king', name: '리치 킹', level: 55, hp: 4500, attack: 400, defense: 100, agility: 90, special_abilities: ['death_magic', 'undead_army'], rewards: { money: 25000, exp: 12500 }},
            { id: 'dragon_king', name: '용왕', level: 65, hp: 8000, attack: 500, defense: 300, agility: 80, special_abilities: ['royal_breath', 'dragon_magic'], rewards: { money: 40000, exp: 20000 }},
            { id: 'titan', name: '타이탄', level: 70, hp: 12000, attack: 600, defense: 400, agility: 50, special_abilities: ['giant_power', 'earth_move'], rewards: { money: 50000, exp: 25000 }},
            { id: 'fallen_angel', name: '타락천사', level: 75, hp: 10000, attack: 650, defense: 300, agility: 100, special_abilities: ['dark_wings', 'fallen_magic'], rewards: { money: 60000, exp: 30000 }},
            { id: 'world_eater', name: '세계포식자', level: 80, hp: 15000, attack: 700, defense: 500, agility: 60, special_abilities: ['devour', 'reality_tear'], rewards: { money: 80000, exp: 40000 }},
            { id: 'chaos_lord', name: '혼돈의 군주', level: 85, hp: 20000, attack: 800, defense: 400, agility: 120, special_abilities: ['chaos_magic', 'disorder'], rewards: { money: 100000, exp: 50000 }},
            { id: 'void_lord', name: '공허의 군주', level: 90, hp: 25000, attack: 1000, defense: 500, agility: 150, special_abilities: ['void_magic', 'existence_drain'], rewards: { money: 150000, exp: 75000 }},
            
            // === 특수 몬스터 ===
            { id: 'mimic', name: '미믹', level: 10, hp: 200, attack: 50, defense: 80, agility: 5, special_abilities: ['surprise_attack', 'treasure_lure'], rewards: { money: 2000, exp: 500 }},
            { id: 'doppelganger', name: '도플갱어', level: 25, hp: 500, attack: 100, defense: 50, agility: 70, special_abilities: ['copy_ability', 'shape_shift'], rewards: { money: 1500, exp: 750 }},
            { id: 'chimera', name: '키메라', level: 35, hp: 1500, attack: 200, defense: 100, agility: 60, special_abilities: ['multi_head', 'breath_mix'], rewards: { money: 4000, exp: 2000 }},
            { id: 'hydra', name: '히드라', level: 40, hp: 2000, attack: 180, defense: 120, agility: 40, special_abilities: ['regenerate_head', 'poison_breath'], rewards: { money: 6000, exp: 3000 }}
        ];
    }

    async initializeCombatSystem() {
        // 스킬 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                skill_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                level_requirement INTEGER DEFAULT 1,
                mana_cost INTEGER DEFAULT 0,
                cooldown INTEGER DEFAULT 0,
                damage_multiplier REAL DEFAULT 1.0,
                special_effect TEXT,
                description TEXT
            )
        `);

        // 플레이어 스킬 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS player_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                skill_id TEXT NOT NULL,
                skill_level INTEGER DEFAULT 1,
                learned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (player_id) REFERENCES players(id),
                FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
            )
        `);

        // 몬스터 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS monsters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                monster_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                level INTEGER DEFAULT 1,
                base_hp INTEGER DEFAULT 100,
                base_attack INTEGER DEFAULT 20,
                base_defense INTEGER DEFAULT 10,
                base_agility INTEGER DEFAULT 15,
                special_abilities TEXT,
                rewards TEXT,
                description TEXT
            )
        `);

        // 전투 기록 테이블
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS battle_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                battle_type TEXT NOT NULL, -- 'dungeon', 'pvp', 'monster'
                opponent_name TEXT,
                result TEXT NOT NULL, -- 'victory', 'defeat', 'draw'
                damage_dealt INTEGER DEFAULT 0,
                damage_taken INTEGER DEFAULT 0,
                skills_used TEXT,
                rewards_gained TEXT,
                battle_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (player_id) REFERENCES players(id)
            )
        `);

        // 플레이어 마나 추가
        await this.db.run(`
            ALTER TABLE players ADD COLUMN mana INTEGER DEFAULT 100
        `).catch(() => {});

        await this.db.run(`
            ALTER TABLE players ADD COLUMN max_mana INTEGER DEFAULT 100
        `).catch(() => {});

        // 스킬 데이터 삽입
        for (const skill of this.skillTypes) {
            await this.db.run(`
                INSERT OR IGNORE INTO skills (skill_id, name, category, level_requirement, mana_cost, cooldown, damage_multiplier, special_effect, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [skill.id, skill.name, skill.category, skill.level_req, skill.cost, 
                skill.cooldown, skill.damage_multiplier, skill.special, skill.description]);
        }

        // 몬스터 데이터 삽입
        for (const monster of this.monsterTypes) {
            await this.db.run(`
                INSERT OR IGNORE INTO monsters (monster_id, name, level, base_hp, base_attack, base_defense, base_agility, special_abilities, rewards)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [monster.id, monster.name, monster.level, monster.hp, monster.attack, 
                monster.defense, monster.agility, monster.special || '', JSON.stringify(monster.rewards)]);
        }

        console.log('전투 시스템 초기화 완료');
    }

    async learnSkill(playerId, skillId) {
        try {
            // 스킬 정보 확인
            const skill = await this.db.get('SELECT * FROM skills WHERE skill_id = ?', [skillId]);
            if (!skill) {
                return { success: false, message: '존재하지 않는 스킬입니다.' };
            }

            // 플레이어 레벨 확인
            const player = await this.db.get('SELECT level, money FROM players WHERE id = ?', [playerId]);
            if (player.level < skill.level_requirement) {
                return { 
                    success: false, 
                    message: `레벨이 부족합니다. 필요 레벨: ${skill.level_requirement}` 
                };
            }

            // 이미 배운 스킬인지 확인
            const existingSkill = await this.db.get(`
                SELECT * FROM player_skills WHERE player_id = ? AND skill_id = ?
            `, [playerId, skillId]);

            if (existingSkill) {
                return { success: false, message: '이미 배운 스킬입니다.' };
            }

            // 스킬 학습 비용 (레벨 * 1000)
            const cost = skill.level_requirement * 1000;
            if (player.money < cost) {
                return { 
                    success: false, 
                    message: `돈이 부족합니다. 필요: ${cost.toLocaleString()}원` 
                };
            }

            // 스킬 학습
            await this.db.run(`
                INSERT INTO player_skills (player_id, skill_id)
                VALUES (?, ?)
            `, [playerId, skillId]);

            // 비용 차감
            await this.db.run(`
                UPDATE players SET money = money - ? WHERE id = ?
            `, [cost, playerId]);

            return {
                success: true,
                message: `${skill.name} 스킬을 배웠습니다!`,
                cost: cost
            };

        } catch (error) {
            console.error('스킬 학습 오류:', error);
            return { success: false, message: '스킬 학습 중 오류가 발생했습니다.' };
        }
    }

    async startBattle(playerId, dungeonId, monsterId = null) {
        try {
            // 플레이어 정보 확인
            const player = await this.db.get('SELECT * FROM players WHERE id = ?', [playerId]);
            const playerStats = await this.db.get('SELECT * FROM player_stats WHERE player_id = ?', [playerId]);
            
            if (!player || !playerStats) {
                return { success: false, message: '플레이어 정보를 찾을 수 없습니다.' };
            }

            // 몬스터 생성 (랜덤 또는 지정)
            let monster;
            if (monsterId) {
                monster = this.monsterTypes.find(m => m.id === monsterId);
            } else {
                // 던전 레벨에 따른 랜덤 몬스터
                const dungeon = await this.db.get('SELECT difficulty FROM dungeons WHERE id = ?', [dungeonId]);
                const suitableMonsters = this.monsterTypes.filter(m => 
                    m.level >= dungeon.difficulty && m.level <= dungeon.difficulty + 5
                );
                monster = suitableMonsters[Math.floor(Math.random() * suitableMonsters.length)];
            }

            if (!monster) {
                return { success: false, message: '적절한 몬스터를 찾을 수 없습니다.' };
            }

            // 전투 상태 생성
            const battleState = {
                playerId: playerId,
                dungeonId: dungeonId,
                player: {
                    hp: playerStats.health,
                    maxHp: playerStats.health,
                    mana: player.mana || 100,
                    maxMana: player.max_mana || 100,
                    attack: playerStats.strength,
                    defense: playerStats.health / 10,
                    agility: playerStats.agility,
                    effects: []
                },
                monster: {
                    ...monster,
                    currentHp: monster.hp,
                    effects: []
                },
                turn: 1,
                playerTurn: true,
                battleLog: [`🏟️ ${monster.name}과(와)의 전투가 시작됩니다!`],
                skillCooldowns: {},
                startTime: Date.now()
            };

            // 활성 전투에 추가
            this.activeBattles.set(playerId, battleState);

            return {
                success: true,
                message: `${monster.name}과(와)의 전투가 시작됩니다!`,
                battle: battleState
            };

        } catch (error) {
            console.error('전투 시작 오류:', error);
            return { success: false, message: '전투 시작 중 오류가 발생했습니다.' };
        }
    }

    async useSkill(playerId, skillId, targetType = 'enemy') {
        try {
            const battle = this.activeBattles.get(playerId);
            if (!battle) {
                return { success: false, message: '진행 중인 전투가 없습니다.' };
            }

            if (!battle.playerTurn) {
                return { success: false, message: '플레이어의 턴이 아닙니다.' };
            }

            // 스킬 정보 확인
            const playerSkill = await this.db.get(`
                SELECT ps.*, s.*
                FROM player_skills ps
                JOIN skills s ON ps.skill_id = s.skill_id
                WHERE ps.player_id = ? AND ps.skill_id = ?
            `, [playerId, skillId]);

            if (!playerSkill) {
                return { success: false, message: '배우지 않은 스킬입니다.' };
            }

            // 마나 확인
            if (battle.player.mana < playerSkill.mana_cost) {
                return { 
                    success: false, 
                    message: `마나가 부족합니다. 필요: ${playerSkill.mana_cost}, 보유: ${battle.player.mana}` 
                };
            }

            // 쿨다운 확인
            const cooldownKey = `${playerId}_${skillId}`;
            if (battle.skillCooldowns[cooldownKey] && battle.skillCooldowns[cooldownKey] > battle.turn) {
                return { 
                    success: false, 
                    message: `스킬이 쿨다운 중입니다. ${battle.skillCooldowns[cooldownKey] - battle.turn}턴 남음` 
                };
            }

            // 스킬 사용
            battle.player.mana -= playerSkill.mana_cost;
            battle.skillCooldowns[cooldownKey] = battle.turn + playerSkill.cooldown;

            const result = await this.executeSkill(battle, playerSkill, 'player', targetType);
            battle.battleLog.push(result.message);

            // 몬스터가 죽었는지 확인
            if (battle.monster.currentHp <= 0) {
                const battleResult = await this.endBattle(playerId, 'victory');
                return {
                    success: true,
                    message: result.message,
                    battleEnd: true,
                    result: battleResult
                };
            }

            // 몬스터 턴
            battle.playerTurn = false;
            setTimeout(() => this.monsterTurn(playerId), 2000);

            return {
                success: true,
                message: result.message,
                battle: battle
            };

        } catch (error) {
            console.error('스킬 사용 오류:', error);
            return { success: false, message: '스킬 사용 중 오류가 발생했습니다.' };
        }
    }

    async executeSkill(battle, skill, caster, targetType) {
        const isPlayer = caster === 'player';
        const attacker = isPlayer ? battle.player : battle.monster;
        const target = isPlayer ? battle.monster : battle.player;

        let message = `${isPlayer ? '플레이어' : battle.monster.name}가 ${skill.name}을(를) 사용했습니다!`;
        let damage = 0;

        // 기본 데미지 계산
        if (skill.damage_multiplier > 0) {
            const baseDamage = attacker.attack || attacker.base_attack;
            const targetDefense = target.defense || target.base_defense || 0;
            damage = Math.max(1, Math.floor((baseDamage * skill.damage_multiplier) - targetDefense));
            
            // 특수 효과 적용
            switch (skill.special_effect) {
                case 'critical':
                    if (Math.random() < 0.3) { // 30% 크리티컬 확률
                        damage *= 2;
                        message += ' 치명타!';
                    }
                    break;
                    
                case 'execute':
                    if (target.currentHp < target.maxHp * 0.2) { // 체력 20% 이하시
                        if (Math.random() < 0.5) { // 50% 즉사 확률
                            damage = target.currentHp;
                            message += ' 처형 성공!';
                        }
                    }
                    break;
                    
                case 'aoe':
                    // AOE는 단일 타겟에서는 일반 데미지
                    message += ' (광역 공격)';
                    break;
            }

            target.currentHp = Math.max(0, target.currentHp - damage);
            message += ` ${damage} 데미지!`;
        }

        // 특수 효과 처리
        switch (skill.special_effect) {
            case 'heal':
                const healAmount = Math.floor(attacker.maxHp * 0.3);
                attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
                message = `${skill.name}으로 ${healAmount} 체력을 회복했습니다!`;
                break;
                
            case 'stun':
                if (Math.random() < 0.6) { // 60% 확률
                    target.effects = target.effects || [];
                    target.effects.push({ type: 'stun', duration: 1 });
                    message += ' 적이 기절했습니다!';
                }
                break;
                
            case 'poison':
                target.effects = target.effects || [];
                target.effects.push({ type: 'poison', duration: 3, damage: Math.floor(damage * 0.5) });
                message += ' 독이 퍼집니다!';
                break;
                
            case 'buff':
                attacker.effects = attacker.effects || [];
                attacker.effects.push({ type: 'attack_buff', duration: 3, bonus: 50 });
                message = `${skill.name}으로 공격력이 증가했습니다!`;
                break;
        }

        return { message, damage };
    }

    async monsterTurn(playerId) {
        const battle = this.activeBattles.get(playerId);
        if (!battle || battle.playerTurn) return;

        // 몬스터 AI
        const monster = battle.monster;
        const player = battle.player;

        // 기본 공격
        const damage = Math.max(1, monster.attack - (player.defense || 0));
        player.hp = Math.max(0, player.hp - damage);
        
        battle.battleLog.push(`${monster.name}의 공격! ${damage} 데미지!`);

        // 플레이어가 죽었는지 확인
        if (player.hp <= 0) {
            await this.endBattle(playerId, 'defeat');
            return;
        }

        // 턴 전환
        battle.turn++;
        battle.playerTurn = true;

        // 지속 효과 처리
        this.processEffects(battle);
    }

    processEffects(battle) {
        // 플레이어 효과 처리
        if (battle.player.effects) {
            battle.player.effects = battle.player.effects.filter(effect => {
                if (effect.type === 'poison') {
                    battle.player.hp = Math.max(0, battle.player.hp - effect.damage);
                    battle.battleLog.push(`독으로 인해 ${effect.damage} 데미지!`);
                }
                effect.duration--;
                return effect.duration > 0;
            });
        }

        // 몬스터 효과 처리
        if (battle.monster.effects) {
            battle.monster.effects = battle.monster.effects.filter(effect => {
                if (effect.type === 'poison') {
                    battle.monster.currentHp = Math.max(0, battle.monster.currentHp - effect.damage);
                    battle.battleLog.push(`${battle.monster.name}이 독으로 인해 ${effect.damage} 데미지!`);
                }
                effect.duration--;
                return effect.duration > 0;
            });
        }
    }

    async endBattle(playerId, result) {
        try {
            const battle = this.activeBattles.get(playerId);
            if (!battle) return;

            let rewards = { money: 0, experience: 0, items: [] };
            let message = '';

            if (result === 'victory') {
                rewards = battle.monster.rewards;
                message = `🎉 승리! ${battle.monster.name}을(를) 물리쳤습니다!`;
                
                // 보상 지급
                await this.db.run(`
                    UPDATE players 
                    SET money = money + ?, experience = experience + ?
                    WHERE id = ?
                `, [rewards.money, rewards.exp, playerId]);

                // 거래 기록
                await this.db.run(`
                    INSERT INTO transactions (player_id, type, amount, description)
                    VALUES (?, 'battle_reward', ?, ?)
                `, [playerId, rewards.money, `${battle.monster.name} 처치 보상`]);

            } else {
                message = `💀 패배... ${battle.monster.name}에게 당했습니다.`;
            }

            // 전투 기록 저장
            await this.db.run(`
                INSERT INTO battle_records (player_id, battle_type, opponent_name, result, damage_dealt, damage_taken, rewards_gained)
                VALUES (?, 'dungeon', ?, ?, ?, ?, ?)
            `, [playerId, battle.monster.name, result, 
                battle.monster.hp - battle.monster.currentHp, 
                battle.player.maxHp - battle.player.hp,
                JSON.stringify(rewards)]);

            // 활성 전투에서 제거
            this.activeBattles.delete(playerId);

            return {
                success: result === 'victory',
                message: message,
                rewards: rewards,
                battleLog: battle.battleLog
            };

        } catch (error) {
            console.error('전투 종료 오류:', error);
            return { success: false, message: '전투 종료 중 오류가 발생했습니다.' };
        }
    }

    async getBattleState(playerId) {
        return this.activeBattles.get(playerId);
    }

    async getPlayerSkills(playerId) {
        return await this.db.all(`
            SELECT ps.*, s.name, s.category, s.mana_cost, s.cooldown, s.damage_multiplier, s.description
            FROM player_skills ps
            JOIN skills s ON ps.skill_id = s.skill_id
            WHERE ps.player_id = ?
            ORDER BY s.level_requirement ASC
        `, [playerId]);
    }

    async getAvailableSkills(playerId) {
        const player = await this.db.get('SELECT level FROM players WHERE id = ?', [playerId]);
        const learnedSkills = await this.db.all(`
            SELECT skill_id FROM player_skills WHERE player_id = ?
        `, [playerId]);
        
        const learnedSkillIds = learnedSkills.map(s => s.skill_id);

        return await this.db.all(`
            SELECT * FROM skills 
            WHERE level_requirement <= ? AND skill_id NOT IN (${learnedSkillIds.map(() => '?').join(',') || 'NULL'})
            ORDER BY level_requirement ASC
        `, [player.level, ...learnedSkillIds]);
    }

    createBattleEmbed(battle) {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⚔️ 전투 중!')
            .setTimestamp();

        // 플레이어 상태
        const playerHpBar = this.createHpBar(battle.player.hp, battle.player.maxHp);
        const playerManaBar = this.createManaBar(battle.player.mana, battle.player.maxMana);
        
        embed.addFields({
            name: '👤 플레이어',
            value: [
                `❤️ HP: ${playerHpBar} ${battle.player.hp}/${battle.player.maxHp}`,
                `💙 MP: ${playerManaBar} ${battle.player.mana}/${battle.player.maxMana}`
            ].join('\n'),
            inline: true
        });

        // 몬스터 상태
        const monsterHpBar = this.createHpBar(battle.monster.currentHp, battle.monster.hp);
        
        embed.addFields({
            name: `👹 ${battle.monster.name}`,
            value: [
                `❤️ HP: ${monsterHpBar} ${battle.monster.currentHp}/${battle.monster.hp}`,
                `⚔️ ATK: ${battle.monster.attack}`,
                `🛡️ DEF: ${battle.monster.defense}`
            ].join('\n'),
            inline: true
        });

        // 전투 로그
        const recentLog = battle.battleLog.slice(-5).join('\n');
        embed.addFields({
            name: '📜 전투 로그',
            value: recentLog || '전투가 시작되었습니다.',
            inline: false
        });

        // 현재 턴
        embed.addFields({
            name: '🎯 현재 상황',
            value: `턴 ${battle.turn} - ${battle.playerTurn ? '플레이어 턴' : '몬스터 턴'}`,
            inline: true
        });

        return embed;
    }

    createHpBar(current, max) {
        const percentage = current / max;
        const barLength = 10;
        const filledBars = Math.floor(percentage * barLength);
        const emptyBars = barLength - filledBars;
        
        return '🟩'.repeat(filledBars) + '⬜'.repeat(emptyBars);
    }

    createManaBar(current, max) {
        const percentage = current / max;
        const barLength = 10;
        const filledBars = Math.floor(percentage * barLength);
        const emptyBars = barLength - filledBars;
        
        return '🟦'.repeat(filledBars) + '⬜'.repeat(emptyBars);
    }

    createSkillListEmbed(skills, title = '스킬 목록') {
        const embed = new EmbedBuilder()
            .setColor('#9966ff')
            .setTitle(`✨ ${title}`)
            .setTimestamp();

        if (skills.length === 0) {
            embed.setDescription('스킬이 없습니다.');
            return embed;
        }

        const categoryEmojis = {
            'warrior': '⚔️',
            'mage': '🔮',
            'rogue': '🗡️',
            'priest': '✨',
            'archer': '🏹',
            'special': '💫'
        };

        // 카테고리별로 그룹화
        const groupedSkills = {};
        skills.forEach(skill => {
            if (!groupedSkills[skill.category]) {
                groupedSkills[skill.category] = [];
            }
            groupedSkills[skill.category].push(skill);
        });

        for (const [category, categorySkills] of Object.entries(groupedSkills)) {
            const skillsText = categorySkills.map(skill => {
                return [
                    `**${skill.name}** (${skill.skill_id})`,
                    `💙 마나: ${skill.mana_cost || 0}`,
                    `⏰ 쿨다운: ${skill.cooldown || 0}턴`,
                    `⚡ 데미지: ${((skill.damage_multiplier || 1) * 100)}%`,
                    `📝 ${skill.description}`
                ].join('\n');
            }).join('\n\n');

            embed.addFields({
                name: `${categoryEmojis[category]} ${category.toUpperCase()}`,
                value: skillsText.length > 1024 ? skillsText.substring(0, 1020) + '...' : skillsText,
                inline: false
            });
        }

        return embed;
    }
}

module.exports = CombatSystem;
