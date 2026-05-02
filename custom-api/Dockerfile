# Builder
FROM node:20-alpine AS builder
WORKDIR /app

ENV CI=true
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate \
  && pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build \
  && pnpm prune --prod

# Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache tini

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist

EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/app.js"]
