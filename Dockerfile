# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# ❗️ เพิ่มส่วนนี้เข้ามา เพื่อให้ prisma generate ทำงานได้
# เราจะส่งค่า dummy เข้ามาตอน build
ARG DATABASE_URL="postgresql://user:password@host:port/db?schema=public"
ENV DATABASE_URL=$DATABASE_URL

# Copy package files
COPY package*.json ./

# ติดตั้ง dependencies ทั้งหมด
RUN npm ci

# Copy โค้ดทั้งหมด
COPY . .

# ให้สิทธิ์รัน entrypoint.sh ได้
RUN chmod +x ./automations/Docker/entrypoint.sh

# Generate Prisma client
# คำสั่งนี้จะใช้ DATABASE_URL ที่เราตั้งไว้ข้างบน
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app

# Production environment
ENV NODE_ENV=production

# Copy built app จาก build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json

# Copy prisma schema และ entrypoint script เข้ามาด้วย
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/automations/Docker/entrypoint.sh .

# ติดตั้งเฉพาะ production dependencies
RUN npm ci --omit=dev --frozen-lockfile

# Expose port
EXPOSE 3000

# ENTRYPOINT จะทำงานก่อนเสมอ
# มันจะรัน entrypoint.sh ของเรา
ENTRYPOINT ["./entrypoint.sh"]

# CMD จะกลายเป็นคำสั่งที่ถูกส่งต่อให้ entrypoint.sh (ตัว "$@" ใน script)
# เพื่อให้ทำงานหลังจาก migrate เสร็จ
CMD ["npm", "run", "start"]