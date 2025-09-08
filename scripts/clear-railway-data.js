const { Client } = require('pg');

// Railway 데이터베이스 연결 정보 (Railway 대시보드에서 확인)
const connectionString = process.env.DATABASE_URL || 'postgresql://username:password@host:port/database';

async function clearPlayerData() {
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Railway 데이터베이스에 연결되었습니다.');

        // 삭제할 테이블 목록 (외래키 순서 고려)
        const tablesToClear = [
            'gambling_records',
            'player_achievements', 
            'player_titles',
            'player_inventory',
            'player_pets',
            'player_properties',
            'player_stocks',
            'player_jobs',
            'player_dungeon_clears',
            'player_challenges',
            'player_businesses',
            'player_education',
            'chat_activity',
            'voice_activity',
            'transactions',
            'friendships',
            'marriages',
            'player_stats',
            'players',
            'rankings'
        ];

        console.log('플레이어 데이터 삭제를 시작합니다...');

        for (const table of tablesToClear) {
            try {
                const result = await client.query(`DELETE FROM ${table}`);
                console.log(`✅ ${table}: ${result.rowCount}개 레코드 삭제됨`);
            } catch (error) {
                console.log(`⚠️ ${table}: ${error.message}`);
            }
        }

        console.log('\n🎉 모든 플레이어 데이터가 삭제되었습니다!');
        console.log('💡 이제 새로운 플레이어들이 게임을 시작할 수 있습니다.');

    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
    } finally {
        await client.end();
        console.log('데이터베이스 연결이 종료되었습니다.');
    }
}

// 실행
clearPlayerData();
