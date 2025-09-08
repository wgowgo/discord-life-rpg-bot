# Node.js 18 LTS 알파인 이미지 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 의존성 설치
RUN apk add --no-cache \
    sqlite \
    curl \
    && rm -rf /var/cache/apk/*

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production && npm cache clean --force

# 소스 코드 복사
COPY . .

# 로그 및 데이터 디렉토리 생성
RUN mkdir -p logs data

# 포트 노출
EXPOSE 3000

# 비root 사용자 생성 및 권한 설정
RUN addgroup -g 1001 -S nodejs && \
    adduser -S discord-bot -u 1001 && \
    chown -R discord-bot:nodejs /app

USER discord-bot

# 헬스체크 설정
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# 봇 실행
CMD ["node", "index.js"]




