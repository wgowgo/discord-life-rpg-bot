@echo off
chcp 65001 >nul
title Discord Life RPG Bot 설정

echo.
echo 🤖 Discord Life RPG Bot 설정을 시작합니다...
echo.

REM 관리자 권한 확인
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ 이 스크립트는 관리자 권한이 필요합니다.
    echo 우클릭 후 "관리자 권한으로 실행"을 선택해주세요.
    pause
    exit /b 1
)

REM Node.js 설치 확인
echo 📦 Node.js 설치 확인 중...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Node.js가 설치되지 않았습니다.
    echo https://nodejs.org에서 Node.js 18 LTS를 다운로드하여 설치해주세요.
    pause
    exit /b 1
) else (
    echo ✅ Node.js가 설치되어 있습니다.
)

REM Git 설치 확인
echo 📦 Git 설치 확인 중...
git --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Git이 설치되지 않았습니다.
    echo https://git-scm.com에서 Git을 다운로드하여 설치해주세요.
    pause
    exit /b 1
) else (
    echo ✅ Git이 설치되어 있습니다.
)

REM PM2 설치
echo 📦 PM2 설치 중...
npm list -g pm2 >nul 2>&1
if %errorLevel% neq 0 (
    echo PM2를 전역으로 설치합니다...
    npm install -g pm2
    if %errorLevel% neq 0 (
        echo ❌ PM2 설치에 실패했습니다.
        pause
        exit /b 1
    )
) else (
    echo ✅ PM2가 이미 설치되어 있습니다.
)

REM 프로젝트 의존성 설치
echo 📦 프로젝트 의존성 설치 중...
if exist package.json (
    npm install
    if %errorLevel% neq 0 (
        echo ❌ 의존성 설치에 실패했습니다.
        pause
        exit /b 1
    )
    echo ✅ 의존성 설치가 완료되었습니다.
) else (
    echo ❌ package.json을 찾을 수 없습니다.
    echo 프로젝트 폴더에서 이 스크립트를 실행해주세요.
    pause
    exit /b 1
)

REM 필요한 폴더 생성
echo 📁 폴더 구조 생성 중...
if not exist logs mkdir logs
if not exist data mkdir data
echo ✅ 폴더 구조가 생성되었습니다.

REM config.json 템플릿 생성
if not exist config.json (
    echo 📝 config.json 템플릿 생성 중...
    (
        echo {
        echo   "token": "YOUR_BOT_TOKEN_HERE",
        echo   "clientId": "YOUR_BOT_CLIENT_ID",
        echo   "guildId": "YOUR_SERVER_ID_OPTIONAL",
        echo   "database": {
        echo     "filename": "data/lifeRPG.db"
        echo   },
        echo   "game": {
        echo     "startingMoney": 50000,
        echo     "startingStats": {
        echo       "health": 100,
        echo       "happiness": 50,
        echo       "education": 10,
        echo       "charm": 10,
        echo       "luck": 10,
        echo       "intelligence": 10,
        echo       "strength": 10,
        echo       "agility": 10
        echo     }
        echo   },
        echo   "rewards": {
        echo     "chat": {
        echo       "money": 100,
        echo       "experience": 10,
        echo       "cooldown": 60000
        echo     },
        echo     "voice": {
        echo       "moneyPerMinute": 50,
        echo       "experiencePerMinute": 5,
        echo       "minimumMinutes": 1
        echo     }
        echo   }
        echo }
    ) > config.json
    echo ✅ config.json 템플릿이 생성되었습니다.
) else (
    echo ✅ config.json이 이미 존재합니다.
)

REM Windows 서비스 스크립트 생성
echo 📝 Windows 서비스 스크립트 생성 중...
(
    echo @echo off
    echo title Discord Life RPG Bot
    echo cd /d "%~dp0"
    echo echo 🚀 Discord Life RPG Bot을 시작합니다...
    echo pm2 start ecosystem.config.js
    echo pm2 save
    echo echo ✅ 봇이 시작되었습니다!
    echo echo 📊 상태 확인: pm2 status
    echo echo 📝 로그 확인: pm2 logs discord-life-rpg-bot
    echo pause
) > start-bot.bat

(
    echo @echo off
    echo title Discord Life RPG Bot - Stop
    echo cd /d "%~dp0"
    echo echo 🛑 Discord Life RPG Bot을 중지합니다...
    echo pm2 stop discord-life-rpg-bot
    echo echo ✅ 봇이 중지되었습니다!
    echo pause
) > stop-bot.bat

(
    echo @echo off
    echo title Discord Life RPG Bot - Status
    echo cd /d "%~dp0"
    echo echo 📊 Discord Life RPG Bot 상태:
    echo pm2 status
    echo echo.
    echo echo 📝 로그 확인:
    echo pm2 logs discord-life-rpg-bot --lines 20
    echo pause
) > status-bot.bat

echo ✅ 관리 스크립트들이 생성되었습니다.

echo.
echo 🎉 설정이 완료되었습니다!
echo.
echo 📋 다음 단계를 수행해주세요:
echo.
echo 1. config.json 파일을 메모장으로 열어서 봇 토큰과 설정을 입력하세요
echo.
echo 2. 명령 프롬프트에서 다음을 실행하여 슬래시 명령어를 등록하세요:
echo    node deploy-commands.js
echo.
echo 3. start-bot.bat을 실행하여 봇을 시작하세요
echo.
echo 🔧 관리 도구들:
echo    start-bot.bat  - 봇 시작
echo    stop-bot.bat   - 봇 중지
echo    status-bot.bat - 봇 상태 확인
echo.
echo 🎮 봇이 성공적으로 시작되면 24시간 운영됩니다!
echo.
pause


