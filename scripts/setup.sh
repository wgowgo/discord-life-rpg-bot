#!/bin/bash

# Discord Life RPG Bot 자동 설정 스크립트 (Ubuntu/Debian)

echo "🤖 Discord Life RPG Bot 설정을 시작합니다..."

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 에러 처리
set -e

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 시스템 업데이트
print_status "시스템 업데이트 중..."
sudo apt update && sudo apt upgrade -y

# Node.js 설치
print_status "Node.js 18 설치 중..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git 설치
print_status "Git 설치 중..."
sudo apt install git -y

# PM2 전역 설치
print_status "PM2 프로세스 매니저 설치 중..."
sudo npm install -g pm2

# 프로젝트 디렉토리 생성
print_status "프로젝트 디렉토리 설정 중..."
PROJECT_DIR="$HOME/discord-life-rpg"

if [ -d "$PROJECT_DIR" ]; then
    print_warning "프로젝트 디렉토리가 이미 존재합니다. 백업 생성 중..."
    mv "$PROJECT_DIR" "$PROJECT_DIR.backup.$(date +%Y%m%d_%H%M%S)"
fi

mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# 필요한 디렉토리 생성
mkdir -p logs data

# 의존성 설치 (프로젝트 파일이 있다고 가정)
if [ -f "package.json" ]; then
    print_status "NPM 의존성 설치 중..."
    npm install
else
    print_warning "package.json을 찾을 수 없습니다. 수동으로 프로젝트 파일을 복사해주세요."
fi

# 방화벽 설정 (필요시)
print_status "방화벽 설정 중..."
sudo ufw allow 3000/tcp
sudo ufw allow ssh

# config.json 템플릿 생성
if [ ! -f "config.json" ]; then
    print_status "config.json 템플릿 생성 중..."
    cat > config.json << 'EOF'
{
  "token": "YOUR_BOT_TOKEN_HERE",
  "clientId": "YOUR_BOT_CLIENT_ID", 
  "guildId": "YOUR_SERVER_ID_OPTIONAL",
  "database": {
    "filename": "data/lifeRPG.db"
  },
  "game": {
    "startingMoney": 50000,
    "startingStats": {
      "health": 100,
      "happiness": 50,
      "education": 10,
      "charm": 10,
      "luck": 10,
      "intelligence": 10,
      "strength": 10,
      "agility": 10
    }
  },
  "rewards": {
    "chat": {
      "money": 100,
      "experience": 10,
      "cooldown": 60000
    },
    "voice": {
      "moneyPerMinute": 50,
      "experiencePerMinute": 5,
      "minimumMinutes": 1
    }
  }
}
EOF
fi

# 서비스 파일 생성 (systemd 대안)
print_status "시스템 서비스 설정 중..."
sudo tee /etc/systemd/system/discord-life-rpg.service > /dev/null << EOF
[Unit]
Description=Discord Life RPG Bot
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# PM2 startup 설정
print_status "PM2 자동 시작 설정 중..."
pm2 startup systemd -u $USER --hp $HOME

print_success "설정이 완료되었습니다!"

echo ""
echo "🔧 다음 단계를 수행해주세요:"
echo ""
echo "1. config.json 파일을 편집하여 봇 토큰과 설정을 입력하세요:"
echo "   nano config.json"
echo ""
echo "2. 슬래시 명령어를 등록하세요:"
echo "   node deploy-commands.js"
echo ""
echo "3. PM2로 봇을 시작하세요:"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo ""
echo "4. 또는 systemd 서비스로 시작하세요:"
echo "   sudo systemctl enable discord-life-rpg"
echo "   sudo systemctl start discord-life-rpg"
echo ""
echo "🎮 봇이 성공적으로 시작되면 24시간 운영됩니다!"
echo ""
echo "📊 상태 확인 명령어들:"
echo "   pm2 status"
echo "   pm2 logs discord-life-rpg-bot"
echo "   sudo systemctl status discord-life-rpg"



