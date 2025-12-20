#!/bin/bash
set -e

# MCP Notify Deploy Script
# Builds and deploys MCP Notify server

PROJECT_PATH="/home/jirka/GitHub/Olbrasoft/ClaudeCode/mcp-notify"
DEPLOY_TARGET="/home/jirka/apps/mcp-notify"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              MCP Notify Deploy Script                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo

cd "$PROJECT_PATH"

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo

# Step 2: Build
echo "🔨 Building..."
npm run build
echo "✅ Build completed"
echo

# Step 3: Deploy
echo "📋 Deploying to $DEPLOY_TARGET..."
mkdir -p "$DEPLOY_TARGET"

# Copy dist, node_modules, and package.json
cp -r dist "$DEPLOY_TARGET/"
cp -r node_modules "$DEPLOY_TARGET/"
cp package.json "$DEPLOY_TARGET/"

echo "✅ Deployed to $DEPLOY_TARGET"
echo

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║               ✅ Deployment completed!                        ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Location: $DEPLOY_TARGET                   ║"
echo "║  Entry: $DEPLOY_TARGET/dist/index.js        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
