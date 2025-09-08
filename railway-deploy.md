# Railway 배포 가이드

## 1. Railway 계정 생성
- https://railway.app 접속
- GitHub 계정으로 로그인

## 2. 프로젝트 연결
- "New Project" 클릭
- "Deploy from GitHub repo" 선택
- 이 프로젝트 저장소 연결

## 3. 환경 변수 설정
Railway 대시보드에서 다음 환경 변수 추가:

```
BOT_TOKEN=여기에_봇_토큰
CLIENT_ID=여기에_클라이언트_ID
GUILD_ID=여기에_서버_ID
NODE_ENV=production
```

## 4. 자동 배포
- GitHub에 코드 푸시하면 자동으로 배포됨
- 24/7 무료 실행 (월 $5 크레딧)

## 5. 도메인 설정
- Railway에서 제공하는 도메인 사용
- 커스텀 도메인도 설정 가능
