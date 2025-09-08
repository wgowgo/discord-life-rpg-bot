const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('장비')
        .setDescription('장비 관련 명령어')
        .addSubcommand(subcommand =>
            subcommand
                .setName('착용')
                .setDescription('장비를 착용합니다')
                .addIntegerOption(option => 
                    option.setName('장비id')
                        .setDescription('착용할 장비 ID')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('슬롯')
                        .setDescription('착용할 슬롯')
                        .setRequired(true)
                        .addChoices(
                            { name: '무기', value: 'weapon' },
                            { name: '투구', value: 'helmet' },
                            { name: '갑옷', value: 'armor' },
                            { name: '장갑', value: 'gloves' },
                            { name: '신발', value: 'boots' },
                            { name: '악세서리1', value: 'accessory1' },
                            { name: '악세서리2', value: 'accessory2' },
                            { name: '반지1', value: 'ring1' },
                            { name: '반지2', value: 'ring2' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('해제')
                .setDescription('장비를 해제합니다')
                .addStringOption(option =>
                    option.setName('슬롯')
                        .setDescription('해제할 슬롯')
                        .setRequired(true)
                        .addChoices(
                            { name: '무기', value: 'weapon' },
                            { name: '투구', value: 'helmet' },
                            { name: '갑옷', value: 'armor' },
                            { name: '장갑', value: 'gloves' },
                            { name: '신발', value: 'boots' },
                            { name: '악세서리1', value: 'accessory1' },
                            { name: '악세서리2', value: 'accessory2' },
                            { name: '반지1', value: 'ring1' },
                            { name: '반지2', value: 'ring2' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('현황')
                .setDescription('현재 착용 중인 장비를 확인합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('상점')
                .setDescription('장비 상점을 확인합니다')
                .addStringOption(option =>
                    option.setName('카테고리')
                        .setDescription('장비 카테고리')
                        .addChoices(
                            { name: '무기', value: 'weapon' },
                            { name: '투구', value: 'helmet' },
                            { name: '갑옷', value: 'armor' },
                            { name: '장갑', value: 'gloves' },
                            { name: '신발', value: 'boots' },
                            { name: '악세서리', value: 'accessory' },
                            { name: '반지', value: 'ring' }
                        ))
                .addStringOption(option =>
                    option.setName('등급')
                        .setDescription('장비 등급')
                        .addChoices(
                            { name: '일반', value: 'common' },
                            { name: '희귀', value: 'rare' },
                            { name: '영웅', value: 'epic' },
                            { name: '전설', value: 'legendary' },
                            { name: '신화', value: 'mythic' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('구매')
                .setDescription('장비를 구매합니다')
                .addIntegerOption(option => 
                    option.setName('장비id')
                        .setDescription('구매할 장비 ID')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const playerId = interaction.user.id;
        const equipmentSystem = interaction.client.equipmentSystem;

        try {
            switch (subcommand) {
                case '착용': {
                    const equipmentId = interaction.options.getInteger('장비id');
                    const slot = interaction.options.getString('슬롯');

                    const result = await equipmentSystem.equipItem(playerId, equipmentId, slot);
                    
                    if (result.success) {
                        const embed = new EmbedBuilder()
                            .setColor('#00ff00')
                            .setTitle('✅ 장비 착용 완료')
                            .setDescription(result.message)
                            .addFields({
                                name: '착용한 장비',
                                value: `**${result.item.name}**\n📝 ${result.item.description}`,
                                inline: false
                            });
                        
                        await interaction.reply({ embeds: [embed] });
                    } else {
                        await interaction.reply({ content: `❌ ${result.message}`, ephemeral: true });
                    }
                    break;
                }

                case '해제': {
                    const slot = interaction.options.getString('슬롯');

                    const result = await equipmentSystem.unequipItem(playerId, slot);
                    
                    if (result.success) {
                        const embed = new EmbedBuilder()
                            .setColor('#ffaa00')
                            .setTitle('🔓 장비 해제 완료')
                            .setDescription(result.message)
                            .addFields({
                                name: '해제한 장비',
                                value: `**${result.item.name}**\n📦 인벤토리로 이동됨`,
                                inline: false
                            });
                        
                        await interaction.reply({ embeds: [embed] });
                    } else {
                        await interaction.reply({ content: `❌ ${result.message}`, ephemeral: true });
                    }
                    break;
                }

                case '현황': {
                    const equipment = await equipmentSystem.getPlayerEquipment(playerId);
                    const stats = await equipmentSystem.calculateEquipmentStats(playerId);
                    
                    const embed = equipmentSystem.createPlayerEquipmentEmbed(playerId, equipment, stats);
                    await interaction.reply({ embeds: [embed] });
                    break;
                }

                case '상점': {
                    const category = interaction.options.getString('카테고리');
                    const rarity = interaction.options.getString('등급');

                    const equipmentList = await equipmentSystem.getEquipmentShop(category, rarity);
                    const embed = equipmentSystem.createEquipmentEmbed(equipmentList, '장비 상점');
                    
                    await interaction.reply({ embeds: [embed] });
                    break;
                }

                case '구매': {
                    const equipmentId = interaction.options.getInteger('장비id');

                    // 장비 정보 확인
                    const equipment = await equipmentSystem.db.get('SELECT * FROM equipment WHERE id = ?', [equipmentId]);
                    if (!equipment) {
                        await interaction.reply({ content: '❌ 존재하지 않는 장비입니다.', ephemeral: true });
                        return;
                    }

                    // 플레이어 돈 확인
                    const player = await equipmentSystem.db.get('SELECT money FROM players WHERE id = ?', [playerId]);
                    if (player.money < equipment.price) {
                        await interaction.reply({ 
                            content: `❌ 돈이 부족합니다. 필요: ${equipment.price.toLocaleString()}원, 보유: ${player.money.toLocaleString()}원`, 
                            ephemeral: true 
                        });
                        return;
                    }

                    // 장비 구매
                    await equipmentSystem.db.run('UPDATE players SET money = money - ? WHERE id = ?', [equipment.price, playerId]);

                    // 인벤토리에 추가
                    const existingItem = await equipmentSystem.db.get(`
                        SELECT * FROM player_inventory WHERE player_id = ? AND item_id = ?
                    `, [playerId, equipmentId]);

                    if (existingItem) {
                        await equipmentSystem.db.run(`
                            UPDATE player_inventory SET quantity = quantity + 1 WHERE id = ?
                        `, [existingItem.id]);
                    } else {
                        await equipmentSystem.db.run(`
                            INSERT INTO player_inventory (player_id, item_id, quantity)
                            VALUES (?, ?, 1)
                        `, [playerId, equipmentId]);
                    }

                    // 거래 기록
                    await equipmentSystem.db.run(`
                        INSERT INTO transactions (player_id, type, amount, description)
                        VALUES (?, 'equipment_purchase', ?, ?)
                    `, [playerId, -equipment.price, `${equipment.name} 구매`]);

                    const embed = new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle('🛒 장비 구매 완료')
                        .setDescription(`**${equipment.name}**을(를) 구매했습니다!`)
                        .addFields(
                            { name: '💰 결제 금액', value: `${equipment.price.toLocaleString()}원`, inline: true },
                            { name: '💳 잔액', value: `${(player.money - equipment.price).toLocaleString()}원`, inline: true },
                            { name: '📦 보관 위치', value: '인벤토리', inline: true }
                        );

                    await interaction.reply({ embeds: [embed] });
                    break;
                }

                default:
                    await interaction.reply({ content: '❌ 알 수 없는 명령어입니다.', ephemeral: true });
            }
        } catch (error) {
            console.error('장비 명령어 오류:', error);
            await interaction.reply({ content: '❌ 명령어 실행 중 오류가 발생했습니다.', ephemeral: true });
        }
    },
};

