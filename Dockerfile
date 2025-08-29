FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client (use build args for database URL)
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN pnpm prisma generate

# Build Next.js app (use build args)
ARG NEXT_PUBLIC_APP_URL
ARG RESEND_API_KEY
ARG EMAIL_FROM
ARG NODE_ENV=production

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV RESEND_API_KEY=$RESEND_API_KEY
ENV EMAIL_FROM=$EMAIL_FROM
ENV NODE_ENV=$NODE_ENV

RUN pnpm build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV production
ENV PORT 8080

# Install pnpm
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