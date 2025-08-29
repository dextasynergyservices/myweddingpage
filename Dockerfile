FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm first (cached layer)
RUN npm install -g pnpm

# Copy only package files first (better caching)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (cached if package.json doesn't change)
RUN pnpm install --frozen-lockfile

# Copy Prisma schema (cached if schema doesn't change)
COPY prisma/schema.prisma ./prisma/

# Generate Prisma client
RUN pnpm prisma generate

# Copy rest of the source code
COPY . .

# Build Next.js app
RUN pnpm build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV production
ENV PORT 8080

# Install only pnpm (small layer)
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 8080

# Start the application
CMD ["pnpm", "start"]