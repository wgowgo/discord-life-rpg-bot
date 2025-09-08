
-- 플레이어 기본 정보
CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    age INTEGER DEFAULT 18,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    money REAL DEFAULT 10000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 플레이어 스탯 (직업/일상용)
CREATE TABLE IF NOT EXISTS player_stats (
    player_id TEXT PRIMARY KEY,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    health INTEGER DEFAULT 100,
    happiness INTEGER DEFAULT 50,
    education INTEGER DEFAULT 0,
    charm INTEGER DEFAULT 50,
    luck INTEGER DEFAULT 50,
    intelligence INTEGER DEFAULT 50,
    strength INTEGER DEFAULT 50,
    agility INTEGER DEFAULT 50,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- 플레이어 RPG 스탯 (던전/전투용)
CREATE TABLE IF NOT EXISTS player_rpg_stats (
    player_id TEXT PRIMARY KEY,
    rpg_level INTEGER DEFAULT 1,
    rpg_experience INTEGER DEFAULT 0,
    hp INTEGER DEFAULT 100,
    max_hp INTEGER DEFAULT 100,
    mp INTEGER DEFAULT 50,
    max_mp INTEGER DEFAULT 50,
    attack INTEGER DEFAULT 10,
    defense INTEGER DEFAULT 5,
    magic_attack INTEGER DEFAULT 8,
    magic_defense INTEGER DEFAULT 3,
    speed INTEGER DEFAULT 10,
    critical_rate REAL DEFAULT 0.05,
    critical_damage REAL DEFAULT 1.5,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- 직업 정보
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    level_required INTEGER DEFAULT 1,
    education_required TEXT,
    salary_min INTEGER NOT NULL,
    salary_max INTEGER NOT NULL,
    required_stats TEXT,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE
);

-- 플레이어 직업
CREATE TABLE IF NOT EXISTS player_jobs (
    id SERIAL PRIMARY KEY,
    player_id TEXT NOT NULL,
    job_id INTEGER NOT NULL,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- 직업 쿨다운
CREATE TABLE IF NOT EXISTS job_cooldowns (
    player_id TEXT PRIMARY KEY,
    last_quit_date TIMESTAMP,
    cooldown_until TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- 주식 정보
CREATE TABLE IF NOT EXISTS stocks (
    symbol TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    current_price REAL NOT NULL,
    previous_price REAL NOT NULL,
    change_percent REAL DEFAULT 0,
    volume INTEGER DEFAULT 0,
    market_cap REAL DEFAULT 0,
    sector TEXT,
    description TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 플레이어 주식 포트폴리오
CREATE TABLE IF NOT EXISTS player_stocks (
    id SERIAL PRIMARY KEY,
    player_id TEXT NOT NULL,
    stock_symbol TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    average_price REAL NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (stock_symbol) REFERENCES stocks(symbol)
);

-- 거래 내역
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    player_id TEXT,
    type TEXT NOT NULL, -- 'buy', 'sell', 'salary', 'reward', etc.
    amount REAL NOT NULL,
    description TEXT,
    stock_symbol TEXT,
    quantity INTEGER,
    price REAL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- 부동산
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'residential', 'commercial', 'luxury'
    price REAL NOT NULL,
    location TEXT NOT NULL,
    monthly_income REAL NOT NULL,
    size_sqm INTEGER DEFAULT 0,
    current_price REAL DEFAULT 0,
    price_change_percent REAL DEFAULT 0,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE
);

-- 플레이어 부동산
CREATE TABLE IF NOT EXISTS player_properties (
    id SERIAL PRIMARY KEY,
    player_id TEXT NOT NULL,
    property_id INTEGER NOT NULL,
    purchase_price REAL NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- 사업 종류
CREATE TABLE IF NOT EXISTS business_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    initial_cost REAL NOT NULL,
    monthly_revenue REAL NOT NULL,
    monthly_cost REAL NOT NULL,
    required_staff INTEGER NOT NULL,
    description TEXT
);

-- 플레이어 사업
CREATE TABLE IF NOT EXISTS player_businesses (
    id SERIAL PRIMARY KEY,
    player_id TEXT NOT NULL,
    business_type_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    staff_count INTEGER DEFAULT 0,
    reputation INTEGER DEFAULT 50,
    monthly_profit REAL DEFAULT 0,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (business_type_id) REFERENCES business_types(id)
);

-- 교육 과정
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    duration_weeks INTEGER NOT NULL,
    cost REAL NOT NULL,
    required_level INTEGER DEFAULT 1,
    description TEXT,
    benefits TEXT
);

-- 플레이어 교육
CREATE TABLE IF NOT EXISTS player_education (
    id SERIAL PRIMARY KEY,
    player_id TEXT NOT NULL,
    course_id INTEGER NOT NULL,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP,
    progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- 던전 정보
CREATE TABLE IF NOT EXISTS dungeons (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    level_required INTEGER NOT NULL,
    difficulty TEXT NOT NULL, -- 'easy', 'normal', 'hard', 'extreme'
    required_stats TEXT,
    rewards TEXT,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE
);

-- 플레이어 던전 기록
CREATE TABLE IF NOT EXISTS player_dungeons (
    id SERIAL PRIMARY KEY,
    player_id TEXT NOT NULL,
    dungeon_id INTEGER NOT NULL,
    completion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE,
    rewards_received TEXT,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (dungeon_id) REFERENCES dungeons(id)
);

-- 로맨스 관계
CREATE TABLE IF NOT EXISTS relationships (
    id SERIAL PRIMARY KEY,
    player1_id TEXT NOT NULL,
    player2_id TEXT NOT NULL,
    relationship_type TEXT NOT NULL, -- 'friendship', 'romance', 'marriage'
    status TEXT NOT NULL, -- 'active', 'broken', 'divorced'
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    FOREIGN KEY (player1_id) REFERENCES players(id),
    FOREIGN KEY (player2_id) REFERENCES players(id)
);

-- 친구 관계
CREATE TABLE IF NOT EXISTS friendships (
    id SERIAL PRIMARY KEY,
    player1_id TEXT NOT NULL,
    player2_id TEXT NOT NULL,
    status TEXT NOT NULL, -- 'pending', 'accepted', 'blocked'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player1_id) REFERENCES players(id),
    FOREIGN KEY (player2_id) REFERENCES players(id)
);

-- 결혼 관계
CREATE TABLE IF NOT EXISTS marriages (
    id SERIAL PRIMARY KEY,
    player1_id TEXT NOT NULL,
    player2_id TEXT NOT NULL,
    wedding_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL, -- 'married', 'divorced'
    divorce_date TIMESTAMP,
    FOREIGN KEY (player1_id) REFERENCES players(id),
    FOREIGN KEY (player2_id) REFERENCES players(id)
);

-- 업적 정보
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    reward_money INTEGER DEFAULT 0,
    reward_exp INTEGER DEFAULT 0
);

-- 플레이어 업적
CREATE TABLE IF NOT EXISTS player_achievements (
    id SERIAL PRIMARY KEY,
    player_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, achievement_id),
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);

-- 아이템
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT NOT NULL,
    effect_type TEXT NOT NULL,
    effect_value INTEGER NOT NULL,
    effect_duration INTEGER DEFAULT 0,
    rarity TEXT NOT NULL,
    stock INTEGER DEFAULT -1,
    is_available BOOLEAN DEFAULT TRUE
);

-- 상점 아이템
CREATE TABLE IF NOT EXISTS shop_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT NOT NULL,
    effect_type TEXT NOT NULL,
    effect_value INTEGER NOT NULL,
    effect_duration INTEGER DEFAULT 0,
    rarity TEXT NOT NULL,
    stock INTEGER DEFAULT -1,
    is_available BOOLEAN DEFAULT TRUE
);

-- 플레이어 인벤토리
CREATE TABLE IF NOT EXISTS player_inventory (
    id SERIAL PRIMARY KEY,
    player_id TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, item_id),
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (item_id) REFERENCES shop_items(id)
);

-- 플레이어 도구
CREATE TABLE IF NOT EXISTS player_tools (
    id SERIAL PRIMARY KEY,
    player_id TEXT NOT NULL,
    tool_type TEXT NOT NULL, -- 'fishing_rod', 'pickaxe', 'hoe'
    tool_id TEXT NOT NULL,
    durability INTEGER NOT NULL,
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- 펫 종류
CREATE TABLE IF NOT EXISTS pet_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    rarity TEXT NOT NULL,
    stats_bonus TEXT,
    price INTEGER DEFAULT 0
);

-- 개인 채널
CREATE TABLE IF NOT EXISTS private_channels (
    id SERIAL PRIMARY KEY,
    player_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (player_id) REFERENCES players(id)
);