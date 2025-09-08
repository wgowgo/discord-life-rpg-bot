const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('도움말')
        .setDescription('게임의 모든 기능과 명령어를 확인할 수 있습니다')
        .addStringOption(option =>
            option.setName('카테고리')
                .setDescription('도움말 카테고리를 선택하세요')
                .setRequired(false)
                .addChoices(
                    { name: '🎮 게임 시작', value: 'start' },
                    { name: '👤 기본 명령어', value: 'basic' },
                    { name: '💼 직업 & 사업', value: 'job' },
                    { name: '💰 투자 & 경제', value: 'economy' },
                    { name: '🐾 펫 & 아이템', value: 'pet' },
                    { name: '🏆 업적 & 칭호', value: 'achievement' },
                    { name: '⚔️ 모험 & 던전', value: 'adventure' },
                    { name: '⛏️ 채굴 & 광산', value: 'mining' },
                    { name: '🎯 게임 팁', value: 'tips' }
                )),

    async execute(interaction) {
        const category = interaction.options.getString('카테고리');

        if (!category) {
            // 메인 도움말 메뉴
            await showMainHelp(interaction);
        } else {
            // 특정 카테고리 도움말
            await showCategoryHelp(interaction, category);
        }
    }
};

async function showMainHelp(interaction) {
    const mainEmbed = new EmbedBuilder()
        .setTitle('🎮 Discord Life RPG 도움말')
        .setDescription('게임의 모든 기능을 카테고리별로 확인해보세요!')
        .setColor(0x00BFFF)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .addFields(
            {
                name: '🎯 게임 시작하기',
                value: '새로운 플레이어를 위한 완벽한 가이드',
                inline: true
            },
            {
                name: '👤 기본 명령어',
                value: '프로필, 랭킹 등 기본 기능',
                inline: true
            },
            {
                name: '💼 직업 & 사업',
                value: '직업 구하기, 사업 시작하기',
                inline: true
            },
            {
                name: '💰 투자 & 경제',
                value: '주식, 상점, 경제 활동',
                inline: true
            },
            {
                name: '🐾 펫 & 아이템',
                value: '펫 키우기, 아이템 관리',
                inline: true
            },
            {
                name: '🏆 업적 & 칭호',
                value: '업적 달성, 칭호 수집',
                inline: true
            },
            {
                name: '⚔️ 모험 & 던전',
                value: '던전 탐험, 미니게임',
                inline: true
            },
            {
                name: '🎯 게임 팁',
                value: '효율적인 플레이 방법',
                inline: true
            }
        )
        .setFooter({ text: '아래 버튼을 클릭하거나 /도움말 [카테고리] 명령어를 사용하세요!' })
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_start')
                .setLabel('🎮 게임 시작')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('help_basic')
                .setLabel('👤 기본')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('help_job')
                .setLabel('💼 직업')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('help_economy')
                .setLabel('💰 경제')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('help_pet')
                .setLabel('🐾 펫')
                .setStyle(ButtonStyle.Secondary)
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_achievement')
                .setLabel('🏆 업적')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('help_adventure')
                .setLabel('⚔️ 모험')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('help_tips')
                .setLabel('🎯 팁')
                .setStyle(ButtonStyle.Success)
        );

    await interaction.reply({ embeds: [mainEmbed], components: [row, row2] });
}

async function showCategoryHelp(interaction, category) {
    let embed;

    switch (category) {
        case 'start':
            embed = createStartGuideEmbed();
            break;
        case 'basic':
            embed = createBasicCommandsEmbed();
            break;
        case 'job':
            embed = createJobCommandsEmbed();
            break;
        case 'economy':
            embed = createEconomyCommandsEmbed();
            break;
        case 'pet':
            embed = createPetCommandsEmbed();
            break;
        case 'achievement':
            embed = createAchievementCommandsEmbed();
            break;
        case 'adventure':
            embed = createAdventureCommandsEmbed();
            break;
        case 'mining':
            embed = createMiningCommandsEmbed();
            break;
        case 'tips':
            embed = createTipsEmbed();
            break;
        default:
            embed = createStartGuideEmbed();
    }

    await interaction.reply({ embeds: [embed] });
}

function createStartGuideEmbed() {
    return new EmbedBuilder()
        .setTitle('🎮 게임 시작 가이드')
        .setDescription('새로운 모험을 시작하기 전에 알아두면 좋은 것들입니다!')
        .setColor(0xFF6B6B)
        .addFields(
            {
                name: '1️⃣ 캐릭터 확인',
                value: '`/프로필` - 내 캐릭터 정보와 스탯 확인',
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

function createBasicCommandsEmbed() {
    return new EmbedBuilder()
        .setTitle('👤 기본 명령어')
        .setDescription('게임의 기본적인 기능들입니다.')
        .setColor(0x4ECDC4)
        .addFields(
            {
                name: '프로필 관련',
                value: '`/프로필 [유저]` - 캐릭터 정보 확인\n`/프로필 초기화` - 데이터 초기화 (2단계 확인)',
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

function createJobCommandsEmbed() {
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

function createEconomyCommandsEmbed() {
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

function createPetCommandsEmbed() {
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

function createAchievementCommandsEmbed() {
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

function createAdventureCommandsEmbed() {
    return new EmbedBuilder()
        .setTitle('⚔️ 모험 & 던전 명령어')
        .setDescription('위험한 던전을 탐험하고 모험을 떠나보세요!')
        .setColor(0x8B4513)
        .addFields(
            {
                name: '던전 시스템',
                value: '`/던전 목록` - 던전 목록 확인\n`/던전 입장 [던전ID]` - 던전 입장\n`/던전 랭킹 [던전ID]` - 던전 랭킹 확인\n`/던전 기록` - 내 던전 기록 확인',
                inline: false
            },
            {
                name: '미니게임',
                value: '`/미니게임 주사위 [베팅금액]` - 주사위 게임\n`/미니게임 가위바위보 [선택] [베팅금액]` - 가위바위보\n`/미니게임 슬롯머신 [베팅금액]` - 슬롯머신\n`/미니게임 로또` - 로또 구매',
                inline: false
            }
        )
        .setFooter({ text: '던전에서 희귀한 아이템을 획득해보세요! ⚔️' });
}

function createMiningCommandsEmbed() {
    return new EmbedBuilder()
        .setTitle('⛏️ 채굴 & 광산 명령어')
        .setDescription('다양한 광산에서 귀중한 광물을 채굴해보세요!')
        .setColor(0xFF8C00)
        .addFields(
            {
                name: '채굴 시스템',
                value: '`/채굴 목록` - 채굴 가능한 광산 목록\n`/채굴 시작 [광산ID]` - 특정 광산에서 채굴 시작\n`/채굴 인벤토리` - 채굴한 아이템 확인',
                inline: false
            },
            {
                name: '도구 관리',
                value: '`/채굴 도구` - 보유한 채굴 도구 확인\n`/채굴 도구구매 [도구]` - 채굴 도구 구매',
                inline: false
            },
            {
                name: '광산 정보',
                value: '• 구리 광산 (레벨 1) - 기본 곡괭이 필요\n• 철 광산 (레벨 5) - 철 곡괭이 필요\n• 금 광산 (레벨 10) - 금 곡괭이 필요\n• 다이아몬드 광산 (레벨 15) - 다이아몬드 곡괭이 필요\n• 그림자 광산 (레벨 20) - 그림자 곡괭이 필요',
                inline: false
            }
        )
        .setFooter({ text: '고급 광산일수록 희귀한 광물을 얻을 수 있습니다! ⛏️' });
}

function createTipsEmbed() {
    return new EmbedBuilder()
        .setTitle('💡 게임 팁 & 전략')
        .setDescription('더 효율적으로 게임을 즐기는 방법들입니다!')
        .setColor(0x9B59B6)
        .addFields(
            {
                name: '🎯 초보자 추천 순서',
                value: '1. `/프로필`로 캐릭터 확인\n2. `/직업 지원`으로 직업 구하기\n3. 채팅으로 돈과 경험치 벌기\n4. `/상점 목록`에서 아이템 구매\n5. `/던전 목록`으로 모험 시작',
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
