FROM node:20-slim AS base

# Install dependencies only when needed
FROM base AS builder
# Install necessary libraries for Debian
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app
RUN npm install -g turbo@1.11.0
COPY . .
RUN turbo prune --scope=@liveshop/api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
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

# Install openssl in runner as well
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 fastify
USER fastify

COPY --from=installer /app .

EXPOSE 3001

ENV PORT 3001
ENV NODE_ENV production

CMD ["node", "services/api/dist/server.js"]
