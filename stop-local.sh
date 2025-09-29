#!/bin/bash
echo "🚀 Stopping and cleaning up all services..."
set -e

# -v หมายถึงให้ลบ named volumes ที่ประกาศไว้ในไฟล์ compose ด้วย
docker-compose down -v

echo "✅ All local services have been stopped and cleaned up."