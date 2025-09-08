const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const PaginationSystem = require('../systems/PaginationSystem');
const Player = require('../systems/Player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('상점')
        .setDescription('상점 관련 명령어')
        .addSubcommand(subcommand =>
            subcommand
                .setName('목록')
                .setDescription('상점 아이템 목록을 확인합니다')
                .addStringOption(option =>
                    option.setName('카테고리')
                        .setDescription('확인할 아이템 카테고리')
                        .setRequired(false)
                        .addChoices(
                            { name: '소비용품', value: 'consumable' },
                            { name: '액세서리', value: 'accessory' },
                            { name: '도서', value: 'book' },
                            { name: '서비스', value: 'service' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('구매')
                .setDescription('아이템을 구매합니다')
                .addIntegerOption(option =>
                    option.setName('아이템id')
                        .setDescription('구매할 아이템 ID')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('수량')
                        .setDescription('구매할 수량')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(99)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('인벤토리')
                .setDescription('내 인벤토리를 확인합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('사용')
                .setDescription('아이템을 사용합니다')
                .addIntegerOption(option =>
                    option.setName('아이템id')
                        .setDescription('사용할 아이템 ID')
                        .setRequired(true))),

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            // 목록 명령어는 누구나 사용 가능
            if (subcommand === '목록') {
                await this.handleShopList(interaction, client);
                return;
            }

            // 다른 명령어들은 회원가입 필요
            const player = await client.db.get('SELECT * FROM players WHERE id = ?', [userId]);
            if (!player) {
                const embed = new (require('discord.js').EmbedBuilder)()
                    .setColor('#ff0000')
                    .setTitle('❌ 회원가입 필요')
                    .setDescription('상점을 이용하려면 먼저 회원가입을 해주세요!')
                    .addFields({
                        name: '💡 도움말',
                        value: '`/프로필 회원가입` 명령어로 회원가입을 진행하세요.',
                        inline: false
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            switch (subcommand) {
                case '구매':
                    await this.handleBuy(interaction, client, userId);
                    break;
                case '인벤토리':
                    await this.handleInventory(interaction, client, userId);
                    break;
                case '사용':
                    await this.handleUse(interaction, client, userId);
                    break;
            }
        } catch (error) {
            console.error('상점 명령어 오류:', error);
            await interaction.reply({ 
                content: '상점 명령어 실행 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleShopList(interaction, client) {
        const category = interaction.options.getString('카테고리');
        
        const items = await client.shopSystem.getShopItems(category);

        if (items.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('🛒 상점')
                .setDescription('해당 카테고리에 판매 중인 아이템이 없습니다.')
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const paginationSystem = client.paginationSystem;
        const categoryEmojis = {
            'consumable': '🧪',
            'accessory': '💎',
            'book': '📚',
            'service': '🎫',
            'special': '✨'
        };

        const embed = client.shopSystem.createShopEmbed(items, category);

        const response = {
            embeds: [paginatedData.embed],
            components: paginatedData.components
        };

        if (paginatedData.components.length > 0) {
            // 페이지네이션 버튼이 있는 경우, 수집기 설정
            const collector = interaction.channel.createMessageComponentCollector({
                filter: (btnInteraction) => btnInteraction.user.id === interaction.user.id,
                time: 300000 // 5분
            });

            collector.on('collect', async (btnInteraction) => {
                await paginationSystem.handlePaginationInteraction(
                    btnInteraction, 
                    items, 
                    paginationSystem.formatShopItem.bind(paginationSystem),
                    {
                        title: '🛒 상점',
                        color: 0x0099ff,
                        itemsPerPage: 8,
                        category: 'category',
                        categoryEmojis: categoryEmojis
                    }
                );
            });

            collector.on('end', () => {
                // 버튼 비활성화
                const disabledComponents = paginatedData.components.map(row => {
                    return ActionRowBuilder.from(row).setComponents(
                        row.components.map(component => 
                            ButtonBuilder.from(component).setDisabled(true)
                        )
                    );
                });
                
                interaction.editReply({ components: disabledComponents }).catch(() => {});
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleBuy(interaction, client, userId) {
        const itemId = interaction.options.getInteger('아이템id');
        const quantity = interaction.options.getInteger('수량') || 1;

        // 플레이어 정보 확인
        const player = await db.get('SELECT * FROM players WHERE id = ?', [userId]);
        if (!player) {
            await interaction.reply({ content: '먼저 게임을 시작해주세요.', ephemeral: true });
            return;
        }

        // 아이템 정보 확인
        const item = await db.get('SELECT * FROM items WHERE id = ?', [itemId]);
        if (!item) {
            await interaction.reply({ content: '존재하지 않는 아이템입니다.', ephemeral: true });
            return;
        }

        if (item.price <= 0) {
            await interaction.reply({ content: '구매할 수 없는 아이템입니다.', ephemeral: true });
            return;
        }

        const totalCost = item.price * quantity;

        // 자금 확인
        if (player.money < totalCost) {
            await interaction.reply({ 
                content: `자금이 부족합니다. 필요: ${totalCost.toLocaleString()}원, 보유: ${player.money.toLocaleString()}원`, 
                ephemeral: true 
            });
            return;
        }

        // 구매 처리
        const playerManager = client.player;
        await playerManager.addItem(userId, itemId, quantity);

        // 자금 차감
        await db.run('UPDATE players SET money = money - ? WHERE id = ?', [totalCost, userId]);

        // 거래 내역 기록
        await db.run(`
            INSERT INTO transactions (player_id, type, amount, description)
            VALUES (?, 'purchase', ?, ?)
        `, [userId, -totalCost, `${item.name} ${quantity}개 구매`]);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ 구매 완료')
            .setDescription(`${item.name} ${quantity}개를 구매했습니다!`)
            .addFields(
                {
                    name: '💰 총 가격',
                    value: `${totalCost.toLocaleString()}원`,
                    inline: true
                },
                {
                    name: '💵 잔액',
                    value: `${(player.money - totalCost).toLocaleString()}원`,
                    inline: true
                }
            );

        await interaction.reply({ embeds: [embed] });
    },

    async handleInventory(interaction, client, userId) {
        const playerManager = client.player;
        const inventory = await playerManager.getInventory(userId);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎒 내 인벤토리')
            .setTimestamp();

        if (inventory.length === 0) {
            embed.setDescription('인벤토리가 비어있습니다.\n상점에서 아이템을 구매해보세요!');
            await interaction.reply({ embeds: [embed] });
            return;
        }

        // 카테고리별로 그룹화
        const categories = {};
        inventory.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });

        const categoryEmojis = {
            'consumable': '🧪',
            'accessory': '💎',
            'book': '📚',
            'service': '🎫'
        };

        for (const [category, items] of Object.entries(categories)) {
            const emoji = categoryEmojis[category] || '📦';
            const itemsText = items.map(item => {
                const rarityEmoji = this.getRarityEmoji(item.rarity);
                const usableText = item.consumable ? ' (사용 가능)' : '';
                return [
                    `${rarityEmoji} **${item.name}** x${item.quantity}${usableText}`,
                    `🆔 ID: ${item.item_id}`,
                    `📝 ${item.description}`
                ].join('\n');
            }).join('\n\n');

            embed.addFields({
                name: `${emoji} ${category.toUpperCase()}`,
                value: itemsText,
                inline: false
            });
        }

        embed.setFooter({ text: '아이템을 사용하려면 "/상점 사용 아이템id:{ID}"를 사용하세요' });

        await interaction.reply({ embeds: [embed] });
    },

    async handleUse(interaction, client, userId) {
        const itemId = interaction.options.getInteger('아이템id');

        const playerManager = client.player;
        const result = await playerManager.useItem(userId, itemId);

        const embed = new EmbedBuilder()
            .setColor(result.success ? '#00ff00' : '#ff0000')
            .setTitle(result.success ? '✅ 아이템 사용' : '❌ 사용 실패')
            .setDescription(result.message);

        if (result.success && result.effects && Object.keys(result.effects).length > 0) {
            const effectsText = Object.entries(result.effects).map(([stat, value]) => {
                const sign = value >= 0 ? '+' : '';
                return `${this.getStatEmoji(stat)} ${stat}: ${sign}${value}`;
            }).join('\n');

            embed.addFields({
                name: '📊 효과',
                value: effectsText,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    getRarityEmoji(rarity) {
        const rarityEmojis = {
            'common': '⚪',
            'rare': '🔵',
            'epic': '🟣',
            'legendary': '🟡'
        };
        return rarityEmojis[rarity] || '⚪';
    },

    getStatEmoji(stat) {
        const statEmojis = {
            'health': '❤️',
            'happiness': '😊',
            'intelligence': '🧠',
            'strength': '💪',
            'agility': '🏃',
            'charm': '✨',
            'luck': '🍀',
            'education': '📚'
        };
        return statEmojis[stat] || '📊';
    }
};

