const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class PaginationSystem {
    constructor() {
        this.itemsPerPage = 5; // 기본 페이지당 아이템 수
    }

    /**
     * 페이지네이션된 임베드를 생성합니다
     * @param {Array} items - 페이지네이션할 아이템 배열
     * @param {Function} itemFormatter - 각 아이템을 포맷하는 함수
     * @param {Object} options - 옵션 객체
     * @returns {Object} {embed, components, currentPage, totalPages}
     */
    createPaginatedEmbed(items, itemFormatter, options = {}) {
        const {
            title = '목록',
            color = 0x0099FF,
            itemsPerPage = this.itemsPerPage,
            currentPage = 1,
            category = null,
            categoryEmojis = {},
            showPageInfo = true
        } = options;

        const totalPages = Math.ceil(items.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageItems = items.slice(startIndex, endIndex);

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setTimestamp();

        if (category) {
            // 카테고리별로 그룹화
            const categories = this.groupByCategory(pageItems, category);
            
            for (const [cat, catItems] of Object.entries(categories)) {
                const emoji = categoryEmojis[cat] || '📦';
                const itemsText = catItems.map(item => itemFormatter(item)).join('\n\n');
                
                embed.addFields({
                    name: `${emoji} ${cat.toUpperCase()}`,
                    value: itemsText || '아이템이 없습니다.',
                    inline: false
                });
            }
        } else {
            // 일반 목록
            const itemsText = pageItems.map(item => itemFormatter(item)).join('\n\n');
            embed.setDescription(itemsText || '아이템이 없습니다.');
        }

        if (showPageInfo && totalPages > 1) {
            embed.setFooter({ 
                text: `페이지 ${currentPage}/${totalPages} • 총 ${items.length}개 항목` 
            });
        }

        // 버튼 컴포넌트 생성
        const components = this.createPaginationButtons(currentPage, totalPages);

        return {
            embed,
            components,
            currentPage,
            totalPages,
            hasItems: items.length > 0
        };
    }

    /**
     * 카테고리별로 아이템을 그룹화합니다
     */
    groupByCategory(items, categoryKey) {
        const groups = {};
        items.forEach(item => {
            const category = item[categoryKey] || '기타';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
        });
        return groups;
    }

    /**
     * 페이지네이션 버튼을 생성합니다
     */
    createPaginationButtons(currentPage, totalPages) {
        if (totalPages <= 1) return [];

        const row = new ActionRowBuilder();
        
        // 첫 페이지 버튼
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('pagination_first')
                .setLabel('⏮️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 1)
        );

        // 이전 페이지 버튼
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('pagination_prev')
                .setLabel('◀️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 1)
        );

        // 페이지 정보 버튼
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('pagination_info')
                .setLabel(`${currentPage}/${totalPages}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        );

        // 다음 페이지 버튼
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('pagination_next')
                .setLabel('▶️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === totalPages)
        );

        // 마지막 페이지 버튼
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('pagination_last')
                .setLabel('⏭️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === totalPages)
        );

        return [row];
    }

    /**
     * 버튼 상호작용을 처리합니다
     */
    async handlePaginationInteraction(interaction, items, itemFormatter, options = {}) {
        const customId = interaction.customId;
        const currentPage = parseInt(interaction.message.embeds[0].footer?.text?.match(/페이지 (\d+)/)?.[1]) || 1;
        
        let newPage = currentPage;
        
        switch (customId) {
            case 'pagination_first':
                newPage = 1;
                break;
            case 'pagination_prev':
                newPage = Math.max(1, currentPage - 1);
                break;
            case 'pagination_next':
                newPage = Math.min(Math.ceil(items.length / (options.itemsPerPage || this.itemsPerPage)), currentPage + 1);
                break;
            case 'pagination_last':
                newPage = Math.ceil(items.length / (options.itemsPerPage || this.itemsPerPage));
                break;
        }

        if (newPage !== currentPage) {
            const paginatedData = this.createPaginatedEmbed(items, itemFormatter, {
                ...options,
                currentPage: newPage
            });

            await interaction.update({
                embeds: [paginatedData.embed],
                components: paginatedData.components
            });
        } else {
            await interaction.deferUpdate();
        }
    }

    /**
     * 특정 명령어용 페이지네이션 헬퍼 메서드들
     */
    
    // 상점 아이템 포맷터
    formatShopItem(item) {
        const rarityEmoji = this.getRarityEmoji(item.rarity);
        return [
            `${rarityEmoji} **${item.name}** (ID: ${item.id})`,
            `💰 가격: ${item.price.toLocaleString()}원`,
            `📝 ${item.description}`
        ].join('\n');
    }

    // 업적 포맷터
    formatAchievement(achievement) {
        const rarityEmoji = this.getRarityEmoji(achievement.rarity);
        const statusEmoji = achievement.unlocked ? '✅' : '❌';
        return `${statusEmoji} ${rarityEmoji} **${achievement.name}**\n📝 ${achievement.description}`;
    }

    // 직업 포맷터
    formatJob(job) {
        const requirements = [];
        
        // 교육 요구사항
        if (job.required_education > 0) {
            requirements.push(`📚 교육: ${job.required_education}년 이상`);
        }
        
        // 스탯 요구사항 (JSON 파싱)
        if (job.required_stats) {
            try {
                const stats = JSON.parse(job.required_stats);
                for (const [stat, value] of Object.entries(stats)) {
                    const statNames = {
                        'intelligence': '지능',
                        'charm': '매력',
                        'strength': '근력',
                        'agility': '민첩성',
                        'luck': '행운'
                    };
                    requirements.push(`⭐ ${statNames[stat] || stat}: ${value} 이상`);
                }
            } catch (e) {
                // JSON 파싱 실패 시 무시
            }
        }
        
        const reqText = requirements.length > 0 ? requirements.join('\n') : '요구사항 없음';
        
        return [
            `**ID: ${job.id} | ${job.name}**`,
            `💰 급여: ${job.base_salary.toLocaleString()}원`,
            `📋 요구사항:`,
            reqText,
            `📝 ${job.description}`
        ].join('\n');
    }

    // 주식 포맷터
    formatStock(stock) {
        const changeEmoji = stock.change_percent >= 0 ? '📈' : '📉';
        const changeColor = stock.change_percent >= 0 ? '+' : '';
        return [
            `**${stock.name}** (${stock.symbol})`,
            `💰 현재가: ${stock.current_price.toLocaleString()}원`,
            `${changeEmoji} 변동률: ${changeColor}${stock.change_percent.toFixed(2)}%`
        ].join('\n');
    }

    // 펫 포맷터
    formatPet(pet) {
        const categoryEmoji = this.getPetCategoryEmoji(pet.category);
        return [
            `${categoryEmoji} **${pet.name}**`,
            `💰 가격: ${pet.base_price.toLocaleString()}원`,
            `✨ 특수능력: ${pet.special_ability}`,
            `📝 ${pet.description}`
        ].join('\n');
    }

    // 부동산 포맷터
    formatProperty(property) {
        const typeEmoji = this.getPropertyTypeEmoji(property.type);
        return [
            `${typeEmoji} **${property.name}**`,
            `💰 가격: ${property.price.toLocaleString()}원`,
            `📍 위치: ${property.location || '미지정'}`,
            `💵 월 수익: ${property.monthly_income.toLocaleString()}원`
        ].join('\n');
    }

    // 던전 포맷터
    formatDungeon(dungeon) {
        const difficultyEmoji = this.getDifficultyEmoji(dungeon.difficulty);
        return [
            `${difficultyEmoji} **${dungeon.name}**`,
            `📊 난이도: ${dungeon.difficulty}/5`,
            `📚 필요 레벨: ${dungeon.required_level}`,
            `📝 ${dungeon.description}`
        ].join('\n');
    }

    // 사업 타입 포맷터
    formatBusinessType(businessType) {
        return [
            `**${businessType.name}** (ID: ${businessType.id})`,
            `💰 초기 자본: ${businessType.initial_capital.toLocaleString()}원`,
            `📈 예상 수익률: ${businessType.expected_profit_rate}%`,
            `📝 ${businessType.description}`
        ].join('\n');
    }

    // 유틸리티 메서드들
    getRarityEmoji(rarity) {
        const rarityEmojis = {
            'common': '⚪',
            'rare': '🔵',
            'epic': '🟣',
            'legendary': '🟡',
            'mythic': '🔴'
        };
        return rarityEmojis[rarity] || '⚪';
    }

    getPetCategoryEmoji(category) {
        const categoryEmojis = {
            'companion': '🐾',
            'economic': '💰',
            'magical': '✨',
            'combat': '⚔️',
            'legendary': '👑',
            'academic': '📚',
            'healing': '💚',
            'special': '🌟'
        };
        return categoryEmojis[category] || '🐾';
    }

    getPropertyTypeEmoji(type) {
        const typeEmojis = {
            'house': '🏠',
            'apartment': '🏢',
            'commercial': '🏪',
            'land': '🌍'
        };
        return typeEmojis[type] || '🏠';
    }

    getDifficultyEmoji(difficulty) {
        const difficultyEmojis = {
            1: '🟢',
            2: '🟡',
            3: '🟠',
            4: '🔴',
            5: '🟣'
        };
        return difficultyEmojis[difficulty] || '🟢';
    }
}

module.exports = PaginationSystem;
