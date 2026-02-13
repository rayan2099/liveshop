FROM node:20-alpine AS builder
WORKDIR /app

# Copy entire repo to allow workspace builds
COPY . /app

RUN npm ci --omit=dev

# Build only the api (ts build is currently skipped/adjusted during CI)
RUN npm run -w services/api build || true

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app /app
WORKDIR /app/liveshop-saas/services/api
ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm","run","start"]
