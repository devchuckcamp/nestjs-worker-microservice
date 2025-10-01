#!/bin/bash

# Quick Setup Script for NestJS Email Worker
# This script helps you get started with the development environment

set -e

echo "🚀 Setting up NestJS Email Worker Development Environment"
echo "========================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="18.0.0"
if ! node -e "process.exit(process.version.slice(1).split('.').map(Number).reduce((a,b,i) => a + b * Math.pow(1000, 2-i), 0) >= $REQUIRED_VERSION.split('.').map(Number).reduce((a,b,i) => a + b * Math.pow(1000, 2-i), 0) ? 0 : 1)"; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to v18 or higher."
    exit 1
fi

echo "✅ Docker is installed"
echo "✅ Node.js $NODE_VERSION is installed"

# Install npm dependencies
echo ""
echo "📦 Installing npm dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "⚙️ Creating .env file..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env from .env.example"
    else
        cat > .env << EOF
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=your_email@example.com

# Application Configuration
PORT=3001
NODE_ENV=development

# Redis Configuration (default for development)
REDIS_HOST=localhost
REDIS_PORT=6379
EOF
        echo "✅ Created basic .env file"
    fi
    echo "⚠️ Please edit .env file and add your SendGrid credentials"
else
    echo "✅ .env file already exists"
fi

# Make scripts executable
echo ""
echo "🔧 Making scripts executable..."
chmod +x redis-dev.sh
chmod +x test-queue-email.sh
echo "✅ Scripts are now executable"

# Start Redis services
echo ""
echo "🐳 Starting Redis services with Docker..."
docker-compose up -d

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
sleep 5

# Check if Redis is running
if docker-compose ps | grep -q "nest-worker-redis.*Up"; then
    echo "✅ Redis is running"
else
    echo "❌ Redis failed to start"
    exit 1
fi

# Check if Redis Insight is running
if docker-compose ps | grep -q "nest-worker-redis-insight.*Up"; then
    echo "✅ Redis Insight is running"
else
    echo "⚠️ Redis Insight may still be starting..."
fi

echo ""
echo "🎉 Setup complete! Here's what you can do next:"
echo ""
echo "📝 Edit your .env file with SendGrid credentials:"
echo "   nano .env"
echo ""
echo "🚀 Start the development server:"
echo "   npm run start:dev"
echo ""
echo "📊 Access Redis Insight (web interface):"
echo "   http://localhost:5540"
echo ""
echo "🔍 Check Redis status:"
echo "   ./redis-dev.sh status"
echo ""
echo "📧 Send a test email:"
echo "   ./test-queue-email.sh"
echo ""
echo "🛠️ View all Redis development commands:"
echo "   ./redis-dev.sh help"
echo ""
echo "📚 Read the documentation:"
echo "   cat README.md"
echo ""
echo "Happy coding! 🎯"