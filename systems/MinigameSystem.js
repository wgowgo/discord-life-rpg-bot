const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class MinigameSystem {
    constructor(database) {
        this.db = database;
        this.activeGames = new Map(); // 진행 중인 게임들
        this.gameCooldowns = new Map(); // 게임 쿨다운
    }

    // 주사위 게임
    async playDice(playerId, betAmount) {
        try {
            // 쿨다운 체크 (10초)
            const cooldownKey = `dice_${playerId}`;
            const lastGame = this.gameCooldowns.get(cooldownKey);
            if (lastGame && Date.now() - lastGame < 10000) {
                return { success: false, message: '10초 후에 다시 시도하세요.' };
            }

            // 플레이어 자금 확인
            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [playerId]);
            if (!player || player.money < betAmount) {
                return { success: false, message: '베팅 금액이 부족합니다.' };
            }

            // 주사위 굴리기
            const playerDice = Math.floor(Math.random() * 6) + 1;
            const botDice = Math.floor(Math.random() * 6) + 1;
            
            let result = '';
            let winAmount = 0;

            if (playerDice > botDice) {
                winAmount = betAmount * 2;
                result = '승리';
                await this.db.run('UPDATE players SET money = money + ? WHERE id = ?', [winAmount, playerId]);
            } else if (playerDice < botDice) {
                winAmount = -betAmount;
                result = '패배';
                await this.db.run('UPDATE players SET money = money - ? WHERE id = ?', [betAmount, playerId]);
            } else {
                result = '무승부';
                // 베팅 금액 그대로 반환
            }

            // 쿨다운 설정
            this.gameCooldowns.set(cooldownKey, Date.now());

            // 거래 내역 기록
            if (winAmount !== 0) {
                await this.db.run(`
                    INSERT INTO transactions (player_id, type, amount, description)
                    VALUES (?, 'minigame', ?, ?)
                `, [playerId, winAmount, `주사위 게임 ${result}`]);
            }

            return {
                success: true,
                result: result,
                playerDice: playerDice,
                botDice: botDice,
                betAmount: betAmount,
                winAmount: winAmount
            };

        } catch (error) {
            console.error('주사위 게임 오류:', error);
            return { success: false, message: '게임 중 오류가 발생했습니다.' };
        }
    }

    // 로또 게임
    async playLotto(playerId) {
        try {
            const lottoPrice = 10000;
            
            // 플레이어 자금 확인
            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [playerId]);
            if (!player || player.money < lottoPrice) {
                return { success: false, message: '로또 구매 자금이 부족합니다.' };
            }

            // 로또 번호 생성
            const playerNumbers = [];
            const winningNumbers = [];
            
            // 플레이어 번호 (1-45 중 6개)
            while (playerNumbers.length < 6) {
                const num = Math.floor(Math.random() * 45) + 1;
                if (!playerNumbers.includes(num)) {
                    playerNumbers.push(num);
                }
            }
            
            // 당첨 번호
            while (winningNumbers.length < 6) {
                const num = Math.floor(Math.random() * 45) + 1;
                if (!winningNumbers.includes(num)) {
                    winningNumbers.push(num);
                }
            }

            // 당첨 개수 확인
            const matches = playerNumbers.filter(num => winningNumbers.includes(num)).length;
            
            let prize = 0;
            let rank = '';

            switch (matches) {
                case 6:
                    prize = 100000000; // 1억원
                    rank = '1등 (6개 일치)';
                    break;
                case 5:
                    prize = 5000000; // 500만원
                    rank = '2등 (5개 일치)';
                    break;
                case 4:
                    prize = 500000; // 50만원
                    rank = '3등 (4개 일치)';
                    break;
                case 3:
                    prize = 50000; // 5만원
                    rank = '4등 (3개 일치)';
                    break;
                default:
                    rank = '꽝';
                    break;
            }

            // 로또 구매비 차감
            await this.db.run('UPDATE players SET money = money - ? WHERE id = ?', [lottoPrice, playerId]);

            // 당첨금 지급
            if (prize > 0) {
                await this.db.run('UPDATE players SET money = money + ? WHERE id = ?', [prize, playerId]);
                
                // 거래 내역 기록
                await this.db.run(`
                    INSERT INTO transactions (player_id, type, amount, description)
                    VALUES (?, 'lottery_win', ?, ?)
                `, [playerId, prize, `로또 ${rank} 당첨`]);
            }

            // 구매 내역 기록
            await this.db.run(`
                INSERT INTO transactions (player_id, type, amount, description)
                VALUES (?, 'lottery_ticket', ?, '로또 구매')
            `, [playerId, -lottoPrice]);

            playerNumbers.sort((a, b) => a - b);
            winningNumbers.sort((a, b) => a - b);

            return {
                success: true,
                playerNumbers: playerNumbers,
                winningNumbers: winningNumbers,
                matches: matches,
                rank: rank,
                prize: prize
            };

        } catch (error) {
            console.error('로또 게임 오류:', error);
            return { success: false, message: '로또 구매 중 오류가 발생했습니다.' };
        }
    }

    // 숫자 맞추기 게임
    async startNumberGuess(playerId, interaction) {
        const gameId = `number_${playerId}_${Date.now()}`;
        const targetNumber = Math.floor(Math.random() * 100) + 1;
        
        const gameData = {
            playerId: playerId,
            targetNumber: targetNumber,
            attempts: 0,
            maxAttempts: 7,
            startTime: Date.now(),
            interaction: interaction
        };

        this.activeGames.set(gameId, gameData);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎯 숫자 맞추기 게임')
            .setDescription('1부터 100 사이의 숫자를 맞춰보세요!')
            .addFields(
                {
                    name: '🎮 게임 방법',
                    value: '버튼을 클릭해서 숫자를 입력하세요.\n7번의 기회가 있습니다!',
                    inline: false
                },
                {
                    name: '🏆 보상',
                    value: '성공 시: 100,000원\n실패 시: 10,000원 위로금',
                    inline: false
                }
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`number_guess_${gameId}`)
                    .setLabel('숫자 입력')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`number_quit_${gameId}`)
                    .setLabel('포기')
                    .setStyle(ButtonStyle.Danger)
            );

        return { embed, row, gameId };
    }

    async processNumberGuess(gameId, guess) {
        const gameData = this.activeGames.get(gameId);
        if (!gameData) {
            return { success: false, message: '게임을 찾을 수 없습니다.' };
        }

        gameData.attempts++;
        const { targetNumber, attempts, maxAttempts, playerId } = gameData;

        let hint = '';
        let gameOver = false;
        let won = false;

        if (guess === targetNumber) {
            won = true;
            gameOver = true;
            
            // 성공 보상
            await this.db.run('UPDATE players SET money = money + ? WHERE id = ?', [100000, playerId]);
            await this.db.run(`
                INSERT INTO transactions (player_id, type, amount, description)
                VALUES (?, 'minigame', ?, '숫자 맞추기 성공')
            `, [playerId, 100000]);

        } else if (attempts >= maxAttempts) {
            gameOver = true;
            
            // 위로 보상
            await this.db.run('UPDATE players SET money = money + ? WHERE id = ?', [10000, playerId]);
            await this.db.run(`
                INSERT INTO transactions (player_id, type, amount, description)
                VALUES (?, 'minigame', ?, '숫자 맞추기 참여')
            `, [playerId, 10000]);

        } else {
            hint = guess < targetNumber ? '더 큰 숫자입니다!' : '더 작은 숫자입니다!';
        }

        if (gameOver) {
            this.activeGames.delete(gameId);
        }

        return {
            success: true,
            won: won,
            gameOver: gameOver,
            hint: hint,
            attempts: attempts,
            maxAttempts: maxAttempts,
            targetNumber: gameOver ? targetNumber : null
        };
    }

    // 가위바위보 게임
    async playRockPaperScissors(playerId, playerChoice, betAmount) {
        try {
            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [playerId]);
            if (!player || player.money < betAmount) {
                return { success: false, message: '베팅 금액이 부족합니다.' };
            }

            const choices = ['가위', '바위', '보'];
            const botChoice = choices[Math.floor(Math.random() * 3)];
            
            let result = '';
            let winAmount = 0;

            // 승부 판정
            if (playerChoice === botChoice) {
                result = '무승부';
            } else if (
                (playerChoice === '가위' && botChoice === '보') ||
                (playerChoice === '바위' && botChoice === '가위') ||
                (playerChoice === '보' && botChoice === '바위')
            ) {
                result = '승리';
                winAmount = betAmount * 2;
                await this.db.run('UPDATE players SET money = money + ? WHERE id = ?', [winAmount, playerId]);
            } else {
                result = '패배';
                winAmount = -betAmount;
                await this.db.run('UPDATE players SET money = money - ? WHERE id = ?', [betAmount, playerId]);
            }

            // 거래 내역 기록
            if (winAmount !== 0) {
                await this.db.run(`
                    INSERT INTO transactions (player_id, type, amount, description)
                    VALUES (?, 'minigame', ?, ?)
                `, [playerId, winAmount, `가위바위보 ${result}`]);
            }

            return {
                success: true,
                result: result,
                playerChoice: playerChoice,
                botChoice: botChoice,
                betAmount: betAmount,
                winAmount: winAmount
            };

        } catch (error) {
            console.error('가위바위보 게임 오류:', error);
            return { success: false, message: '게임 중 오류가 발생했습니다.' };
        }
    }

    // 슬롯머신 게임
    async playSlotMachine(playerId, betAmount) {
        try {
            const player = await this.db.get('SELECT money FROM players WHERE id = ?', [playerId]);
            if (!player || player.money < betAmount) {
                return { success: false, message: '베팅 금액이 부족합니다.' };
            }

            const symbols = ['🍒', '🍊', '🍇', '🔔', '⭐', '💎'];
            const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
            const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
            const reel3 = symbols[Math.floor(Math.random() * symbols.length)];

            let multiplier = 0;
            let result = '';

            // 승리 조건 확인
            if (reel1 === reel2 && reel2 === reel3) {
                // 트리플
                switch (reel1) {
                    case '💎':
                        multiplier = 10;
                        result = '잭팟!';
                        break;
                    case '⭐':
                        multiplier = 5;
                        result = '대박!';
                        break;
                    case '🔔':
                        multiplier = 3;
                        result = '승리!';
                        break;
                    default:
                        multiplier = 2;
                        result = '승리!';
                        break;
                }
            } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
                // 더블
                multiplier = 1.5;
                result = '소승!';
            } else {
                result = '패배';
            }

            const winAmount = multiplier > 0 ? Math.floor(betAmount * multiplier) : -betAmount;

            // 자금 업데이트
            if (multiplier > 0) {
                await this.db.run('UPDATE players SET money = money + ? WHERE id = ?', [winAmount, playerId]);
            } else {
                await this.db.run('UPDATE players SET money = money - ? WHERE id = ?', [betAmount, playerId]);
            }

            // 거래 내역 기록
            await this.db.run(`
                INSERT INTO transactions (player_id, type, amount, description)
                VALUES (?, 'minigame', ?, ?)
            `, [playerId, winAmount, `슬롯머신 ${result}`]);

            return {
                success: true,
                reels: [reel1, reel2, reel3],
                result: result,
                multiplier: multiplier,
                betAmount: betAmount,
                winAmount: winAmount
            };

        } catch (error) {
            console.error('슬롯머신 게임 오류:', error);
            return { success: false, message: '게임 중 오류가 발생했습니다.' };
        }
    }

    // 미니게임 통계
    async getGameStats(playerId) {
        try {
            const stats = await this.db.get(`
                SELECT 
                    COUNT(*) as total_games,
                    SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_winnings,
                    SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_losses,
                    SUM(amount) as net_profit
                FROM transactions
                WHERE player_id = ? AND type = 'minigame'
            `, [playerId]);

            const recentGames = await this.db.all(`
                SELECT amount, description, timestamp
                FROM transactions
                WHERE player_id = ? AND type = 'minigame'
                ORDER BY timestamp DESC
                LIMIT 10
            `, [playerId]);

            return {
                totalGames: stats.total_games || 0,
                totalWinnings: stats.total_winnings || 0,
                totalLosses: stats.total_losses || 0,
                netProfit: stats.net_profit || 0,
                recentGames: recentGames
            };

        } catch (error) {
            console.error('게임 통계 조회 오류:', error);
            return null;
        }
    }

    createGameStatsEmbed(stats, username) {
        const embed = new EmbedBuilder()
            .setColor(0x9932CC)
            .setTitle(`🎮 ${username}의 미니게임 통계`)
            .setTimestamp();

        if (stats.totalGames === 0) {
            embed.setDescription('아직 미니게임을 플레이한 기록이 없습니다.');
            return embed;
        }

        const winRate = stats.totalGames > 0 ? ((stats.totalWinnings / (stats.totalWinnings + stats.totalLosses)) * 100).toFixed(1) : 0;
        const profitColor = stats.netProfit >= 0 ? '+' : '';

        embed.addFields(
            {
                name: '📊 전체 통계',
                value: [
                    `🎯 총 게임 수: ${stats.totalGames}회`,
                    `💰 총 획득금: ${stats.totalWinnings.toLocaleString()}원`,
                    `💸 총 손실금: ${stats.totalLosses.toLocaleString()}원`,
                    `📈 순이익: ${profitColor}${stats.netProfit.toLocaleString()}원`,
                    `🏆 승률: ${winRate}%`
                ].join('\n'),
                inline: false
            }
        );

        if (stats.recentGames.length > 0) {
            const recentText = stats.recentGames.slice(0, 5).map(game => {
                const amount = game.amount >= 0 ? `+${game.amount.toLocaleString()}` : game.amount.toLocaleString();
                const date = new Date(game.timestamp).toLocaleDateString('ko-KR');
                return `${game.description}: ${amount}원 (${date})`;
            }).join('\n');

            embed.addFields({
                name: '📋 최근 게임',
                value: recentText,
                inline: false
            });
        }

        return embed;
    }
}

module.exports = MinigameSystem;

