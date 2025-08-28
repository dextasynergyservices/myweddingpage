# Use Node.js 20
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install deps
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Generate Prisma client (important!)
RUN pnpm prisma generate

# Build Next.js app
RUN pnpm build

# ----------- Production Stage ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 8080

# Install pnpm
RUN npm install -g pnpm

# Copy necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Prisma client is already generated, but keep schema for migrations
# (Optional, if you’ll run migrations in EB)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Start the app
EXPOSE 8080
CMD ["pnpm", "start"]
