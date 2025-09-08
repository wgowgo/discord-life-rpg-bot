const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('펫')
        .setDescription('펫 관련 명령어')
        .addSubcommand(subcommand =>
            subcommand
                .setName('상점')
                .setDescription('펫 상점을 확인합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('구매')
                .setDescription('펫을 구매합니다')
                .addIntegerOption(option =>
                    option.setName('펫id')
                        .setDescription('구매할 펫의 ID')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('이름')
                        .setDescription('펫의 이름')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('목록')
                .setDescription('내 펫 목록을 확인합니다'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('활성화')
                .setDescription('펫을 활성화합니다')
                .addIntegerOption(option =>
                    option.setName('펫id')
                        .setDescription('활성화할 펫의 ID')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('훈련')
                .setDescription('펫을 훈련시킵니다')),

    async execute(interaction, db) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            switch (subcommand) {
                case '상점':
                    await this.handleShop(interaction, db);
                    break;
                case '구매':
                    await this.handleBuy(interaction, db, userId);
                    break;
                case '목록':
                    await this.handleList(interaction, db, userId);
                    break;
                case '활성화':
                    await this.handleActivate(interaction, db, userId);
                    break;
                case '훈련':
                    await this.handleTrain(interaction, db, userId);
                    break;
            }
        } catch (error) {
            console.error('펫 명령어 오류:', error);
            await interaction.reply({ 
                content: '펫 명령어 실행 중 오류가 발생했습니다.', 
                ephemeral: true 
            });
        }
    },

    async handleShop(interaction, db) {
        const petTypes = await db.all(`
            SELECT * FROM pet_types ORDER BY base_price ASC
        `);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🐾 펫 상점')
            .setDescription('다양한 펫들을 만나보세요!')
            .setTimestamp();

        const categories = {};
        petTypes.forEach(pet => {
            if (!categories[pet.category]) {
                categories[pet.category] = [];
            }
            categories[pet.category].push(pet);
        });

        for (const [category, pets] of Object.entries(categories)) {
            const categoryEmoji = category === 'companion' ? '🐕' : '✨';
            const petsText = pets.map(pet => 
                `**${pet.name}** (ID: ${pet.id})\n` +
                `💰 가격: ${pet.base_price.toLocaleString()}원\n` +
                `🎯 특수능력: ${pet.special_ability}\n` +
                `📝 ${pet.description}`
            ).join('\n\n');

            embed.addFields({
                name: `${categoryEmoji} ${category}`,
                value: petsText,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleBuy(interaction, db, userId) {
        const petTypeId = interaction.options.getInteger('펫id');
        const petName = interaction.options.getString('이름');

        // 플레이어 정보 확인
        const player = await db.get('SELECT * FROM players WHERE id = ?', [userId]);
        if (!player) {
            await interaction.reply({ content: '먼저 게임을 시작해주세요.', ephemeral: true });
            return;
        }

        // 펫 타입 정보 확인
        const petType = await db.get('SELECT * FROM pet_types WHERE id = ?', [petTypeId]);
        if (!petType) {
            await interaction.reply({ content: '존재하지 않는 펫입니다.', ephemeral: true });
            return;
        }

        // 자금 확인
        if (player.money < petType.base_price) {
            await interaction.reply({ 
                content: `자금이 부족합니다. 필요: ${petType.base_price.toLocaleString()}원, 보유: ${player.money.toLocaleString()}원`, 
                ephemeral: true 
            });
            return;
        }

        // 동일한 이름 확인
        const existingPet = await db.get(`
            SELECT * FROM player_pets WHERE player_id = ? AND name = ?
        `, [userId, petName]);

        if (existingPet) {
            await interaction.reply({ content: '이미 같은 이름의 펫이 있습니다.', ephemeral: true });
            return;
        }

        // 펫 구매
        await db.run(`
            INSERT INTO player_pets (player_id, pet_type_id, name)
            VALUES (?, ?, ?)
        `, [userId, petTypeId, petName]);

        // 자금 차감
        await db.run(`
            UPDATE players SET money = money - ? WHERE id = ?
        `, [petType.base_price, userId]);

        // 거래 내역 기록
        await db.run(`
            INSERT INTO transactions (player_id, type, amount, description)
            VALUES (?, 'pet_purchase', ?, ?)
        `, [userId, -petType.base_price, `${petType.name} 구매 (${petName})`]);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🎉 펫 구매 완료!')
            .setDescription(`${petType.name} "${petName}"을(를) 가족으로 맞이했습니다!`)
            .addFields(
                {
                    name: '💰 구매 가격',
                    value: `${petType.base_price.toLocaleString()}원`,
                    inline: true
                },
                {
                    name: '🎯 특수 능력',
                    value: petType.special_ability,
                    inline: true
                }
            );

        await interaction.reply({ embeds: [embed] });
    },

    async handleList(interaction, db, userId) {
        const pets = await db.all(`
            SELECT 
                pp.*,
                pt.name as type_name,
                pt.special_ability,
                pt.category
            FROM player_pets pp
            JOIN pet_types pt ON pp.pet_type_id = pt.id
            WHERE pp.player_id = ?
            ORDER BY pp.is_active DESC, pp.level DESC
        `, [userId]);

        if (pets.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#ffff00')
                .setTitle('🐾 내 펫')
                .setDescription('아직 펫이 없습니다. `/펫 상점`에서 펫을 구매해보세요!');

            await interaction.reply({ embeds: [embed] });
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🐾 내 펫들')
            .setTimestamp();

        const petsText = pets.map(pet => {
            const activeIcon = pet.is_active ? '⭐' : '';
            const happinessBar = '💚'.repeat(Math.floor(pet.happiness / 20)) + '🤍'.repeat(5 - Math.floor(pet.happiness / 20));
            
            return [
                `${activeIcon} **${pet.name}** (${pet.type_name})`,
                `📊 레벨: ${pet.level} | 경험치: ${pet.experience}`,
                `😊 행복도: ${happinessBar} (${pet.happiness}%)`,
                `🎯 특수능력: ${pet.special_ability}`,
                `🆔 펫 ID: ${pet.id}`
            ].join('\n');
        }).join('\n\n');

        embed.setDescription(petsText);

        await interaction.reply({ embeds: [embed] });
    },

    async handleActivate(interaction, db, userId) {
        const petId = interaction.options.getInteger('펫id');

        // 펫 확인
        const pet = await db.get(`
            SELECT pp.*, pt.name as type_name
            FROM player_pets pp
            JOIN pet_types pt ON pp.pet_type_id = pt.id
            WHERE pp.id = ? AND pp.player_id = ?
        `, [petId, userId]);

        if (!pet) {
            await interaction.reply({ content: '해당 펫을 찾을 수 없습니다.', ephemeral: true });
            return;
        }

        // 기존 활성 펫 비활성화
        await db.run(`
            UPDATE player_pets SET is_active = FALSE WHERE player_id = ?
        `, [userId]);

        // 새 펫 활성화
        await db.run(`
            UPDATE player_pets SET is_active = TRUE WHERE id = ?
        `, [petId]);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('⭐ 펫 활성화')
            .setDescription(`${pet.type_name} "${pet.name}"이(가) 활성화되었습니다!`)
            .addFields({
                name: '🎯 특수 능력',
                value: '이제 이 펫의 특수 능력을 사용할 수 있습니다.',
                inline: false
            });

        await interaction.reply({ embeds: [embed] });
    },

    async handleTrain(interaction, db, userId) {
        // 활성 펫 확인
        const activePet = await db.get(`
            SELECT pp.*, pt.name as type_name, pt.special_ability
            FROM player_pets pp
            JOIN pet_types pt ON pp.pet_type_id = pt.id
            WHERE pp.player_id = ? AND pp.is_active = TRUE
        `, [userId]);

        if (!activePet) {
            await interaction.reply({ content: '활성화된 펫이 없습니다.', ephemeral: true });
            return;
        }

        // 플레이어 자금 확인
        const trainingCost = 10000;
        const player = await db.get('SELECT money FROM players WHERE id = ?', [userId]);
        
        if (player.money < trainingCost) {
            await interaction.reply({ 
                content: `훈련 비용이 부족합니다. 필요: ${trainingCost.toLocaleString()}원`, 
                ephemeral: true 
            });
            return;
        }

        // 훈련 결과 계산
        const expGain = Math.floor(Math.random() * 20) + 10; // 10-29 경험치
        const happinessChange = Math.floor(Math.random() * 10) - 5; // -5 ~ +4 행복도

        // 레벨업 체크
        const requiredExp = activePet.level * 50;
        const newExp = activePet.experience + expGain;
        let levelUp = false;
        let newLevel = activePet.level;

        if (newExp >= requiredExp) {
            levelUp = true;
            newLevel = activePet.level + 1;
        }

        // 펫 업데이트
        const newHappiness = Math.max(0, Math.min(100, activePet.happiness + happinessChange));
        
        if (levelUp) {
            await db.run(`
                UPDATE player_pets 
                SET level = ?, experience = ?, happiness = ?
                WHERE id = ?
            `, [newLevel, newExp - requiredExp, newHappiness, activePet.id]);
        } else {
            await db.run(`
                UPDATE player_pets 
                SET experience = experience + ?, happiness = ?
                WHERE id = ?
            `, [expGain, newHappiness, activePet.id]);
        }

        // 플레이어 자금 차감
        await db.run(`
            UPDATE players SET money = money - ? WHERE id = ?
        `, [trainingCost, userId]);

        // 거래 내역
        await db.run(`
            INSERT INTO transactions (player_id, type, amount, description)
            VALUES (?, 'pet_training', ?, ?)
        `, [userId, -trainingCost, `${activePet.name} 훈련`]);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🎯 펫 훈련 완료')
            .setDescription(`${activePet.type_name} "${activePet.name}"의 훈련이 완료되었습니다!`);

        let resultText = `💫 경험치 +${expGain}\n`;
        
        if (levelUp) {
            resultText += `🎉 레벨업! ${activePet.level} → ${newLevel}\n`;
        }

        const happinessIcon = happinessChange >= 0 ? '😊' : '😔';
        resultText += `${happinessIcon} 행복도: ${activePet.happiness} → ${newHappiness}`;

        embed.addFields({
            name: '📊 훈련 결과',
            value: resultText,
            inline: false
        });

        await interaction.reply({ embeds: [embed] });
    }
};

