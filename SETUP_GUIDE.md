# 🤖 Discord Life RPG 봇 완전 설정 가이드

## 📋 목차
1. [Discord 봇 생성 및 등록](#1-discord-봇-생성-및-등록)
2. [봇 설정 및 권한](#2-봇-설정-및-권한)
3. [로컬 환경 설정](#3-로컬-환경-설정)
4. [서버 배포 (24시간 동작)](#4-서버-배포-24시간-동작)
5. [트러블슈팅](#5-트러블슈팅)

---

## 1. Discord 봇 생성 및 등록

### 🔧 **1단계: Discord Developer Portal 접속**

1. **Discord Developer Portal 접속**
   - 웹 브라우저에서 https://discord.com/developers/applications 접속
   - Discord 계정으로 로그인

2. **새 애플리케이션 생성**
   ```
   1. "New Application" 버튼 클릭
   2. 애플리케이션 이름 입력 (예: "Life RPG Bot")
   3. "Create" 버튼 클릭
   ```

### 🤖 **2단계: 봇 생성**

1. **Bot 설정**
   ```
   1. 왼쪽 메뉴에서 "Bot" 클릭
   2. "Add Bot" 버튼 클릭
   3. "Yes, do it!" 확인
   ```

2. **봇 기본 설정**
   ```
   ✅ PUBLIC BOT: 체크 해제 (개인 서버용)
   ✅ REQUIRES OAUTH2 CODE GRANT: 체크 해제
   ✅ MESSAGE CONTENT INTENT: 체크 (중요!)
   ✅ SERVER MEMBERS INTENT: 체크 (중요!)
   ✅ PRESENCE INTENT: 체크 (선택사항)
   ```

3. **봇 토큰 복사**
   ```
   1. "Reset Token" 버튼 클릭 (처음이면 "Copy" 버튼)
   2. 토큰을 안전한 곳에 저장 (절대 공유하지 마세요!)
   ```

### 🔑 **3단계: OAuth2 설정**

1. **OAuth2 URL Generator**
   ```
   1. 왼쪽 메뉴에서 "OAuth2" → "URL Generator" 클릭
   2. SCOPES에서 다음 체크:
      ✅ bot
      ✅ applications.commands
   ```

2. **봇 권한 설정**
   ```
   BOT PERMISSIONS에서 다음 권한들 체크:
   
   📝 텍스트 권한:
   ✅ Send Messages
   ✅ Send Messages in Threads  
   ✅ Create Public Threads
   ✅ Create Private Threads
   ✅ Embed Links
   ✅ Attach Files
   ✅ Read Message History
   ✅ Use External Emojis
   ✅ Add Reactions
   
   🎙️ 음성 권한:
   ✅ Connect
   ✅ Speak
   
   🔧 관리 권한:
   ✅ Manage Channels (개인 채널 생성용)
   ✅ Manage Messages
   ✅ Read Messages/View Channels
   ✅ Use Slash Commands
   ```

3. **초대 링크 생성**
   ```
   1. 하단에 생성된 URL 복사
   2. 새 탭에서 해당 URL 접속
   3. 봇을 초대할 서버 선택
   4. "Authorize" 클릭
   ```

---

## 2. 봇 설정 및 권한

### ⚙️ **config.json 설정**

프로젝트 루트에 `config.json` 파일을 생성하세요:

```json
{
  "token": "YOUR_BOT_TOKEN_HERE",
  "clientId": "YOUR_BOT_CLIENT_ID",
  "guildId": "YOUR_SERVER_ID_OPTIONAL",
  "database": {
    "filename": "lifeRPG.db"
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
```

### 🔍 **필요한 ID 찾기**

#### **봇 Client ID 찾기:**
```
1. Discord Developer Portal에서 애플리케이션 선택
2. "General Information" 탭
3. "APPLICATION ID" 복사 → clientId에 입력
```

#### **서버 ID 찾기 (선택사항):**
```
1. Discord에서 개발자 모드 활성화:
   설정 → 앱 설정 → 고급 → 개발자 모드 ON
2. 서버 아이콘 우클릭 → "서버 ID 복사"
3. guildId에 입력 (전역 명령어는 이 항목 제거)
```

---

## 3. 로컬 환경 설정

### 📦 **1단계: 프로젝트 설치**

```bash
# 프로젝트 폴더로 이동
cd discord-life-rpg

# 의존성 설치
npm install

# 추가 패키지 설치 (혹시 없다면)
npm install discord.js sqlite3 node-cron
```

### 🔧 **2단계: 명령어 등록**

```bash
# 슬래시 명령어 등록
node deploy-commands.js
```

성공하면 다음과 같은 메시지가 출력됩니다:
```
Started refreshing application (/) commands.
Successfully reloaded application (/) commands.
```

### 🚀 **3단계: 봇 실행**

```bash
# 개발 모드 실행
npm run dev

# 또는 일반 실행
npm start

# 또는 직접 실행
node index.js
```

성공하면 다음과 같은 로그가 출력됩니다:
```
데이터베이스 연결 성공
초기 데이터가 삽입되었습니다.
모든 게임 시스템이 초기화되었습니다.
명령어 로드됨: 프로필
명령어 로드됨: 주식
... (기타 명령어들)
[봇이름]#1234로 로그인했습니다!
```

---

## 4. 서버 배포 (24시간 동작)

### 🌐 **방법 1: Heroku (무료/유료)**

#### **Heroku 설정:**

1. **Heroku 계정 생성**
   - https://heroku.com 가입
   - Heroku CLI 설치

2. **프로젝트 준비**
   ```bash
   # Git 초기화 (아직 안했다면)
   git init
   git add .
   git commit -m "Initial commit"
   
   # Heroku 앱 생성
   heroku create your-life-rpg-bot
   
   # 환경변수 설정
   heroku config:set BOT_TOKEN=your_bot_token_here
   heroku config:set CLIENT_ID=your_client_id_here
   ```

3. **Procfile 생성**
   ```
   worker: node index.js
   ```

4. **package.json 수정**
   ```json
   {
     "scripts": {
       "start": "node index.js"
     },
     "engines": {
       "node": "16.x"
     }
   }
   ```

5. **배포**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   
   # 워커 프로세스 활성화
   heroku ps:scale worker=1
   ```

### 🔋 **방법 2: Railway (추천)**

1. **Railway 가입**
   - https://railway.app 접속
   - GitHub 계정으로 가입

2. **프로젝트 배포**
   ```bash
   # Railway CLI 설치
   npm install -g @railway/cli
   
   # Railway 로그인
   railway login
   
   # 프로젝트 배포
   railway deploy
   ```

3. **환경변수 설정**
   ```
   Railway 대시보드에서:
   - BOT_TOKEN=your_token
   - CLIENT_ID=your_client_id
   - NODE_ENV=production
   ```

### 🖥️ **방법 3: VPS 서버 (Ubuntu)**

#### **VPS 설정:**

1. **서버 준비**
   ```bash
   # 서버 업데이트
   sudo apt update && sudo apt upgrade -y
   
   # Node.js 설치
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Git 설치
   sudo apt install git -y
   
   # PM2 설치 (프로세스 관리자)
   sudo npm install -g pm2
   ```

2. **프로젝트 배포**
   ```bash
   # 프로젝트 클론
   git clone your-repository-url
   cd discord-life-rpg
   
   # 의존성 설치
   npm install
   
   # 명령어 등록
   node deploy-commands.js
   ```

3. **PM2로 24시간 실행**
   ```bash
   # PM2 설정 파일 생성 (ecosystem.config.js)
   module.exports = {
     apps: [{
       name: 'life-rpg-bot',
       script: 'index.js',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production'
       }
     }]
   }
   
   # PM2로 실행
   pm2 start ecosystem.config.js
   
   # 부팅 시 자동 시작 설정
   pm2 startup
   pm2 save
   ```

4. **PM2 관리 명령어**
   ```bash
   # 상태 확인
   pm2 status
   
   # 로그 확인
   pm2 logs life-rpg-bot
   
   # 재시작
   pm2 restart life-rpg-bot
   
   # 중지
   pm2 stop life-rpg-bot
   
   # 삭제
   pm2 delete life-rpg-bot
   ```

### 🆓 **방법 4: 무료 호스팅 (Repl.it)**

1. **Repl.it 설정**
   ```bash
   # replit.nix 파일 생성
   { pkgs }: {
     deps = [
       pkgs.nodejs-16_x
       pkgs.nodePackages.typescript
       pkgs.nodePackages.npm
     ];
   }
   ```

2. **.replit 파일 생성**
   ```
   run = "node index.js"
   language = "nodejs"
   ```

3. **Always On 설정**
   - Repl.it 유료 플랜으로 업그레이드
   - Always On 기능 활성화

---

## 5. 트러블슈팅

### ❌ **자주 발생하는 오류들**

#### **1. "Invalid Token" 오류**
```
해결방법:
1. Discord Developer Portal에서 토큰 재생성
2. config.json의 token 값 업데이트
3. 토큰 앞뒤 공백 제거 확인
```

#### **2. "Missing Permissions" 오류**
```
해결방법:
1. 봇 권한 재확인 (관리 채널 권한 필수)
2. 봇을 서버에서 내보내고 올바른 권한으로 재초대
3. 서버 역할 순서에서 봇 역할을 상위로 이동
```

#### **3. "Missing Access" 오류**
```
해결방법:
1. MESSAGE CONTENT INTENT 활성화 확인
2. SERVER MEMBERS INTENT 활성화 확인
3. 봇 재시작
```

#### **4. 데이터베이스 오류**
```
해결방법:
1. SQLite3 설치 확인: npm install sqlite3
2. 파일 권한 확인 (쓰기 권한 필요)
3. 데이터베이스 파일 경로 확인
```

#### **5. 명령어가 나타나지 않음**
```
해결방법:
1. deploy-commands.js 실행 확인
2. 봇이 서버에 제대로 들어왔는지 확인
3. 슬래시 명령어 권한 확인
4. 1시간 정도 기다리기 (Discord 캐시)
```

### 🔧 **성능 최적화**

#### **메모리 사용량 최적화:**
```javascript
// index.js 상단에 추가
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

#### **데이터베이스 최적화:**
```sql
-- SQLite 성능 향상
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 1000;
PRAGMA temp_store = memory;
```

### 📊 **모니터링 설정**

#### **로그 파일 설정:**
```javascript
const fs = require('fs');

// 로그 함수 추가
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    console.log(message);
    fs.appendFileSync('bot.log', logMessage);
}
```

#### **상태 확인 API:**
```javascript
// 간단한 상태 확인 엔드포인트
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

app.listen(3000, () => {
    console.log('Health check server running on port 3000');
});
```

---

## 🎉 마무리

이제 Discord Life RPG 봇이 24시간 동작합니다! 

### ✅ **확인사항**
- [ ] 봇이 온라인 상태인지 확인
- [ ] `/프로필` 명령어가 작동하는지 테스트
- [ ] 개인 채널이 생성되는지 확인
- [ ] 모든 게임 시스템이 정상 작동하는지 테스트

### 🚀 **다음 단계**
1. 서버 멤버들에게 게임 안내
2. 정기적인 백업 설정
3. 업데이트 및 새 기능 추가
4. 커뮤니티 피드백 수집

### 📞 **도움이 필요하시면**
- 오류 메시지와 함께 문의
- 로그 파일 확인
- Discord Developer Portal 설정 재확인

**즐거운 게임 운영 되세요!** 🎮✨



