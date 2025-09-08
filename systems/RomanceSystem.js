const { EmbedBuilder } = require('discord.js');

class RomanceSystem {
    constructor(database) {
        this.db = database;
        this.proposalCooldowns = new Map(); // 고백 쿨다운
    }

    async confess(confesserId, targetId) {
        try {
            // 자기 자신에게 고백 방지
            if (confesserId === targetId) {
                return { success: false, message: '자기 자신에게는 고백할 수 없습니다!' };
            }

            // 쿨다운 체크
            const cooldownKey = `${confesserId}_${targetId}`;
            const lastConfess = this.proposalCooldowns.get(cooldownKey);
            const cooldownTime = 24 * 60 * 60 * 1000; // 24시간
            
            if (lastConfess && Date.now() - lastConfess < cooldownTime) {
                const remainingTime = Math.ceil((cooldownTime - (Date.now() - lastConfess)) / (60 * 60 * 1000));
                return { 
                    success: false, 
                    message: `같은 상대에게는 ${remainingTime}시간 후에 다시 고백할 수 있습니다.` 
                };
            }

            // 플레이어 정보 확인
            const confesser = await this.db.get('SELECT * FROM players WHERE id = ?', [confesserId]);
            const target = await this.db.get('SELECT * FROM players WHERE id = ?', [targetId]);
            
            if (!confesser || !target) {
                return { success: false, message: '존재하지 않는 플레이어입니다.' };
            }

            // 이미 결혼한 상태인지 확인
            const confesserMarriage = await this.db.get(`
                SELECT * FROM marriages 
                WHERE (player1_id = ? OR player2_id = ?) AND is_active = TRUE
            `, [confesserId, confesserId]);

            const targetMarriage = await this.db.get(`
                SELECT * FROM marriages 
                WHERE (player1_id = ? OR player2_id = ?) AND is_active = TRUE
            `, [targetId, targetId]);

            if (confesserMarriage) {
                return { success: false, message: '이미 결혼한 상태입니다!' };
            }

            if (targetMarriage) {
                return { success: false, message: '상대방이 이미 결혼한 상태입니다!' };
            }

            // 스탯 조회
            const confesserStats = await this.db.get('SELECT * FROM player_stats WHERE player_id = ?', [confesserId]);
            const targetStats = await this.db.get('SELECT * FROM player_stats WHERE player_id = ?', [targetId]);

            // 고백 성공률 계산
            const successRate = this.calculateConfessSuccessRate(confesserStats, targetStats);
            const isSuccess = Math.random() * 100 < successRate;

            // 쿨다운 설정
            this.proposalCooldowns.set(cooldownKey, Date.now());

            if (isSuccess) {
                // 친구 관계 생성 또는 업데이트
                await this.createOrUpdateFriendship(confesserId, targetId, 'dating');
                
                // 행복도 증가
                await this.db.run(`
                    UPDATE player_stats 
                    SET happiness = CASE WHEN happiness + 20 > 100 THEN 100 ELSE happiness + 20 END
                    WHERE player_id IN (?, ?)
                `, [confesserId, targetId]);

                return {
                    success: true,
                    message: '고백에 성공했습니다! 💕',
                    successRate: successRate,
                    relationship: 'dating'
                };
            } else {
                // 행복도 감소
                await this.db.run(`
                    UPDATE player_stats 
                    SET happiness = CASE WHEN happiness - 10 < 0 THEN 0 ELSE happiness - 10 END
                    WHERE player_id = ?
                `, [confesserId]);

                return {
                    success: false,
                    message: '고백에 실패했습니다... 😢',
                    successRate: successRate
                };
            }

        } catch (error) {
            console.error('고백 처리 오류:', error);
            return { success: false, message: '고백 처리 중 오류가 발생했습니다.' };
        }
    }

    async propose(proposerId, targetId) {
        try {
            // 연인 관계인지 확인
            const relationship = await this.db.get(`
                SELECT * FROM friendships 
                WHERE ((player1_id = ? AND player2_id = ?) OR (player1_id = ? AND player2_id = ?))
                AND status = 'dating'
            `, [proposerId, targetId, targetId, proposerId]);

            if (!relationship) {
                return { success: false, message: '먼저 연인 관계가 되어야 결혼할 수 있습니다!' };
            }

            // 플레이어 정보 확인
            const proposer = await this.db.get('SELECT * FROM players WHERE id = ?', [proposerId]);
            const target = await this.db.get('SELECT * FROM players WHERE id = ?', [targetId]);

            // 결혼 비용 (1백만원)
            const marriageCost = 1000000;
            if (proposer.money < marriageCost) {
                return { 
                    success: false, 
                    message: `결혼 비용이 부족합니다. 필요: ${marriageCost.toLocaleString()}원` 
                };
            }

            // 프로포즈 성공률 계산 (연인 관계이므로 높은 확률)
            const successRate = 80 + Math.random() * 20; // 80-100%
            const isSuccess = Math.random() * 100 < successRate;

            if (isSuccess) {
                // 결혼 처리
                await this.db.run(`
                    INSERT INTO marriages (player1_id, player2_id)
                    VALUES (?, ?)
                `, [proposerId, targetId]);

                // 친구 관계 업데이트
                await this.db.run(`
                    UPDATE friendships 
                    SET status = 'married'
                    WHERE ((player1_id = ? AND player2_id = ?) OR (player1_id = ? AND player2_id = ?))
                `, [proposerId, targetId, targetId, proposerId]);

                // 결혼 비용 차감
                await this.db.run('UPDATE players SET money = money - ? WHERE id = ?', [marriageCost, proposerId]);

                // 결혼 축하금 (양쪽 모두에게)
                const congratulatoryMoney = 500000;
                await this.db.run(`
                    UPDATE players SET money = money + ? WHERE id IN (?, ?)
                `, [congratulatoryMoney, proposerId, targetId]);

                // 행복도 대폭 증가
                await this.db.run(`
                    UPDATE player_stats 
                    SET happiness = CASE WHEN happiness + 30 > 100 THEN 100 ELSE happiness + 30 END
                    WHERE player_id IN (?, ?)
                `, [proposerId, targetId]);

                // 거래 내역 기록
                await this.db.run(`
                    INSERT INTO transactions (player_id, type, amount, description)
                    VALUES (?, 'marriage_cost', ?, '결혼 비용')
                `, [proposerId, -marriageCost]);

                await this.db.run(`
                    INSERT INTO transactions (player_id, type, amount, description)
                    VALUES (?, 'marriage_gift', ?, '결혼 축하금')
                `, [proposerId, congratulatoryMoney]);

                await this.db.run(`
                    INSERT INTO transactions (player_id, type, amount, description)
                    VALUES (?, 'marriage_gift', ?, '결혼 축하금')
                `, [targetId, congratulatoryMoney]);

                return {
                    success: true,
                    message: '결혼을 축하합니다! 💒',
                    cost: marriageCost,
                    gift: congratulatoryMoney
                };
            } else {
                return {
                    success: false,
                    message: '프로포즈가 거절당했습니다... 💔'
                };
            }

        } catch (error) {
            console.error('프로포즈 처리 오류:', error);
            return { success: false, message: '프로포즈 처리 중 오류가 발생했습니다.' };
        }
    }

    async divorce(playerId) {
        try {
            // 결혼 상태 확인
            const marriage = await this.db.get(`
                SELECT * FROM marriages 
                WHERE (player1_id = ? OR player2_id = ?) AND is_active = TRUE
            `, [playerId, playerId]);

            if (!marriage) {
                return { success: false, message: '결혼한 상태가 아닙니다.' };
            }

            const partnerId = marriage.player1_id === playerId ? marriage.player2_id : marriage.player1_id;
            const partner = await this.db.get('SELECT username FROM players WHERE id = ?', [partnerId]);

            // 이혼 처리
            await this.db.run(`
                UPDATE marriages SET is_active = FALSE WHERE id = ?
            `, [marriage.id]);

            // 친구 관계 삭제 또는 일반 친구로 변경
            await this.db.run(`
                DELETE FROM friendships 
                WHERE ((player1_id = ? AND player2_id = ?) OR (player1_id = ? AND player2_id = ?))
            `, [playerId, partnerId, partnerId, playerId]);

            // 이혼 위자료 (재산의 10%)
            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [playerId]);
            const alimony = Math.floor(player.money * 0.1);

            await this.db.run('UPDATE players SET money = money - ? WHERE id = ?', [alimony, playerId]);
            await this.db.run('UPDATE players SET money = money + ? WHERE id = ?', [alimony, partnerId]);

            // 행복도 감소
            await this.db.run(`
                UPDATE player_stats 
                SET happiness = CASE WHEN happiness - 30 < 0 THEN 0 ELSE happiness - 30 END
                WHERE player_id IN (?, ?)
            `, [playerId, partnerId]);

            return {
                success: true,
                message: `${partner.username}님과 이혼했습니다.`,
                alimony: alimony
            };

        } catch (error) {
            console.error('이혼 처리 오류:', error);
            return { success: false, message: '이혼 처리 중 오류가 발생했습니다.' };
        }
    }

    async getRelationshipStatus(playerId) {
        try {
            // 결혼 상태 확인
            const marriage = await this.db.get(`
                SELECT m.*, p.username as partner_name
                FROM marriages m
                JOIN players p ON (CASE WHEN m.player1_id = ? THEN m.player2_id ELSE m.player1_id END) = p.id
                WHERE (m.player1_id = ? OR m.player2_id = ?) AND m.is_active = TRUE
            `, [playerId, playerId, playerId]);

            if (marriage) {
                const marriageDuration = Math.floor((Date.now() - new Date(marriage.marriage_date).getTime()) / (1000 * 60 * 60 * 24));
                return {
                    status: 'married',
                    partner: marriage.partner_name,
                    duration: marriageDuration,
                    marriageDate: marriage.marriage_date
                };
            }

            // 연인 관계 확인
            const dating = await this.db.get(`
                SELECT f.*, p.username as partner_name
                FROM friendships f
                JOIN players p ON (CASE WHEN f.player1_id = ? THEN f.player2_id ELSE f.player1_id END) = p.id
                WHERE ((f.player1_id = ? AND f.player2_id = ?) OR (f.player1_id = ? AND f.player2_id = ?))
                AND f.status = 'dating'
            `, [playerId, playerId, playerId, playerId, playerId]);

            if (dating) {
                const relationshipDuration = Math.floor((Date.now() - new Date(dating.created_date).getTime()) / (1000 * 60 * 60 * 24));
                return {
                    status: 'dating',
                    partner: dating.partner_name,
                    duration: relationshipDuration,
                    startDate: dating.created_date
                };
            }

            return { status: 'single' };

        } catch (error) {
            console.error('관계 상태 조회 오류:', error);
            return { status: 'unknown' };
        }
    }

    async createOrUpdateFriendship(player1Id, player2Id, status) {
        const existing = await this.db.get(`
            SELECT * FROM friendships 
            WHERE ((player1_id = ? AND player2_id = ?) OR (player1_id = ? AND player2_id = ?))
        `, [player1Id, player2Id, player2Id, player1Id]);

        if (existing) {
            await this.db.run(`
                UPDATE friendships SET status = ? WHERE id = ?
            `, [status, existing.id]);
        } else {
            await this.db.run(`
                INSERT INTO friendships (player1_id, player2_id, status)
                VALUES (?, ?, ?)
            `, [player1Id, player2Id, status]);
        }
    }

    calculateConfessSuccessRate(confesserStats, targetStats) {
        // 고백자의 매력도와 상대방의 기준에 따른 성공률 계산
        let baseRate = 30; // 기본 30%
        
        // 매력도에 따른 보너스
        baseRate += confesserStats.charm * 0.3;
        
        // 행복도에 따른 보너스 (행복한 사람이 고백을 받아들일 확률 높음)
        baseRate += targetStats.happiness * 0.2;
        
        // 레벨 차이에 따른 조정
        const levelDiff = Math.abs(confesserStats.level || 1 - targetStats.level || 1);
        baseRate -= levelDiff * 2;
        
        // 최소 10%, 최대 85%로 제한
        return Math.max(10, Math.min(85, baseRate));
    }

    async getMarriageRankings() {
        return await this.db.all(`
            SELECT 
                p1.username as player1_name,
                p2.username as player2_name,
                m.marriage_date,
                CAST((julianday('now') - julianday(m.marriage_date)) as INTEGER) as days_married
            FROM marriages m
            JOIN players p1 ON m.player1_id = p1.id
            JOIN players p2 ON m.player2_id = p2.id
            WHERE m.is_active = TRUE
            ORDER BY m.marriage_date ASC
            LIMIT 10
        `);
    }

    async sendGift(senderId, targetId, giftType, amount) {
        try {
            // 선물 타입별 비용과 효과
            const gifts = {
                'flower': { cost: 10000, happiness: 5, name: '꽃다발' },
                'chocolate': { cost: 20000, happiness: 10, name: '초콜릿' },
                'jewelry': { cost: 100000, happiness: 25, name: '보석' },
                'car': { cost: 5000000, happiness: 50, name: '자동차' }
            };

            const gift = gifts[giftType];
            if (!gift) {
                return { success: false, message: '존재하지 않는 선물입니다.' };
            }

            const totalCost = gift.cost * amount;

            // 자금 확인
            const sender = await this.db.get('SELECT * FROM players WHERE id = ?', [senderId]);
            if (sender.money < totalCost) {
                return { 
                    success: false, 
                    message: `자금이 부족합니다. 필요: ${totalCost.toLocaleString()}원` 
                };
            }

            // 선물 전송
            await this.db.run('UPDATE players SET money = money - ? WHERE id = ?', [totalCost, senderId]);
            
            // 받는 사람 행복도 증가
            await this.db.run(`
                UPDATE player_stats 
                SET happiness = CASE WHEN happiness + ? > 100 THEN 100 ELSE happiness + ? END
                WHERE player_id = ?
            `, [gift.happiness * amount, gift.happiness * amount, targetId]);

            return {
                success: true,
                message: `${gift.name} ${amount}개를 선물했습니다!`,
                cost: totalCost,
                happinessGain: gift.happiness * amount
            };

        } catch (error) {
            console.error('선물 전송 오류:', error);
            return { success: false, message: '선물 전송 중 오류가 발생했습니다.' };
        }
    }
}

module.exports = RomanceSystem;
