CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    age INTEGER DEFAULT 18,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    money REAL DEFAULT 10000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ?�레?�어 ?�탯 (직업/?�상??
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

-- ?�레?�어 RPG ?�탯 (?�전/?�투??
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

-- 직업 ?�보
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    base_salary REAL NOT NULL,
    required_education INTEGER DEFAULT 0,
    required_stats TEXT, -- JSON ?�태
    description TEXT
);

-- ?�레?�어 직업 ?�력
CREATE TABLE IF NOT EXISTS player_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT,
    job_id INTEGER,
    salary REAL,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME,
    is_current BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- 주식 ?�보
CREATE TABLE IF NOT EXISTS stocks (
    symbol TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    current_price REAL NOT NULL,
    change_percent REAL DEFAULT 0,
    sector TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ?�레?�어 주식 보유
CREATE TABLE IF NOT EXISTS player_stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT,
    stock_symbol TEXT,
    quantity INTEGER,
    average_price REAL,
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (stock_symbol) REFERENCES stocks(symbol)
);

-- 거래 ?�역
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT,
    type TEXT NOT NULL, -- 'buy', 'sell', 'salary', 'reward', etc.
    amount REAL NOT NULL,
    description TEXT,
    stock_symbol TEXT,
    quantity INTEGER,
    price REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- 부?�산
CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'house', 'apartment', 'commercial'
    price REAL NOT NULL,
    location TEXT,
    monthly_income REAL DEFAULT 0
);

-- ?�레?�어 부?�산 보유
CREATE TABLE IF NOT EXISTS player_properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT,
    property_id INTEGER,
    purchase_price REAL,
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- ??종류
CREATE TABLE IF NOT EXISTS pet_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    base_price REAL NOT NULL,
    special_ability TEXT,
    stats_bonus TEXT, -- JSON ?�태
    description TEXT
);

-- ?�레?�어 ??
CREATE TABLE IF NOT EXISTS player_pets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT,
    pet_type_id INTEGER,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    happiness INTEGER DEFAULT 100,
    acquired_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (pet_type_id) REFERENCES pet_types(id)
);

-- ?�이??카테고리
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    rarity TEXT DEFAULT 'common', -- common, rare, epic, legendary
    price REAL DEFAULT 0,
    stats_effect TEXT, -- JSON ?�태
    description TEXT,
    consumable BOOLEAN DEFAULT FALSE
);

-- ?�레?�어 ?�벤?�리
CREATE TABLE IF NOT EXISTS player_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT,
    item_id INTEGER,
    quantity INTEGER DEFAULT 1,
    acquired_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- ?�적 ?�의
CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    condition_type TEXT NOT NULL,
    condition_value TEXT, -- JSON ?�태
    reward_type TEXT,
    reward_value TEXT, -- JSON ?�태
    rarity TEXT DEFAULT 'common'
);

-- ?�레?�어 ?�적
CREATE TABLE IF NOT EXISTS player_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT,
    achievement_id INTEGER,
    unlocked_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);

-- �?��
CREATE TABLE IF NOT EXISTS titles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    requirements TEXT, -- JSON ?�태
    stats_bonus TEXT, -- JSON ?�태
    rarity TEXT DEFAULT 'common'
);

-- ?�레?�어 �?��
CREATE TABLE IF NOT EXISTS player_titles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT,
    title_id INTEGER,
    unlocked_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (title_id) REFERENCES titles(id)
);

-- ?�전과제
CREATE TABLE IF NOT EXISTS challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    condition_type TEXT NOT NULL,
    condition_value TEXT, -- JSON ?�태
    reward_type TEXT,
    reward_value TEXT, -- JSON ?�태
    start_date DATE,
    end_date DATE
);

-- ?�레?�어 ?�전과제 진행?�황
CREATE TABLE IF NOT EXISTS player_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT,
    challenge_id INTEGER,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_date DATETIME,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (challenge_id) REFERENCES challenges(id)
);

-- 친구 관�?
CREATE TABLE IF NOT EXISTS friendships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player1_id TEXT,
    player2_id TEXT,
    status TEXT DEFAULT 'pending', -- pending, accepted, blocked
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player1_id) REFERENCES players(id),
    FOREIGN KEY (player2_id) REFERENCES players(id)
);

-- 결혼
CREATE TABLE IF NOT EXISTS marriages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player1_id TEXT,
    player2_id TEXT,
    marriage_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (player1_id) REFERENCES players(id),
    FOREIGN KEY (player2_id) REFERENCES players(id)
);

-- 채팅 ?�동 로그
CREATE TABLE IF NOT EXISTS chat_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT,
    channel_id TEXT,
    message_count INTEGER DEFAULT 1,
    last_reward_time DATETIME,
    date DATE DEFAULT (DATE('now')),
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- ?�성 ?�동 로그
CREATE TABLE IF NOT EXISTS voice_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT,
    channel_id TEXT,
    duration_minutes INTEGER DEFAULT 0,
    last_update DATETIME DEFAULT CURRENT_TIMESTAMP,
    date DATE DEFAULT (DATE('now')),
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- ?�전
CREATE TABLE IF NOT EXISTS dungeons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'daily', 'career', 'adventure'
    difficulty INTEGER DEFAULT 1,
    required_level INTEGER DEFAULT 1,
    required_stats TEXT, -- JSON ?�태
    rewards TEXT, -- JSON ?�태
    description TEXT
);

-- ?�레?�어 ?�전 ?�리??기록
CREATE TABLE IF NOT EXISTS player_dungeon_clears (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT,
    dungeon_id INTEGER,
    clear_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    score INTEGER DEFAULT 0,
    rewards_received TEXT, -- JSON ?�태
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (dungeon_id) REFERENCES dungeons(id)
);

-- ??�� 캐시 (?�능???�한 ?�이�?
CREATE TABLE IF NOT EXISTS rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL, -- 'wealth', 'level', 'achievements'
    player_id TEXT,
    value REAL,
    rank_position INTEGER,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- ?�박 기록
CREATE TABLE IF NOT EXISTS gambling_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT,
    game_type TEXT NOT NULL, -- 'coin_flip', 'dice_roll', 'slot_machine', 'card_game'
    bet_amount REAL NOT NULL,
    net_result REAL NOT NULL, -- ?�수??(?�수: ?�리, ?�수: ?�배)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- 직업 ?�사 쿨다??
CREATE TABLE IF NOT EXISTS job_cooldowns (
    player_id TEXT PRIMARY KEY,
    quit_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- ?�레?�어 ?�구
CREATE TABLE IF NOT EXISTS player_tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT,
    tool_id TEXT,
    durability INTEGER,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- ?�레?�어 ?�벤?�리
CREATE TABLE IF NOT EXISTS player_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT,
    item_id TEXT,
    quantity INTEGER DEFAULT 0,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

