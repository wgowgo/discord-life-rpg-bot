const { EmbedBuilder } = require('discord.js');

class GamblingSystem {
    constructor(database) {
        this.db = database;
    }

    // 동전 던지기 (50% 확률)
    async coinFlip(playerId, betAmount, choice) {
        try {
            // 플레이어 자금 확인
            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [playerId]);
            if (!player) {
                return { success: false, message: '플레이어를 찾을 수 없습니다.' };
            }

            if (player.money < betAmount) {
                return { success: false, message: '자금이 부족합니다.' };
            }

            if (betAmount < 100) {
                return { success: false, message: '최소 베팅 금액은 100원입니다.' };
            }

            if (betAmount > 100000) {
                return { success: false, message: '최대 베팅 금액은 100,000원입니다.' };
            }

            // 동전 던지기 (0: 앞면, 1: 뒷면)
            const result = Math.random() < 0.5 ? 0 : 1;
            const playerChoice = choice === '앞면' ? 0 : 1;
            const won = result === playerChoice;

            let newMoney = player.money;
            let winAmount = 0;

            if (won) {
                winAmount = betAmount; // 1:1 배당
                newMoney += winAmount;
            } else {
                newMoney -= betAmount;
            }

            // 데이터베이스 업데이트
            await this.db.run('UPDATE players SET money = ? WHERE id = ?', [newMoney, playerId]);

            // 도박 기록 저장
            await this.recordGambling(playerId, 'coin_flip', betAmount, won ? winAmount : -betAmount);

            const resultText = result === 0 ? '앞면' : '뒷면';
            const choiceText = choice;

            return {
                success: true,
                won: won,
                result: resultText,
                choice: choiceText,
                betAmount: betAmount,
                winAmount: winAmount,
                newMoney: newMoney
            };

        } catch (error) {
            console.error('동전 던지기 오류:', error);
            return { success: false, message: '동전 던지기 중 오류가 발생했습니다.' };
        }
    }

    // 주사위 게임 (1-6)
    async diceRoll(playerId, betAmount, guess) {
        try {
            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [playerId]);
            if (!player) {
                return { success: false, message: '플레이어를 찾을 수 없습니다.' };
            }

            if (player.money < betAmount) {
                return { success: false, message: '자금이 부족합니다.' };
            }

            if (betAmount < 100) {
                return { success: false, message: '최소 베팅 금액은 100원입니다.' };
            }

            if (betAmount > 100000) {
                return { success: false, message: '최대 베팅 금액은 100,000원입니다.' };
            }

            const guessNum = parseInt(guess);
            if (guessNum < 1 || guessNum > 6) {
                return { success: false, message: '주사위 숫자는 1-6 사이여야 합니다.' };
            }

            // 주사위 굴리기
            const result = Math.floor(Math.random() * 6) + 1;
            const won = result === guessNum;

            let newMoney = player.money;
            let winAmount = 0;

            if (won) {
                winAmount = betAmount * 5; // 5:1 배당
                newMoney += winAmount;
            } else {
                newMoney -= betAmount;
            }

            // 데이터베이스 업데이트
            await this.db.run('UPDATE players SET money = ? WHERE id = ?', [newMoney, playerId]);

            // 도박 기록 저장
            await this.recordGambling(playerId, 'dice_roll', betAmount, won ? winAmount : -betAmount);

            return {
                success: true,
                won: won,
                result: result,
                guess: guessNum,
                betAmount: betAmount,
                winAmount: winAmount,
                newMoney: newMoney
            };

        } catch (error) {
            console.error('주사위 게임 오류:', error);
            return { success: false, message: '주사위 게임 중 오류가 발생했습니다.' };
        }
    }

    // 슬롯머신 게임
    async slotMachine(playerId, betAmount) {
        try {
            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [playerId]);
            if (!player) {
                return { success: false, message: '플레이어를 찾을 수 없습니다.' };
            }

            if (player.money < betAmount) {
                return { success: false, message: '자금이 부족합니다.' };
            }

            if (betAmount < 100) {
                return { success: false, message: '최소 베팅 금액은 100원입니다.' };
            }

            if (betAmount > 100000) {
                return { success: false, message: '최대 베팅 금액은 100,000원입니다.' };
            }

            // 슬롯머신 심볼들
            const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];
            
            // 3개 릴 결과 생성
            const reels = [
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)]
            ];

            // 승리 조건 확인
            let winAmount = 0;
            let multiplier = 0;

            if (reels[0] === reels[1] && reels[1] === reels[2]) {
                // 3개 모두 같음
                if (reels[0] === '💎') {
                    multiplier = 100; // 다이아몬드 3개 = 100배
                } else if (reels[0] === '7️⃣') {
                    multiplier = 50; // 7 3개 = 50배
                } else if (reels[0] === '🔔') {
                    multiplier = 20; // 벨 3개 = 20배
                } else {
                    multiplier = 10; // 기타 3개 = 10배
                }
            } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
                // 2개 같음
                multiplier = 2;
            }

            winAmount = betAmount * multiplier;
            const newMoney = player.money - betAmount + winAmount;

            // 데이터베이스 업데이트
            await this.db.run('UPDATE players SET money = ? WHERE id = ?', [newMoney, playerId]);

            // 도박 기록 저장
            await this.recordGambling(playerId, 'slot_machine', betAmount, winAmount - betAmount);

            return {
                success: true,
                reels: reels,
                won: winAmount > betAmount,
                betAmount: betAmount,
                winAmount: winAmount,
                multiplier: multiplier,
                newMoney: newMoney
            };

        } catch (error) {
            console.error('슬롯머신 오류:', error);
            return { success: false, message: '슬롯머신 게임 중 오류가 발생했습니다.' };
        }
    }

    // 카드 게임 (블랙잭 스타일)
    async cardGame(playerId, betAmount) {
        try {
            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [playerId]);
            if (!player) {
                return { success: false, message: '플레이어를 찾을 수 없습니다.' };
            }

            if (player.money < betAmount) {
                return { success: false, message: '자금이 부족합니다.' };
            }

            if (betAmount < 100) {
                return { success: false, message: '최소 베팅 금액은 100원입니다.' };
            }

            if (betAmount > 100000) {
                return { success: false, message: '최대 베팅 금액은 100,000원입니다.' };
            }

            // 카드 덱 생성
            const suits = ['♠️', '♥️', '♦️', '♣️'];
            const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
            const deck = [];
            
            for (const suit of suits) {
                for (const rank of ranks) {
                    deck.push({ suit, rank });
                }
            }

            // 카드 섞기
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }

            // 플레이어와 딜러에게 카드 2장씩 나누기
            const playerCards = [deck.pop(), deck.pop()];
            const dealerCards = [deck.pop(), deck.pop()];

            // 카드 값 계산 함수
            const getCardValue = (card) => {
                if (card.rank === 'A') return 11;
                if (['J', 'Q', 'K'].includes(card.rank)) return 10;
                return parseInt(card.rank);
            };

            // 핸드 값 계산 함수
            const getHandValue = (cards) => {
                let value = 0;
                let aces = 0;
                
                for (const card of cards) {
                    if (card.rank === 'A') {
                        aces++;
                        value += 11;
                    } else {
                        value += getCardValue(card);
                    }
                }
                
                // 에이스 처리 (21 초과시 11을 1로 변경)
                while (value > 21 && aces > 0) {
                    value -= 10;
                    aces--;
                }
                
                return value;
            };

            const playerValue = getHandValue(playerCards);
            const dealerValue = getHandValue(dealerCards);

            // 승부 결정
            let result = '';
            let winAmount = 0;

            if (playerValue > 21) {
                result = '버스트 (패배)';
                winAmount = 0;
            } else if (dealerValue > 21) {
                result = '딜러 버스트 (승리)';
                winAmount = betAmount * 2; // 1:1 배당
            } else if (playerValue === 21 && playerCards.length === 2) {
                result = '블랙잭 (승리)';
                winAmount = betAmount * 2.5; // 1.5:1 배당
            } else if (playerValue > dealerValue) {
                result = '승리';
                winAmount = betAmount * 2; // 1:1 배당
            } else if (playerValue < dealerValue) {
                result = '패배';
                winAmount = 0;
            } else {
                result = '무승부';
                winAmount = betAmount; // 베팅 금액 반환
            }

            const newMoney = player.money - betAmount + winAmount;

            // 데이터베이스 업데이트
            await this.db.run('UPDATE players SET money = ? WHERE id = ?', [newMoney, playerId]);

            // 도박 기록 저장
            await this.recordGambling(playerId, 'card_game', betAmount, winAmount - betAmount);

            return {
                success: true,
                playerCards: playerCards,
                dealerCards: dealerCards,
                playerValue: playerValue,
                dealerValue: dealerValue,
                result: result,
                betAmount: betAmount,
                winAmount: winAmount,
                newMoney: newMoney
            };

        } catch (error) {
            console.error('카드 게임 오류:', error);
            return { success: false, message: '카드 게임 중 오류가 발생했습니다.' };
        }
    }

    // 도박 기록 저장
    async recordGambling(playerId, gameType, betAmount, netResult) {
        try {
            await this.db.run(`
                INSERT INTO gambling_records (player_id, game_type, bet_amount, net_result, created_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [playerId, gameType, betAmount, netResult]);
        } catch (error) {
            console.error('도박 기록 저장 오류:', error);
        }
    }

    // 도박 통계 조회
    async getGamblingStats(playerId) {
        try {
            const stats = await this.db.get(`
                SELECT 
                    COUNT(*) as total_games,
                    SUM(bet_amount) as total_bet,
                    SUM(net_result) as total_win,
                    SUM(CASE WHEN net_result > 0 THEN 1 ELSE 0 END) as wins,
                    SUM(CASE WHEN net_result < 0 THEN 1 ELSE 0 END) as losses
                FROM gambling_records 
                WHERE player_id = ?
            `, [playerId]);

            return stats || {
                total_games: 0,
                total_bet: 0,
                total_win: 0,
                wins: 0,
                losses: 0
            };
        } catch (error) {
            console.error('도박 통계 조회 오류:', error);
            return {
                total_games: 0,
                total_bet: 0,
                total_win: 0,
                wins: 0,
                losses: 0
            };
        }
    }

    // 도박 순위 조회
    async getGamblingRankings(limit = 10) {
        try {
            const rankings = await this.db.all(`
                SELECT 
                    p.username,
                    SUM(gr.net_result) as total_win,
                    COUNT(*) as total_games
                FROM gambling_records gr
                JOIN players p ON gr.player_id = p.id
                GROUP BY gr.player_id, p.username
                ORDER BY total_win DESC
                LIMIT ?
            `, [limit]);

            return rankings || [];
        } catch (error) {
            console.error('도박 순위 조회 오류:', error);
            return [];
        }
    }
}

module.exports = GamblingSystem;
