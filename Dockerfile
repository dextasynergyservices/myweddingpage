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

# Copy pre-built application from CI (already built with DATABASE_URL)
COPY .next ./.next
COPY public ./public
COPY src ./src

# Don't clean up dev dependencies - the built app might need them!
# Just use the existing node_modules

# Expose port
EXPOSE 8080

# Start the application
CMD ["pnpm", "start"]