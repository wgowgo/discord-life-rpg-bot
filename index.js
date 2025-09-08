const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 환경 변수에서 설정 가져오기, 없으면 config.json 사용
const config = {
    token: process.env.BOT_TOKEN || require('./config.json').token,
    clientId: process.env.CLIENT_ID || require('./config.json').clientId,
    guildId: process.env.GUILD_ID || require('./config.json').guildId,
    database: {
        filename: process.env.DATABASE_FILE || require('./config.json').database.filename
    },
    game: require('./config.json').game
};
const Database = require('./database/Database');
const ActivityTracker = require('./systems/ActivityTracker');
const StockMarket = require('./systems/StockMarket');
const DungeonSystem = require('./systems/DungeonSystem');
const RomanceSystem = require('./systems/RomanceSystem');
const BusinessSystem = require('./systems/BusinessSystem');
const EducationSystem = require('./systems/EducationSystem');
const PropertySystem = require('./systems/PropertySystem');
const MinigameSystem = require('./systems/MinigameSystem');
const PersonalChannelSystem = require('./systems/PersonalChannelSystem');
const cron = require('node-cron');

class LifeRPGBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMembers
            ]
        });

        this.commands = new Collection();
        this.db = new Database(config.database.filename);
        this.activityTracker = new ActivityTracker(this.db, config);
        this.stockMarket = new StockMarket(this.db);
        this.dungeonSystem = new DungeonSystem(this.db);
        this.romanceSystem = new RomanceSystem(this.db);
        this.businessSystem = new BusinessSystem(this.db);
        this.educationSystem = new EducationSystem(this.db);
        this.propertySystem = new PropertySystem(this.db);
        this.minigameSystem = new MinigameSystem(this.db);
        this.personalChannelSystem = null; // 클라이언트 준비 후 초기화
        
        this.init();
    }

    async init() {
        try {
            await this.db.init();
            await this.initializeSystems();
            await this.loadCommands();
            await this.setupEventHandlers();
            await this.setupCronJobs();
            
            // Railway에서 자동으로 명령어 등록
            if (process.env.NODE_ENV === 'production') {
                await this.deployCommands();
            }
            
            await this.client.login(config.token);
        } catch (error) {
            console.error('봇 초기화 오류:', error);
        }
    }

    async initializeSystems() {
        try {
            await this.dungeonSystem.initializeDungeons();
            await this.businessSystem.initializeBusinessTypes();
            await this.educationSystem.initializeEducationSystem();
            await this.propertySystem.initializePropertySystem();
            console.log('모든 게임 시스템이 초기화되었습니다.');
        } catch (error) {
            console.error('시스템 초기화 오류:', error);
        }
    }

    async loadCommands() {
        const commandsPath = path.join(__dirname, 'commands');
        if (!fs.existsSync(commandsPath)) {
            fs.mkdirSync(commandsPath, { recursive: true });
        }

        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            try {
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    this.commands.set(command.data.name, command);
                    console.log(`명령어 로드됨: ${command.data.name}`);
                }
            } catch (error) {
                console.error(`명령어 로드 오류 (${file}):`, error);
            }
        }
    }

    async deployCommands() {
        try {
            const { REST } = require('@discordjs/rest');
            const { Routes } = require('discord-api-types/v10');
            
            const rest = new REST({ version: '10' }).setToken(config.token);
            
            const commands = Array.from(this.commands.values()).map(command => command.data.toJSON());
            
            console.log(`${commands.length}개의 슬래시 명령어를 등록하는 중...`);
            
            await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: commands }
            );
            
            console.log('슬래시 명령어 등록이 완료되었습니다!');
        } catch (error) {
            console.error('명령어 등록 중 오류 발생:', error);
        }
    }

    async setupEventHandlers() {
        this.client.once('clientReady', () => {
            console.log(`${this.client.user.tag}로 로그인했습니다!`);
            // 클라이언트 준비 후 개인 채널 시스템 초기화
            this.personalChannelSystem = new PersonalChannelSystem(this.client);
            // 상태 확인 웹서버 시작
            this.setupHealthServer();
        });

        // 새 멤버 가입 감지 (프로필 등록 안내)
        this.client.on('guildMemberAdd', async member => {
            try {
                // 새 멤버에게 DM으로 안내 메시지 전송
                await this.sendWelcomeDM(member);
            } catch (error) {
                console.error('새 멤버 환영 메시지 오류:', error);
            }
        });

        // 슬래시 명령어 및 버튼 상호작용 처리
        this.client.on('interactionCreate', async interaction => {
            // 슬래시 명령어 처리
            if (interaction.isChatInputCommand()) {
                const command = this.commands.get(interaction.commandName);

                if (!command) {
                    console.error(`알 수 없는 명령어: ${interaction.commandName}`);
                    return;
                }

                try {
                    await command.execute(interaction, this.db, this.personalChannelSystem);
                } catch (error) {
                    console.error('명령어 실행 오류:', error);
                    const errorMessage = '명령어 실행 중 오류가 발생했습니다.';
                    
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: errorMessage, ephemeral: true });
                    } else {
                        await interaction.reply({ content: errorMessage, ephemeral: true });
                    }
                }
            }
            // 버튼 상호작용 처리
            else if (interaction.isButton()) {
                try {
                    await this.handleButtonInteraction(interaction);
                } catch (error) {
                    console.error('버튼 상호작용 오류:', error);
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: '상호작용 처리 중 오류가 발생했습니다.', ephemeral: true });
                    } else {
                        await interaction.reply({ content: '상호작용 처리 중 오류가 발생했습니다.', ephemeral: true });
                    }
                }
            }
        });

        // 메시지 활동 추적
        this.client.on('messageCreate', async message => {
            if (message.author.bot) return;
            await this.activityTracker.handleMessage(message);
        });

        // 음성 활동 추적
        this.client.on('voiceStateUpdate', async (oldState, newState) => {
            await this.activityTracker.handleVoiceUpdate(oldState, newState);
        });

        // 오류 처리
        this.client.on('error', error => {
            console.error('Discord 클라이언트 오류:', error);
        });

        process.on('unhandledRejection', error => {
            console.error('처리되지 않은 Promise 거부:', error);
        });
    }

    /**
     * 새 멤버에게 환영 DM 전송
     */
    async sendWelcomeDM(member) {
        try {
                const welcomeEmbed = {
                title: '🎮 Discord Life RPG에 오신 것을 환영합니다!',
                description: `안녕하세요, **${member.displayName}**님!\n${member.guild.name} 서버의 Life RPG 게임에 참여하셨습니다.`,
                color: 0x00ff00,
                fields: [
                    {
                        name: '🎯 튜토리얼 시작하기',
                        value: '**1단계:** `/프로필 등록` - 게임에 참여하기 위해 프로필을 등록하세요!\n**2단계:** 개인 채널이 자동으로 생성됩니다\n**3단계:** 개인 채널에서 상세한 게임 가이드를 확인하세요!',
                        inline: false
                    },
                    {
                        name: '🎮 게임 특징',
                        value: '• 인생 시뮬레이션 + RPG 요소\n• 직업, 투자, 펫 시스템\n• 던전 탐험과 전투\n• 플레이어 간 거래와 길드',
                        inline: false
                    },
                    {
                        name: '📚 튜토리얼 & 도움말',
                        value: '• `/도움말` - 게임의 모든 기능과 명령어 가이드\n• 개인 채널 - 상세한 게임 튜토리얼과 팁\n• 단계별 가이드로 쉽게 시작할 수 있습니다!',
                        inline: false
                    }
                ],
                footer: {
                    text: '즐거운 게임 되세요! 🎮',
                    icon_url: member.guild.iconURL()
                },
                timestamp: new Date().toISOString()
            };

            await member.send({ embeds: [welcomeEmbed] });
            console.log(`새 멤버 환영 DM 전송됨: ${member.user.tag}`);

        } catch (error) {
            // DM 전송 실패는 일반적이므로 에러 로그는 간단히
            console.log(`DM 전송 실패 (설정상 차단됨): ${member.user.tag}`);
        }
    }

    /**
     * 상태 확인 웹서버 설정 (24시간 운영 모니터링용)
     */
    setupHealthServer() {
        try {
            const express = require('express');
            const app = express();
            const port = process.env.PORT || 3000;

            // CORS 설정
            app.use((req, res, next) => {
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
                next();
            });

            // 기본 상태 확인
            app.get('/health', (req, res) => {
                res.json({
                    status: 'healthy',
                    bot: {
                        username: this.client.user?.tag || 'Not Ready',
                        id: this.client.user?.id || 'Unknown',
                        guilds: this.client.guilds.cache.size,
                        users: this.client.users.cache.size
                    },
                    uptime: {
                        process: Math.floor(process.uptime()),
                        bot: this.client.uptime ? Math.floor(this.client.uptime / 1000) : 0
                    },
                    memory: process.memoryUsage(),
                    timestamp: new Date().toISOString()
                });
            });

            // 봇 통계
            app.get('/stats', async (req, res) => {
                try {
                    const playerCount = await this.db.get('SELECT COUNT(*) as count FROM players');
                    const activeChannels = this.personalChannelSystem ? 
                        await this.personalChannelSystem.getChannelStats(this.client.guilds.cache.first()?.id) : 
                        { total: 0, active: 0 };

                    res.json({
                        players: playerCount?.count || 0,
                        personalChannels: activeChannels,
                        commands: this.commands.size,
                        guilds: this.client.guilds.cache.map(guild => ({
                            name: guild.name,
                            members: guild.memberCount,
                            id: guild.id
                        }))
                    });
                } catch (error) {
                    res.status(500).json({ error: 'Database error' });
                }
            });

            // 기본 페이지
            app.get('/', (req, res) => {
                res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Discord Life RPG Bot</title>
                        <meta charset="utf-8">
                        <style>
                            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
                            .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                            h1 { color: #5865F2; }
                            .status { color: #57F287; font-weight: bold; }
                            .info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
                            a { color: #5865F2; text-decoration: none; }
                            a:hover { text-decoration: underline; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>🤖 Discord Life RPG Bot</h1>
                            <div class="info">
                                <p>Status: <span class="status">Running</span></p>
                                <p>Bot: <strong>${this.client.user?.tag || 'Starting...'}</strong></p>
                                <p>Uptime: <strong>${Math.floor(process.uptime())}초</strong></p>
                                <p>Guilds: <strong>${this.client.guilds.cache.size}개</strong></p>
                            </div>
                            <h3>📊 API 엔드포인트</h3>
                            <ul>
                                <li><a href="/health">Health Check</a> - 봇 상태 확인</li>
                                <li><a href="/stats">Bot Statistics</a> - 상세 통계</li>
                            </ul>
                        </div>
                    </body>
                    </html>
                `);
            });

            app.listen(port, () => {
                console.log(`상태 확인 서버가 포트 ${port}에서 실행 중입니다.`);
                console.log(`브라우저에서 http://localhost:${port} 접속 가능`);
            });

        } catch (error) {
            // Express가 설치되지 않은 경우 무시
            console.log('Express가 설치되지 않아 상태 확인 서버를 시작할 수 없습니다. (선택사항)');
        }
    }

    async setupCronJobs() {
        // 매일 자정에 실행 - 일일 초기화
        cron.schedule('0 0 * * *', async () => {
            console.log('일일 초기화 작업 실행...');
            await this.performDailyReset();
        });

        // 매 5분마다 실행 - 주식 가격 업데이트 (실시간 변동)
        cron.schedule('*/5 * * * *', async () => {
            console.log('주식 가격 업데이트...');
            await this.stockMarket.updatePrices();
        });

        // 매 15분마다 실행 - 부동산 가격 업데이트
        cron.schedule('*/15 * * * *', async () => {
            console.log('부동산 가격 업데이트...');
            await this.propertySystem.updatePropertyPrices();
        });

        // 매주 월요일 자정 - 주간 초기화
        cron.schedule('0 0 * * 1', async () => {
            console.log('주간 초기화 작업 실행...');
            await this.performWeeklyReset();
        });

        // 매월 1일 자정 - 월간 초기화
        cron.schedule('0 0 1 * *', async () => {
            console.log('월간 초기화 작업 실행...');
            await this.performMonthlyReset();
        });
    }

    async performDailyReset() {
        try {
            // 일일 도전과제 초기화
            await this.db.run(`
                DELETE FROM player_challenges 
                WHERE challenge_id IN (
                    SELECT id FROM challenges WHERE type = 'daily'
                )
            `);

            // 새로운 일일 도전과제 생성
            const dailyChallenges = await this.generateDailyChallenges();
            for (const challenge of dailyChallenges) {
                await this.createChallengeForAllPlayers(challenge);
            }

            console.log('일일 초기화 완료');
        } catch (error) {
            console.error('일일 초기화 오류:', error);
        }
    }

    async performWeeklyReset() {
        // 주간 랭킹 업데이트
        await this.updateRankings();
        console.log('주간 초기화 완료');
    }

    async performMonthlyReset() {
        // 월간 이벤트 처리
        console.log('월간 초기화 완료');
    }

    async generateDailyChallenges() {
        return [
            {
                name: '일일 채팅',
                description: '오늘 10번 채팅하기',
                type: 'daily',
                condition_type: 'chat_count',
                condition_value: '10',
                reward_type: 'money',
                reward_value: '5000'
            },
            {
                name: '투자 체크',
                description: '주식 포트폴리오 확인하기',
                type: 'daily',
                condition_type: 'check_stocks',
                condition_value: '1',
                reward_type: 'experience',
                reward_value: '50'
            }
        ];
    }

    async createChallengeForAllPlayers(challengeData) {
        // 새로운 도전과제 생성
        const result = await this.db.run(`
            INSERT INTO challenges (name, description, type, condition_type, condition_value, reward_type, reward_value)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            challengeData.name,
            challengeData.description,
            challengeData.type,
            challengeData.condition_type,
            challengeData.condition_value,
            challengeData.reward_type,
            challengeData.reward_value
        ]);

        // 모든 플레이어에게 도전과제 할당
        await this.db.run(`
            INSERT INTO player_challenges (player_id, challenge_id, progress, completed)
            SELECT id, ?, 0, FALSE FROM players
        `, [result.id]);
    }

    async updateRankings() {
        const categories = ['wealth', 'level', 'achievements'];
        
        for (const category of categories) {
            await this.db.run('DELETE FROM rankings WHERE category = ?', [category]);
            
            let sql;
            switch (category) {
                case 'wealth':
                    sql = `
                        INSERT INTO rankings (category, player_id, value, rank_position)
                        SELECT 'wealth', id, money, ROW_NUMBER() OVER (ORDER BY money DESC)
                        FROM players
                        ORDER BY money DESC
                    `;
                    break;
                case 'level':
                    sql = `
                        INSERT INTO rankings (category, player_id, value, rank_position)
                        SELECT 'level', id, level, ROW_NUMBER() OVER (ORDER BY level DESC, experience DESC)
                        FROM players
                        ORDER BY level DESC, experience DESC
                    `;
                    break;
                case 'achievements':
                    sql = `
                        INSERT INTO rankings (category, player_id, value, rank_position)
                        SELECT 'achievements', player_id, COUNT(*), ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC)
                        FROM player_achievements
                        GROUP BY player_id
                        ORDER BY COUNT(*) DESC
                    `;
                    break;
            }
            
            await this.db.run(sql);
        }
    }

    /**
     * 버튼 상호작용 처리
     */
    async handleButtonInteraction(interaction) {
        const customId = interaction.customId;

        // 도움말 버튼 처리
        if (customId.startsWith('help_')) {
            const category = customId.replace('help_', '');
            const { EmbedBuilder } = require('discord.js');
            
            let embed;
            switch (category) {
                case 'start':
                    embed = this.createStartGuideEmbed();
                    break;
                case 'basic':
                    embed = this.createBasicCommandsEmbed();
                    break;
                case 'job':
                    embed = this.createJobCommandsEmbed();
                    break;
                case 'economy':
                    embed = this.createEconomyCommandsEmbed();
                    break;
                case 'pet':
                    embed = this.createPetCommandsEmbed();
                    break;
                case 'achievement':
                    embed = this.createAchievementCommandsEmbed();
                    break;
                case 'adventure':
                    embed = this.createAdventureCommandsEmbed();
                    break;
                case 'tips':
                    embed = this.createTipsEmbed();
                    break;
                default:
                    embed = this.createStartGuideEmbed();
            }

            await interaction.update({ embeds: [embed] });
        }
        // 페이지네이션 버튼 처리
        else if (customId.startsWith('page_')) {
            const PaginationSystem = require('./systems/PaginationSystem');
            const pagination = new PaginationSystem();
            await pagination.handlePaginationInteraction(interaction);
        }
    }

    // 도움말 임베드 생성 메서드들
    createStartGuideEmbed() {
        const { EmbedBuilder } = require('discord.js');
        return new EmbedBuilder()
            .setTitle('🎮 게임 시작 가이드')
            .setDescription('새로운 모험을 시작하기 전에 알아두면 좋은 것들입니다!')
            .setColor(0xFF6B6B)
            .addFields(
                {
                    name: '1️⃣ 캐릭터 등록',
                    value: '`/프로필 등록` - 게임 참여를 위해 프로필 등록',
                    inline: true
                },
                {
                    name: '2️⃣ 직업 구하기',
                    value: '`/직업 목록` - 다양한 직업 중 선택',
                    inline: true
                },
                {
                    name: '3️⃣ 돈 벌기',
                    value: '채팅과 음성 참여로 자동 보상!',
                    inline: true
                },
                {
                    name: '4️⃣ 모험 시작',
                    value: '`/던전 목록` - 던전 탐험으로 경험치 획득',
                    inline: true
                },
                {
                    name: '5️⃣ 투자하기',
                    value: '`/주식 시장` - 주식으로 돈 불리기',
                    inline: true
                },
                {
                    name: '6️⃣ 펫 키우기',
                    value: '`/펫 상점` - 특별한 펫과 함께하기',
                    inline: true
                }
            )
            .setFooter({ text: '단계별로 천천히 진행해보세요! 📚' });
    }

    createBasicCommandsEmbed() {
        const { EmbedBuilder } = require('discord.js');
        return new EmbedBuilder()
            .setTitle('👤 기본 명령어')
            .setDescription('게임의 기본적인 기능들입니다.')
            .setColor(0x4ECDC4)
            .addFields(
                {
                    name: '프로필 관련',
                    value: '`/프로필 등록` - 게임 참여를 위해 프로필 등록\n`/프로필 보기 [유저]` - 캐릭터 정보 확인\n`/프로필 초기화` - 데이터 초기화 (1단계 확인)',
                    inline: false
                },
                {
                    name: '랭킹 시스템',
                    value: '`/랭킹 부자` - 자산 기준 랭킹\n`/랭킹 레벨` - 레벨 기준 랭킹\n`/랭킹 업적` - 업적 기준 랭킹',
                    inline: false
                }
            )
            .setFooter({ text: '기본 명령어로 게임을 시작해보세요! 🚀' });
    }

    createJobCommandsEmbed() {
        const { EmbedBuilder } = require('discord.js');
        return new EmbedBuilder()
            .setTitle('💼 직업 & 사업 명령어')
            .setDescription('직업을 구하고 사업을 시작해보세요!')
            .setColor(0x95E1D3)
            .addFields(
                {
                    name: '직업 시스템',
                    value: '`/직업 목록` - 구할 수 있는 직업 목록\n`/직업 지원 [직업ID]` - 직업에 지원\n`/직업 퇴사` - 현재 직장에서 퇴사\n`/직업 급여` - 이번 달 급여 수령',
                    inline: false
                },
                {
                    name: '사업 시스템',
                    value: '`/사업 종류` - 사업 종류 목록\n`/사업 시작 [사업ID]` - 사업 시작\n`/사업 관리` - 사업 관리',
                    inline: false
                }
            )
            .setFooter({ text: '안정적인 수입을 위해 직업을 구해보세요! 💰' });
    }

    createEconomyCommandsEmbed() {
        const { EmbedBuilder } = require('discord.js');
        return new EmbedBuilder()
            .setTitle('💰 투자 & 경제 명령어')
            .setDescription('돈을 벌고 투자해보세요!')
            .setColor(0xFFD93D)
            .addFields(
                {
                    name: '주식 투자',
                    value: '`/주식 시장` - 주식 시장 현황\n`/주식 매수 [종목] [수량]` - 주식 매수\n`/주식 매도 [종목] [수량]` - 주식 매도\n`/주식 포트폴리오` - 내 주식 포트폴리오',
                    inline: false
                },
                {
                    name: '상점 & 아이템',
                    value: '`/상점 목록 [카테고리]` - 상점 아이템 목록\n`/상점 구매 [아이템ID] [수량]` - 아이템 구매\n`/상점 인벤토리` - 내 인벤토리 확인',
                    inline: false
                }
            )
            .setFooter({ text: '투자로 큰 수익을 올려보세요! 📈' });
    }

    createPetCommandsEmbed() {
        const { EmbedBuilder } = require('discord.js');
        return new EmbedBuilder()
            .setTitle('🐾 펫 & 아이템 명령어')
            .setDescription('특별한 펫과 함께 모험을 떠나보세요!')
            .setColor(0xFF9FF3)
            .addFields(
                {
                    name: '펫 시스템',
                    value: '`/펫 상점` - 펫 상점 확인\n`/펫 구매 [펫ID] [이름]` - 펫 구매\n`/펫 목록` - 내 펫 목록\n`/펫 활성화 [펫ID]` - 펫 활성화\n`/펫 훈련` - 활성 펫 훈련',
                    inline: false
                },
                {
                    name: '아이템 관리',
                    value: '`/상점 사용 [아이템ID]` - 아이템 사용\n`/상점 인벤토리` - 내 인벤토리 확인',
                    inline: false
                }
            )
            .setFooter({ text: '펫과 함께 더 강해져보세요! 🐕' });
    }

    createAchievementCommandsEmbed() {
        const { EmbedBuilder } = require('discord.js');
        return new EmbedBuilder()
            .setTitle('🏆 업적 & 칭호 명령어')
            .setDescription('다양한 업적을 달성하고 칭호를 수집해보세요!')
            .setColor(0xFF6B6B)
            .addFields(
                {
                    name: '업적 시스템',
                    value: '`/업적 목록` - 내 업적 목록\n`/업적 전체` - 모든 업적 목록\n`/업적 도전과제` - 진행 중인 도전과제',
                    inline: false
                },
                {
                    name: '칭호 시스템',
                    value: '`/업적 칭호 장착 [칭호ID]` - 칭호 장착\n`/업적 칭호 해제` - 칭호 해제',
                    inline: false
                }
            )
            .setFooter({ text: '업적을 달성해서 특별한 칭호를 얻어보세요! 🏅' });
    }

    createAdventureCommandsEmbed() {
        const { EmbedBuilder } = require('discord.js');
        return new EmbedBuilder()
            .setTitle('⚔️ 모험 & 던전 명령어')
            .setDescription('위험한 던전을 탐험하고 모험을 떠나보세요!')
            .setColor(0x8B4513)
            .addFields(
                {
                    name: '던전 시스템',
                    value: '`/던전 목록` - 던전 목록 확인\n`/던전 입장 [던전ID]` - 던전 입장\n`/던전 전투` - 던전 내 전투',
                    inline: false
                },
                {
                    name: '미니게임',
                    value: '`/미니게임` - 재미있는 미니게임 플레이',
                    inline: false
                }
            )
            .setFooter({ text: '던전에서 희귀한 아이템을 획득해보세요! ⚔️' });
    }

    createTipsEmbed() {
        const { EmbedBuilder } = require('discord.js');
        return new EmbedBuilder()
            .setTitle('💡 게임 팁 & 전략')
            .setDescription('더 효율적으로 게임을 즐기는 방법들입니다!')
            .setColor(0x9B59B6)
            .addFields(
                {
                    name: '🎯 초보자 추천 순서',
                    value: '1. `/프로필 등록`으로 게임 참여\n2. `/직업 목록`에서 직업 구하기\n3. 채팅으로 돈과 경험치 벌기\n4. `/상점 목록`에서 아이템 구매\n5. `/던전 목록`으로 모험 시작',
                    inline: false
                },
                {
                    name: '💰 돈 벌기 팁',
                    value: '• 채팅할 때마다 자동으로 돈과 경험치 획득\n• 음성 채널 참여 시 시간당 보상\n• 직업 급여로 안정적인 수입\n• 주식 투자로 큰 수익 가능',
                    inline: false
                },
                {
                    name: '⚡ 효율적인 플레이',
                    value: '• 펫을 활성화하면 보너스 효과\n• 업적 달성으로 특별한 칭호 획득\n• 던전에서 희귀 아이템 획득 가능\n• 랭킹 시스템으로 경쟁 재미',
                    inline: false
                }
            )
            .setFooter({ text: '궁금한 것이 있으면 언제든 물어보세요! 🤔' });
    }

    async shutdown() {
        console.log('봇을 종료합니다...');
        this.db.close();
        this.client.destroy();
    }
}

// 봇 인스턴스 생성 및 시작
const bot = new LifeRPGBot();

// 프로세스 종료 시 정리
process.on('SIGINT', async () => {
    await bot.shutdown();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await bot.shutdown();
    process.exit(0);
});

module.exports = LifeRPGBot;
