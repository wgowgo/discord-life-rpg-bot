const { Client } = require('pg');

// Railway 데이터베이스 연결 정보
const connectionString = process.env.DATABASE_URL || 'postgresql://username:password@host:port/database';

async function clearSpecificPlayer(playerId) {
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Railway 데이터베이스에 연결되었습니다.');

        // 먼저 플레이어 존재 여부 확인
        const playerCheck = await client.query('SELECT username FROM players WHERE id = $1', [playerId]);
        
        if (playerCheck.rows.length === 0) {
            console.log('❌ 해당 플레이어를 찾을 수 없습니다.');
            return;
        }

        const username = playerCheck.rows[0].username;
        console.log(`🗑️ 플레이어 "${username}" (${playerId})의 데이터를 삭제합니다...`);

        // 삭제할 테이블 목록
        const tablesToClear = [
            { table: 'gambling_records', column: 'player_id' },
            { table: 'player_achievements', column: 'player_id' },
            { table: 'player_titles', column: 'player_id' },
            { table: 'player_inventory', column: 'player_id' },
            { table: 'player_pets', column: 'player_id' },
            { table: 'player_properties', column: 'player_id' },
            { table: 'player_stocks', column: 'player_id' },
            { table: 'player_jobs', column: 'player_id' },
            { table: 'player_dungeon_clears', column: 'player_id' },
            { table: 'player_challenges', column: 'player_id' },
            { table: 'player_businesses', column: 'player_id' },
            { table: 'player_education', column: 'player_id' },
            { table: 'chat_activity', column: 'player_id' },
            { table: 'voice_activity', column: 'player_id' },
            { table: 'transactions', column: 'player_id' },
            { table: 'player_stats', column: 'player_id' },
            { table: 'players', column: 'id' }
        ];

        // friendships와 marriages는 두 컬럼 모두 확인
        const specialTables = [
            { table: 'friendships', query: 'DELETE FROM friendships WHERE player1_id = $1 OR player2_id = $1' },
            { table: 'marriages', query: 'DELETE FROM marriages WHERE player1_id = $1 OR player2_id = $1' }
        ];

        let totalDeleted = 0;

        // 일반 테이블 삭제
        for (const { table, column } of tablesToClear) {
            try {
                const result = await client.query(`DELETE FROM ${table} WHERE ${column} = $1`, [playerId]);
                if (result.rowCount > 0) {
                    console.log(`✅ ${table}: ${result.rowCount}개 레코드 삭제됨`);
                    totalDeleted += result.rowCount;
                }
            } catch (error) {
                console.log(`⚠️ ${table}: ${error.message}`);
            }
        }

        // 특수 테이블 삭제
        for (const { table, query } of specialTables) {
            try {
                const result = await client.query(query, [playerId]);
                if (result.rowCount > 0) {
                    console.log(`✅ ${table}: ${result.rowCount}개 레코드 삭제됨`);
                    totalDeleted += result.rowCount;
                }
            } catch (error) {
                console.log(`⚠️ ${table}: ${error.message}`);
            }
        }

        console.log(`\n🎉 플레이어 "${username}"의 데이터 삭제 완료!`);
        console.log(`📊 총 ${totalDeleted}개의 레코드가 삭제되었습니다.`);

    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
    } finally {
        await client.end();
        console.log('데이터베이스 연결이 종료되었습니다.');
    }
}

// 사용법: node scripts/clear-specific-player.js "플레이어ID"
const playerId = process.argv[2];
if (!playerId) {
    console.log('사용법: node scripts/clear-specific-player.js "플레이어ID"');
    process.exit(1);
}

clearSpecificPlayer(playerId);
