FROM node:20-alpine
WORKDIR /app

# Copy package files for all workspaces
COPY liveshop-saas/package.json liveshop-saas/package-lock.json ./
COPY liveshop-saas/packages ./packages
COPY liveshop-saas/services ./services
COPY liveshop-saas/apps ./apps
COPY liveshop-saas/turbo.json ./

# Install all dependencies
RUN npm ci --omit=dev 2>&1 || npm install --omit=dev

# Build workspaces
RUN npm run -w packages/shared build
RUN npm run -w services/streaming build
RUN npm run -w services/api build || true

WORKDIR /app/services/api
ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm","run","start"]
