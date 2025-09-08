const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Database = require('../database/Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('초기화')
        .setDescription('데이터베이스 초기화 (관리자 전용)')
        .addStringOption(option =>
            option.setName('타입')
                .setDescription('초기화할 데이터 타입')
                .setRequired(true)
                .addChoices(
                    { name: '🔄 전체 초기화 (모든 데이터 삭제)', value: 'all' },
                    { name: '👥 플레이어 데이터만 삭제', value: 'players' },
                    { name: '💼 직업 데이터만 삭제', value: 'jobs' },
                    { name: '🏰 던전 데이터만 삭제', value: 'dungeons' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // 관리자 권한 확인
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ 권한 없음')
                .setDescription('이 명령어는 관리자만 사용할 수 있습니다.')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const resetType = interaction.options.getString('타입');
        const db = new Database();

        try {
            // 확인 임베드
            const confirmEmbed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('⚠️ 데이터 초기화 확인')
                .setDescription('**이 작업은 되돌릴 수 없습니다!**')
                .addFields({
                    name: '초기화 타입',
                    value: resetType === 'all' ? '🔄 전체 초기화' : 
                           resetType === 'players' ? '👥 플레이어 데이터' :
                           resetType === 'jobs' ? '💼 직업 데이터' :
                           resetType === 'dungeons' ? '🏰 던전 데이터' : '알 수 없음',
                    inline: true
                })
                .addFields({
                    name: '⚠️ 주의사항',
                    value: '• 모든 플레이어 데이터가 삭제됩니다\n• 개인 채널 정보도 삭제됩니다\n• 이 작업은 되돌릴 수 없습니다',
                    inline: false
                })
                .setFooter({ text: '정말로 진행하시겠습니까?' });

            const confirmButton = new (require('discord.js').ActionRowBuilder)()
                .addComponents(
                    new (require('discord.js').ButtonBuilder)()
                        .setCustomId('confirm_reset')
                        .setLabel('✅ 확인 - 초기화 실행')
                        .setStyle(require('discord.js').ButtonStyle.Danger),
                    new (require('discord.js').ButtonBuilder)()
                        .setCustomId('cancel_reset')
                        .setLabel('❌ 취소')
                        .setStyle(require('discord.js').ButtonStyle.Secondary)
                );

            await interaction.reply({ 
                embeds: [confirmEmbed], 
                components: [confirmButton],
                ephemeral: true 
            });

            // 버튼 클릭 대기
            const filter = i => i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ 
                filter, 
                time: 30000 
            });

            collector.on('collect', async i => {
                if (i.customId === 'confirm_reset') {
                    await i.deferUpdate();
                    
                    // 초기화 실행
                    const result = await executeReset(db, resetType);
                    
                    const resultEmbed = new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle('✅ 초기화 완료')
                        .setDescription(result.message)
                        .addFields({
                            name: '삭제된 데이터',
                            value: result.details,
                            inline: false
                        })
                        .setTimestamp();

                    await interaction.editReply({ 
                        embeds: [resultEmbed], 
                        components: [] 
                    });
                } else if (i.customId === 'cancel_reset') {
                    await i.deferUpdate();
                    
                    const cancelEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ 초기화 취소')
                        .setDescription('데이터 초기화가 취소되었습니다.')
                        .setTimestamp();

                    await interaction.editReply({ 
                        embeds: [cancelEmbed], 
                        components: [] 
                    });
                }
            });

            collector.on('end', async collected => {
                if (collected.size === 0) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('⏰ 시간 초과')
                        .setDescription('30초 내에 응답하지 않아 초기화가 취소되었습니다.')
                        .setTimestamp();

                    await interaction.editReply({ 
                        embeds: [timeoutEmbed], 
                        components: [] 
                    });
                }
            });

        } catch (error) {
            console.error('초기화 오류:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ 초기화 오류')
                .setDescription('데이터 초기화 중 오류가 발생했습니다.')
                .addFields({
                    name: '오류 내용',
                    value: `\`\`\`${error.message}\`\`\``,
                    inline: false
                })
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};

async function executeReset(db, resetType) {
    let deletedTables = [];
    let message = '';

    try {
        switch (resetType) {
            case 'all':
                // 전체 초기화
                const allTables = [
                    'job_cooldowns', 'player_inventory', 'player_tools', 
                    'player_rpg_stats', 'player_stats', 'players',
                    'player_equipment', 'player_properties', 'player_stocks',
                    'player_businesses', 'player_education', 'player_romance',
                    'player_pets', 'player_mining', 'player_fishing',
                    'player_farming', 'player_channels', 'guilds',
                    'guild_members', 'auctions', 'auction_bids',
                    'trades', 'trade_items', 'personal_channels',
                    'private_channels', 'player_achievements'
                ];

                for (const table of allTables) {
                    try {
                        await db.run(`DELETE FROM ${table}`);
                        deletedTables.push(table);
                    } catch (error) {
                        console.log(`테이블 ${table} 삭제 실패 (테이블이 존재하지 않을 수 있음):`, error.message);
                    }
                }
                message = '전체 데이터베이스가 초기화되었습니다.';
                break;

            case 'players':
                // 플레이어 데이터만 삭제
                const playerTables = [
                    'job_cooldowns', 'player_inventory', 'player_tools',
                    'player_rpg_stats', 'player_stats', 'players',
                    'player_equipment', 'player_properties', 'player_stocks',
                    'player_businesses', 'player_education', 'player_romance',
                    'player_pets', 'player_mining', 'player_fishing',
                    'player_farming', 'player_channels', 'player_achievements',
                    'personal_channels', 'private_channels'
                ];

                for (const table of playerTables) {
                    try {
                        await db.run(`DELETE FROM ${table}`);
                        deletedTables.push(table);
                    } catch (error) {
                        console.log(`테이블 ${table} 삭제 실패:`, error.message);
                    }
                }
                message = '모든 플레이어 데이터가 삭제되었습니다.';
                break;

            case 'jobs':
                // 직업 데이터만 삭제
                await db.run('DELETE FROM job_cooldowns');
                await db.run('DELETE FROM jobs');
                deletedTables = ['job_cooldowns', 'jobs'];
                message = '직업 관련 데이터가 삭제되었습니다.';
                break;

            case 'dungeons':
                // 던전 데이터만 삭제
                await db.run('DELETE FROM dungeons');
                deletedTables = ['dungeons'];
                message = '던전 데이터가 삭제되었습니다.';
                break;
        }

        return {
            message: message,
            details: deletedTables.length > 0 ? 
                `• ${deletedTables.length}개 테이블 초기화\n• ${deletedTables.join(', ')}` :
                '삭제된 테이블 없음'
        };

    } catch (error) {
        throw new Error(`초기화 실행 중 오류: ${error.message}`);
    }
}
