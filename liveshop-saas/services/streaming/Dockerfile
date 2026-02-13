FROM node:20-alpine AS builder
WORKDIR /app

# Copy entire repo to allow workspace builds
COPY . /app

RUN npm ci --omit=dev

# Build streaming package
RUN npm run -w services/streaming build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app /app
WORKDIR /app/liveshop-saas/services/streaming
ENV NODE_ENV=production
EXPOSE 3002
CMD ["npm","run","start"]
