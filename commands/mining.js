const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const MiningSystem = require('../systems/MiningSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('채굴')
        .setDescription('채굴 관련 명령어')
        .addSubcommand(subcommand =>
            subcommand
                .setName('목록')
                .setDescription('채굴 가능한 광산 목록을 확인합니다 (회원가입 필요)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('시작')
                .setDescription('특정 광산에서 채굴을 시작합니다 (회원가입 필요)')
                .addIntegerOption(option =>
                    option.setName('광산id')
                        .setDescription('채굴할 광산의 ID')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('도구')
                .setDescription('보유한 채굴 도구를 확인합니다 (회원가입 필요)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('도구구매')
                .setDescription('채굴 도구를 구매합니다 (회원가입 필요)')
                .addStringOption(option =>
                    option.setName('도구')
                        .setDescription('구매할 도구')
                        .setRequired(true)
                        .addChoices(
                            { name: '기본 곡괭이 (5,000원)', value: 'basic_pickaxe' },
                            { name: '철 곡괭이 (25,000원)', value: 'iron_pickaxe' },
                            { name: '금 곡괭이 (100,000원)', value: 'gold_pickaxe' },
                            { name: '다이아몬드 곡괭이 (500,000원)', value: 'diamond_pickaxe' },
                            { name: '그림자 곡괭이 (2,000,000원)', value: 'shadow_pickaxe' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('인벤토리')
                .setDescription('채굴한 아이템 인벤토리를 확인합니다 (회원가입 필요)')),

    async execute(interaction, db) {
        const miningSystem = new MiningSystem(db);
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            switch (subcommand) {
                case '목록':
                    await this.handleMineList(interaction, miningSystem, userId);
                    break;
                case '시작':
                    await this.handleStartMining(interaction, miningSystem, userId);
                    break;
                case '도구':
                    await this.handleTools(interaction, miningSystem, userId);
                    break;
                case '도구구매':
                    await this.handleBuyTool(interaction, miningSystem, userId);
                    break;
                case '인벤토리':
                    await this.handleInventory(interaction, miningSystem, userId);
                    break;
            }
        } catch (error) {
            console.error('채굴 명령어 오류:', error);
            await interaction.reply({ 
                content: '채굴 명령어 실행 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleMineList(interaction, miningSystem, userId) {
        try {
            // 플레이어 존재 확인
            const player = await miningSystem.db.get('SELECT * FROM players WHERE id = ?', [userId]);
            if (!player) {
                await interaction.reply({ 
                    content: '먼저 게임을 시작해주세요. `/프로필 회원가입` 명령어를 사용하세요.', 
                    ephemeral: true 
                });
                return;
            }

            const rpgStats = await miningSystem.db.get('SELECT * FROM player_rpg_stats WHERE player_id = ?', [userId]);
            const mines = await miningSystem.getMineList();
            const embed = miningSystem.createMineListEmbed(mines, rpgStats?.rpg_level || 1);
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('광산 목록 오류:', error);
            await interaction.reply({ 
                content: '광산 목록을 불러오는 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleStartMining(interaction, miningSystem, userId) {
        try {
            const mineId = interaction.options.getInteger('광산id');
            
            // 플레이어 존재 확인
            const player = await miningSystem.db.get('SELECT * FROM players WHERE id = ?', [userId]);
            if (!player) {
                await interaction.reply({ 
                    content: '먼저 게임을 시작해주세요. `/프로필 회원가입` 명령어를 사용하세요.', 
                    ephemeral: true 
                });
                return;
            }
            
            await interaction.deferReply();
            
            const result = await miningSystem.startMining(userId, mineId);
            const embed = miningSystem.createMiningResultEmbed(result);
            
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('채굴 시작 오류:', error);
            await interaction.editReply({ 
                content: '채굴을 시작하는 중 오류가 발생했습니다.' 
            });
        }
    },

    async handleTools(interaction, miningSystem, userId) {
        try {
            // 플레이어 존재 확인
            const player = await miningSystem.db.get('SELECT * FROM players WHERE id = ?', [userId]);
            if (!player) {
                await interaction.reply({ 
                    content: '먼저 게임을 시작해주세요. `/프로필 회원가입` 명령어를 사용하세요.', 
                    ephemeral: true 
                });
                return;
            }

            const tools = await miningSystem.db.all('SELECT * FROM player_tools WHERE player_id = ?', [userId]);
            
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🔧 보유 채굴 도구')
                .setTimestamp();

            if (tools.length === 0) {
                embed.setDescription('보유한 채굴 도구가 없습니다.\n도구 상점에서 구매해보세요!');
            } else {
                const toolText = tools.map(tool => {
                    const toolData = miningSystem.tools.find(t => t.id === tool.tool_id);
                    if (!toolData) return `알 수 없는 도구 (${tool.tool_id})`;
                    
                    return `**${toolData.name}**\n📊 내구도: ${tool.durability}/${toolData.durability}\n⚡ 효율: ${toolData.efficiency}x`;
                }).join('\n\n');
                
                embed.setDescription(toolText);
            }
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('도구 확인 오류:', error);
            await interaction.reply({ 
                content: '도구 정보를 불러오는 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleBuyTool(interaction, miningSystem, userId) {
        try {
            const toolId = interaction.options.getString('도구');
            
            // 플레이어 존재 확인
            const player = await miningSystem.db.get('SELECT * FROM players WHERE id = ?', [userId]);
            if (!player) {
                await interaction.reply({ 
                    content: '먼저 게임을 시작해주세요. `/프로필 회원가입` 명령어를 사용하세요.', 
                    ephemeral: true 
                });
                return;
            }
            
            const result = await miningSystem.buyTool(userId, toolId);
            
            const embed = new EmbedBuilder()
                .setColor(result.success ? '#00ff00' : '#ff0000')
                .setTitle('🔧 도구 구매')
                .setDescription(result.message)
                .setTimestamp();

            if (result.success) {
                embed.addFields(
                    {
                        name: '🛠️ 구매한 도구',
                        value: result.tool.name,
                        inline: true
                    },
                    {
                        name: '💰 가격',
                        value: `${result.tool.price.toLocaleString()}원`,
                        inline: true
                    },
                    {
                        name: '📊 내구도',
                        value: `${result.tool.durability}`,
                        inline: true
                    }
                );
            }
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('도구 구매 오류:', error);
            await interaction.reply({ 
                content: '도구 구매 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleInventory(interaction, miningSystem, userId) {
        try {
            // 플레이어 존재 확인
            const player = await miningSystem.db.get('SELECT * FROM players WHERE id = ?', [userId]);
            if (!player) {
                await interaction.reply({ 
                    content: '먼저 게임을 시작해주세요. `/프로필 회원가입` 명령어를 사용하세요.', 
                    ephemeral: true 
                });
                return;
            }

            const inventory = await miningSystem.db.all(
                'SELECT * FROM player_inventory WHERE player_id = ? AND quantity > 0 ORDER BY quantity DESC',
                [userId]
            );
            
            const embed = new EmbedBuilder()
                .setColor('#9932cc')
                .setTitle('🎒 채굴 인벤토리')
                .setTimestamp();

            if (inventory.length === 0) {
                embed.setDescription('채굴한 아이템이 없습니다.\n광산에서 채굴해보세요!');
            } else {
                const itemText = inventory.map(item => {
                    const itemNames = {
                        'copper_ore': '구리 광석',
                        'iron_ore': '철 광석',
                        'silver_ore': '은 광석',
                        'gold_ore': '금 광석',
                        'platinum_ore': '백금 광석',
                        'diamond_ore': '다이아몬드 광석',
                        'mythril_ore': '미스릴 광석',
                        'adamantite_ore': '아다만타이트 광석',
                        'orichalcum_ore': '오리하르콘 광석',
                        'legendary_gem': '전설의 보석',
                        'shadow_ore': '그림자 광석',
                        'void_crystal': '공허의 수정',
                        'dark_matter': '암흑 물질',
                        'chaos_gem': '혼돈의 보석'
                    };
                    
                    const itemName = itemNames[item.item_id] || item.item_id;
                    return `**${itemName}**: ${item.quantity}개`;
                }).join('\n');
                
                embed.setDescription(itemText);
            }
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('인벤토리 확인 오류:', error);
            await interaction.reply({ 
                content: '인벤토리를 불러오는 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    }
};
