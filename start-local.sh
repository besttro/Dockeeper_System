#!/bin/bash
echo "🚀 Starting application and database..."
set -e

# -d (detached) หมายถึงให้ run containers ใน background
docker-compose up -d

echo "✅ Services are starting in the background."
echo "   - To see application logs, run: docker-compose logs -f app"
echo "   - To see database logs, run: docker-compose logs -f db"
echo "🌐 Your application should be available at http://localhost:3000 shortly."