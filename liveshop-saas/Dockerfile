FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ecf2643bc2a1696c9#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat openssl
RUN apk update
# Set working directory
WORKDIR /app
RUN npm install -g turbo@1.11.0
COPY . .
RUN turbo prune --scope=@liveshop/api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat openssl
RUN apk update
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Generate Prisma Client
RUN cd packages/shared && npx prisma generate

# Build the API service
RUN npx turbo build --filter=@liveshop/api...

FROM base AS runner
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify
USER fastify

COPY --from=installer /app .

EXPOSE 3001

ENV PORT 3001
ENV NODE_ENV production

CMD ["node", "services/api/dist/server.js"]
