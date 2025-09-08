const { EmbedBuilder } = require('discord.js');

class MiningSystem {
    constructor(database) {
        this.db = database;
        this.activeMining = new Map(); // 진행 중인 채굴
        this.miningCooldowns = new Map(); // 채굴 쿨다운
        
        // 광산 데이터
        this.mines = [
            {
                id: 1,
                name: '구리 광산',
                level: 1,
                required_tools: ['basic_pickaxe'],
                success_rate: 80,
                rewards: {
                    copper_ore: 60,
                    iron_ore: 30,
                    silver_ore: 8,
                    gold_ore: 2
                },
                description: '초보자용 구리 광산'
            },
            {
                id: 2,
                name: '철 광산',
                level: 5,
                required_tools: ['iron_pickaxe'],
                success_rate: 70,
                rewards: {
                    iron_ore: 50,
                    silver_ore: 35,
                    gold_ore: 12,
                    platinum_ore: 3
                },
                description: '중급자용 철 광산'
            },
            {
                id: 3,
                name: '금 광산',
                level: 10,
                required_tools: ['gold_pickaxe'],
                success_rate: 60,
                rewards: {
                    gold_ore: 40,
                    platinum_ore: 30,
                    diamond_ore: 20,
                    mythril_ore: 10
                },
                description: '고급자용 금 광산'
            },
            {
                id: 4,
                name: '다이아몬드 광산',
                level: 15,
                required_tools: ['diamond_pickaxe'],
                success_rate: 50,
                rewards: {
                    diamond_ore: 35,
                    mythril_ore: 25,
                    adamantite_ore: 20,
                    orichalcum_ore: 15,
                    legendary_gem: 5
                },
                description: '전문가용 다이아몬드 광산'
            },
            {
                id: 5,
                name: '그림자 광산',
                level: 20,
                required_tools: ['shadow_pickaxe'],
                success_rate: 40,
                rewards: {
                    shadow_ore: 30,
                    void_crystal: 25,
                    dark_matter: 20,
                    chaos_gem: 15,
                    legendary_gem: 10
                },
                description: '마스터용 그림자 광산'
            }
        ];

        // 채굴 도구 데이터
        this.tools = [
            {
                id: 'basic_pickaxe',
                name: '기본 곡괭이',
                level: 1,
                price: 5000,
                durability: 100,
                efficiency: 1.0,
                description: '초보자용 기본 곡괭이'
            },
            {
                id: 'iron_pickaxe',
                name: '철 곡괭이',
                level: 5,
                price: 25000,
                durability: 200,
                efficiency: 1.5,
                description: '중급자용 철 곡괭이'
            },
            {
                id: 'gold_pickaxe',
                name: '금 곡괭이',
                level: 10,
                price: 100000,
                durability: 300,
                efficiency: 2.0,
                description: '고급자용 금 곡괭이'
            },
            {
                id: 'diamond_pickaxe',
                name: '다이아몬드 곡괭이',
                level: 15,
                price: 500000,
                durability: 500,
                efficiency: 3.0,
                description: '전문가용 다이아몬드 곡괭이'
            },
            {
                id: 'shadow_pickaxe',
                name: '그림자 곡괭이',
                level: 20,
                price: 2000000,
                durability: 1000,
                efficiency: 5.0,
                description: '마스터용 그림자 곡괭이'
            }
        ];
    }

    // 광산 목록 조회
    async getMineList() {
        return this.mines;
    }

    // 플레이어 광산 정보 조회
    async getPlayerMiningInfo(playerId) {
        const player = await this.db.get('SELECT * FROM players WHERE id = ?', [playerId]);
        const rpgStats = await this.db.get('SELECT * FROM player_rpg_stats WHERE player_id = ?', [playerId]);
        const tools = await this.db.all('SELECT * FROM player_tools WHERE player_id = ?', [playerId]);
        
        return {
            player,
            rpgStats,
            tools
        };
    }

    // 채굴 시작
    async startMining(playerId, mineId) {
        try {
            const mine = this.mines.find(m => m.id === mineId);
            if (!mine) {
                return { success: false, message: '존재하지 않는 광산입니다.' };
            }

            const playerInfo = await this.getPlayerMiningInfo(playerId);
            if (!playerInfo.player || !playerInfo.rpgStats) {
                return { success: false, message: '플레이어 정보를 찾을 수 없습니다.' };
            }

            // 레벨 체크
            if (playerInfo.rpgStats.rpg_level < mine.level) {
                return { 
                    success: false, 
                    message: `레벨이 부족합니다. 필요 레벨: ${mine.level}` 
                };
            }

            // 도구 체크
            const hasRequiredTool = playerInfo.tools.some(tool => 
                mine.required_tools.includes(tool.tool_id) && tool.durability > 0
            );
            
            if (!hasRequiredTool) {
                return { 
                    success: false, 
                    message: `필요한 도구가 없습니다. 필요 도구: ${mine.required_tools.join(', ')}` 
                };
            }

            // 쿨다운 체크 (5분)
            const cooldownKey = `mining_${playerId}`;
            const lastMining = this.miningCooldowns.get(cooldownKey);
            if (lastMining && Date.now() - lastMining < 300000) {
                const remainingTime = Math.ceil((300000 - (Date.now() - lastMining)) / 1000);
                return { 
                    success: false, 
                    message: `${remainingTime}초 후에 다시 채굴할 수 있습니다.` 
                };
            }

            // 채굴 성공 여부 결정
            const success = Math.random() * 100 < mine.success_rate;
            
            if (success) {
                // 보상 결정
                const reward = this.determineReward(mine.rewards);
                
                // 인벤토리에 아이템 추가
                await this.addItemToInventory(playerId, reward.item, reward.quantity);
                
                // 도구 내구도 감소
                await this.decreaseToolDurability(playerId, mine.required_tools[0]);
                
                // 쿨다운 설정
                this.miningCooldowns.set(cooldownKey, Date.now());
                
                return {
                    success: true,
                    mine: mine,
                    reward: reward,
                    message: `${mine.name}에서 ${reward.item} ${reward.quantity}개를 채굴했습니다!`
                };
            } else {
                // 실패 시에도 도구 내구도 감소
                await this.decreaseToolDurability(playerId, mine.required_tools[0]);
                
                // 쿨다운 설정
                this.miningCooldowns.set(cooldownKey, Date.now());
                
                return {
                    success: true,
                    mine: mine,
                    reward: null,
                    message: `${mine.name}에서 채굴에 실패했습니다.`
                };
            }
        } catch (error) {
            console.error('채굴 오류:', error);
            return { success: false, message: '채굴 중 오류가 발생했습니다.' };
        }
    }

    // 보상 결정
    determineReward(rewards) {
        const total = Object.values(rewards).reduce((sum, value) => sum + value, 0);
        const random = Math.random() * total;
        
        let current = 0;
        for (const [item, chance] of Object.entries(rewards)) {
            current += chance;
            if (random <= current) {
                return {
                    item: item,
                    quantity: Math.floor(Math.random() * 3) + 1 // 1-3개
                };
            }
        }
        
        // 기본값
        return { item: 'copper_ore', quantity: 1 };
    }

    // 인벤토리에 아이템 추가
    async addItemToInventory(playerId, itemId, quantity) {
        const existing = await this.db.get(
            'SELECT * FROM player_inventory WHERE player_id = ? AND item_id = ?',
            [playerId, itemId]
        );
        
        if (existing) {
            await this.db.run(
                'UPDATE player_inventory SET quantity = quantity + ? WHERE player_id = ? AND item_id = ?',
                [quantity, playerId, itemId]
            );
        } else {
            await this.db.run(
                'INSERT INTO player_inventory (player_id, item_id, quantity) VALUES (?, ?, ?)',
                [playerId, itemId, quantity]
            );
        }
    }

    // 도구 내구도 감소
    async decreaseToolDurability(playerId, toolId) {
        await this.db.run(
            'UPDATE player_tools SET durability = durability - 1 WHERE player_id = ? AND tool_id = ?',
            [playerId, toolId]
        );
    }

    // 도구 구매
    async buyTool(playerId, toolId) {
        try {
            const tool = this.tools.find(t => t.id === toolId);
            if (!tool) {
                return { success: false, message: '존재하지 않는 도구입니다.' };
            }

            const player = await this.db.get('SELECT * FROM players WHERE id = ?', [playerId]);
            if (!player) {
                return { success: false, message: '플레이어 정보를 찾을 수 없습니다.' };
            }

            if (player.money < tool.price) {
                return { success: false, message: '돈이 부족합니다.' };
            }

            // 이미 보유한 도구인지 확인
            const existing = await this.db.get(
                'SELECT * FROM player_tools WHERE player_id = ? AND tool_id = ?',
                [playerId, toolId]
            );

            if (existing) {
                return { success: false, message: '이미 보유한 도구입니다.' };
            }

            // 도구 구매
            await this.db.run(
                'INSERT INTO player_tools (player_id, tool_id, durability) VALUES (?, ?, ?)',
                [playerId, toolId, tool.durability]
            );

            // 돈 차감
            await this.db.run(
                'UPDATE players SET money = money - ? WHERE id = ?',
                [tool.price, playerId]
            );

            return {
                success: true,
                tool: tool,
                message: `${tool.name}을(를) 구매했습니다!`
            };
        } catch (error) {
            console.error('도구 구매 오류:', error);
            return { success: false, message: '도구 구매 중 오류가 발생했습니다.' };
        }
    }

    // 채굴 결과 임베드 생성
    createMiningResultEmbed(result) {
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#00ff00' : '#ff0000')
            .setTitle('⛏️ 채굴 결과')
            .setTimestamp();

        if (result.success) {
            if (result.reward) {
                embed.setDescription(result.message)
                    .addFields(
                        {
                            name: '🏔️ 광산',
                            value: result.mine.name,
                            inline: true
                        },
                        {
                            name: '💎 보상',
                            value: `${result.reward.item} x${result.reward.quantity}`,
                            inline: true
                        },
                        {
                            name: '📊 성공률',
                            value: `${result.mine.success_rate}%`,
                            inline: true
                        }
                    );
            } else {
                embed.setDescription(result.message)
                    .addFields({
                        name: '🏔️ 광산',
                        value: result.mine.name,
                        inline: true
                    });
            }
        } else {
            embed.setDescription(result.message);
        }

        return embed;
    }

    // 광산 목록 임베드 생성
    createMineListEmbed(mines, playerLevel = 1) {
        const embed = new EmbedBuilder()
            .setColor('#ff9900')
            .setTitle('🏔️ 광산 목록')
            .setTimestamp();

        const mineText = mines.map(mine => {
            const levelStatus = playerLevel >= mine.level ? '✅' : '❌';
            const requiredTools = mine.required_tools.join(', ');
            
            return [
                `**ID: ${mine.id} | ${mine.name}** ${levelStatus}`,
                `📊 레벨: ${mine.level} | 성공률: ${mine.success_rate}%`,
                `🔧 필요 도구: ${requiredTools}`,
                `📝 ${mine.description}`
            ].join('\n');
        }).join('\n\n');

        embed.setDescription(mineText);
        return embed;
    }
}

module.exports = MiningSystem;
