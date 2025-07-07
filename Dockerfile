# 2025 Multi-stage Dockerfile for Next.js + PostgreSQL dev/prod
FROM node:20-alpine AS base

# Dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat git postgresql-client
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Development stage
FROM base AS dev
WORKDIR /app
RUN apk add --no-cache git
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Builder stage for production
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production runner
FROM base AS prod
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]