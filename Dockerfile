# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# ติดตั้ง dependencies ทั้งหมด
RUN npm ci

# Copy โค้ดทั้งหมด
COPY . .

# Generate Prisma client
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

# ติดตั้งเฉพาะ production dependencies
RUN npm ci --omit=dev --frozen-lockfile

# Expose port
EXPOSE 3000

# Start Next.js
CMD ["npm", "run", "start"]
