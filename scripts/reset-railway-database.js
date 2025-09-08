const { Client } = require('pg');

// Railway 데이터베이스 연결 정보
const connectionString = process.env.DATABASE_URL || 'postgresql://username:password@host:port/database';

async function resetDatabase() {
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Railway 데이터베이스에 연결되었습니다.');

        console.log('⚠️  경고: 모든 데이터가 삭제됩니다!');
        console.log('이 작업은 되돌릴 수 없습니다.');
        
        // 모든 테이블 삭제 (외래키 제약조건 고려)
        const dropTablesSQL = `
            DROP TABLE IF EXISTS gambling_records CASCADE;
            DROP TABLE IF EXISTS player_achievements CASCADE;
            DROP TABLE IF EXISTS player_titles CASCADE;
            DROP TABLE IF EXISTS player_inventory CASCADE;
            DROP TABLE IF EXISTS player_pets CASCADE;
            DROP TABLE IF EXISTS player_properties CASCADE;
            DROP TABLE IF EXISTS player_stocks CASCADE;
            DROP TABLE IF EXISTS player_jobs CASCADE;
            DROP TABLE IF EXISTS player_dungeon_clears CASCADE;
            DROP TABLE IF EXISTS player_challenges CASCADE;
            DROP TABLE IF EXISTS player_businesses CASCADE;
            DROP TABLE IF EXISTS player_education CASCADE;
            DROP TABLE IF EXISTS chat_activity CASCADE;
            DROP TABLE IF EXISTS voice_activity CASCADE;
            DROP TABLE IF EXISTS transactions CASCADE;
            DROP TABLE IF EXISTS friendships CASCADE;
            DROP TABLE IF EXISTS marriages CASCADE;
            DROP TABLE IF EXISTS player_stats CASCADE;
            DROP TABLE IF EXISTS players CASCADE;
            DROP TABLE IF EXISTS rankings CASCADE;
            DROP TABLE IF EXISTS dungeons CASCADE;
            DROP TABLE IF EXISTS challenges CASCADE;
            DROP TABLE IF EXISTS achievements CASCADE;
            DROP TABLE IF EXISTS titles CASCADE;
            DROP TABLE IF EXISTS items CASCADE;
            DROP TABLE IF EXISTS pet_types CASCADE;
            DROP TABLE IF EXISTS properties CASCADE;
            DROP TABLE IF EXISTS stocks CASCADE;
            DROP TABLE IF EXISTS jobs CASCADE;
        `;

        console.log('🗑️ 모든 테이블을 삭제합니다...');
        await client.query(dropTablesSQL);
        console.log('✅ 모든 테이블이 삭제되었습니다.');

        console.log('\n🎉 데이터베이스가 완전히 초기화되었습니다!');
        console.log('💡 이제 봇을 재시작하면 새로운 스키마로 테이블이 생성됩니다.');

    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
    } finally {
        await client.end();
        console.log('데이터베이스 연결이 종료되었습니다.');
    }
}

// 실행
resetDatabase();
