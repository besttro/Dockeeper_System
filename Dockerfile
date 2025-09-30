# === STAGE 1: BASE ===
# Stage นี้จะติดตั้ง dependencies ทั้งหมดที่จำเป็นสำหรับทั้ง dev และ prod
FROM node:20-alpine AS base
WORKDIR /app

# Copy package files
COPY package*.json ./
# ติดตั้ง dependencies ทั้งหมด (รวม devDependencies)
RUN npm ci


# === STAGE 2: DEVELOPMENT ===
# Stage นี้จะถูกใช้สำหรับ Local Development เท่านั้น (โดย docker-compose)
FROM base AS development
WORKDIR /app
COPY . .
# คำสั่งเริ่มต้นสำหรับ development (เปิด Hot-Reloading)
CMD ["npm", "run", "dev"]


# === STAGE 3: PRODUCTION BUILD ===
# Stage นี้จะทำหน้าที่ Build แอปพลิเคชันสำหรับ Production
FROM base AS production_build
WORKDIR /app

# เราจะส่งค่า dummy เข้ามาตอน build
ARG DATABASE_URL="postgresql://user:password@host:port/db?schema=public"
ENV DATABASE_URL=$DATABASE_URL

# Copy โค้ดที่เหลือทั้งหมด
COPY . .

# ให้สิทธิ์รัน entrypoint.sh ได้
RUN chmod +x ./automations/Docker/entrypoint.sh

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build


# === STAGE 4: FINAL PRODUCTION IMAGE ===
# เราจะสร้าง Image สุดท้ายที่เล็กที่สุดและปลอดภัยที่สุดจาก alpine
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Copy เฉพาะสิ่งที่จำเป็นจาก production_build stage
# --chown=node:node จะเปลี่ยนเจ้าของไฟล์เป็น user 'node' ที่เราเพิ่งสร้าง
COPY --from=production_build --chown=node:node /app/node_modules ./node_modules
COPY --from=production_build --chown=node:node /app/.next ./.next
COPY --from=production_build --chown=node:node /app/public ./public
COPY --from=production_build --chown=node:node /app/package.json ./package.json
COPY --from=production_build --chown=node:node /app/prisma ./prisma
# COPY --from=production_build --chown=node:node /app/automations/Docker/entrypoint.sh .

# ลบ devDependencies ที่ไม่จำเป็นสำหรับ production
# วิธีนี้เร็วกว่าการรัน `npm ci --omit=dev` ใหม่ทั้งหมด
RUN npm prune --production

# เปลี่ยนไปใช้ user 'node'
USER node

EXPOSE 3000

# เพิ่ม Healthcheck เพื่อให้ ECS ตรวจสอบได้ว่าแอปพร้อมทำงานจริงๆ หรือไม่
# มันจะลองเรียกไปที่ http://localhost:3000 ทุกๆ 30 วินาที
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -q -O- http://localhost:3000 || exit 1

# ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "start"]