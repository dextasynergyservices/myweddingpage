FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first (for better Docker layer caching)
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy ALL source code (including src/, prisma/, config files, etc.)
COPY . .

# Generate Prisma client and build the app
# (Environment variables will be available from Elastic Beanstalk)
RUN pnpm prisma generate
RUN pnpm build

# Expose port
EXPOSE 8080

# Start the application
CMD ["pnpm", "start"]