FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies (including dev deps for Prisma generation)
RUN pnpm install --frozen-lockfile

# Copy Prisma schema and generate client
COPY prisma/schema.prisma ./prisma/
RUN pnpm prisma generate

# Copy pre-built application from CI
COPY .next ./.next
COPY public ./public

# Install production dependencies only (clean up dev deps)
RUN pnpm install --prod --frozen-lockfile

# Expose port
EXPOSE 8080

# Start the application
CMD ["pnpm", "start"]