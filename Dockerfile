# 운영용 이미지 (Next.js standalone). 로컬 개발은 pnpm dev 를 쓴다.
# 빌드: docker build --build-arg NEXT_PUBLIC_EXTERNAL_API_URL=https://api.example.com -t fe-agent .
# BACKEND_URL 은 서버 전용이라 실행할 때 환경변수로 넘긴다.

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* 는 빌드할 때 번들에 박히므로 빌드 인자로 받는다
ARG NEXT_PUBLIC_EXTERNAL_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_EXTERNAL_API_URL=$NEXT_PUBLIC_EXTERNAL_API_URL NEXT_TELEMETRY_DISABLED=1
RUN pnpm build


FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
