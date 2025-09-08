# Railway 배포 설정 가이드

## 1. Railway 토큰 생성

1. **Railway 대시보드** 접속: https://railway.app
2. **계정 설정** → **Tokens** 클릭
3. **Generate Token** 클릭
4. 토큰 이름 입력 (예: "Discord Bot Deploy")
5. **Generate** 클릭하여 토큰 복사

## 2. GitHub Secrets 설정

1. **GitHub 저장소** → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. 다음 시크릿 추가:

### RAILWAY_TOKEN
- **Name**: `RAILWAY_TOKEN`
- **Value**: 1단계에서 생성한 Railway 토큰

### RAILWAY_SERVICE
- **Name**: `RAILWAY_SERVICE`
- **Value**: Railway 프로젝트의 서비스 이름 (예: "discord-bot")

## 3. Railway 환경변수 설정

Railway 대시보드에서 다음 환경변수 설정:

```
BOT_TOKEN=실제_봇_토큰
CLIENT_ID=실제_클라이언트_ID
GUILD_ID=실제_서버_ID
NODE_ENV=production
```

## 4. 자동 배포 확인

GitHub에 코드를 푸시하면 자동으로 Railway에 배포됩니다:

```bash
git add .
git commit -m "Update bot"
git push origin main
```

## 5. 배포 상태 확인

- **GitHub Actions**: 저장소의 "Actions" 탭에서 배포 상태 확인
- **Railway 대시보드**: 배포 로그 및 상태 확인
- **Discord**: 봇이 온라인 상태인지 확인

## 문제 해결

### 명령어가 안 뜨는 경우:
1. Railway에서 환경변수가 올바르게 설정되었는지 확인
2. 봇이 정상적으로 시작되었는지 Railway 로그 확인
3. Discord Developer Portal에서 봇 권한 확인

### 배포 실패 시:
1. GitHub Actions 로그 확인
2. Railway 토큰이 올바른지 확인
3. 서비스 이름이 정확한지 확인
