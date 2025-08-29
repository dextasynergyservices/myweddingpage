FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy pre-built application from CI
COPY .next ./.next
COPY public ./public
COPY node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 8080

# Start the application
CMD ["pnpm", "start"]