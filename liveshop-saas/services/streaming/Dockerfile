FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY packages ./packages
COPY services ./services
COPY apps ./apps
COPY turbo.json ./

# Install dependencies
RUN npm ci --omit=dev 2>&1 || npm install --omit=dev

# Build shared and streaming
RUN npm run -w packages/shared build || true
RUN npm run -w services/streaming build || true

WORKDIR /app/services/streaming
ENV NODE_ENV=production
EXPOSE 3002
CMD ["npm","run","start"]
