#!/bin/bash
set -e

cd liveshop-saas

echo "🔨 Building all services..."
npm run build

echo "📦 Running database migrations..."
npm run db:generate

echo "🚀 Starting API server..."
npm run -w services/api start
