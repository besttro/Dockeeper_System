#!/bin/bash
echo "🚀 Starting application and database..."
set -e

# --- START: ส่วนที่เพิ่มเข้ามา ---
# สร้างตัวแปร فاضي (empty) เพื่อเก็บคำสั่งที่จะใช้
COMPOSE_CMD=""

# 1. ตรวจสอบหา 'docker compose' (V2, เว้นวรรค) ซึ่งเป็นเวอร์ชันใหม่ก่อน
# เราใช้ 'docker compose version' เป็นวิธีที่แน่นอนในการเช็คว่าคำสั่งนี้ใช้ได้หรือไม่
if docker compose version &> /dev/null; then
    echo "✅ Found modern 'docker compose' (V2)."
    COMPOSE_CMD="docker compose"
# 2. ถ้าไม่เจอเวอร์ชันใหม่ ให้ลองหา 'docker-compose' (V1, ขีดกลาง) แบบเก่า
elif command -v docker-compose &> /dev/null; then
    echo "✅ Found legacy 'docker-compose' (V1)."
    COMPOSE_CMD="docker-compose"
fi

# 3. ถ้าไม่เจอทั้งสองอย่าง ให้แจ้ง Error แล้วจบการทำงาน
if [ -z "$COMPOSE_CMD" ]; then
    echo
    echo "❌ Error: Could not find 'docker compose' or 'docker-compose'."
    echo "   Please ensure Docker Desktop is installed and running correctly."
    echo "   On WSL 2, make sure the WSL integration is enabled in Docker Desktop settings."
    exit 1
fi
# --- END: สิ้นสุดส่วนที่เพิ่มเข้ามา ---

# ใช้ตัวแปร $COMPOSE_CMD ที่เราหาเจอ เพื่อรัน containers
# -d (detached) หมายถึงให้ run containers ใน background
$COMPOSE_CMD up -d

echo "✅ Services are starting in the background."
# อัปเดตคำแนะนำให้ใช้คำสั่งที่ถูกต้องด้วย
echo "   - To see application logs, run: $COMPOSE_CMD logs -f app"
echo "   - To see database logs, run: $COMPOSE_CMD logs -f db"
echo "🌐 Your application should be available at http://localhost:3000 shortly."