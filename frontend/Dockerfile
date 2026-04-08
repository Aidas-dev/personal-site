# Multi-stage Dockerfile for TanStack Start Frontend (SSR)

# Stage 1: Builder
FROM node:24-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package.json
COPY package.json ./

# Install all dependencies
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else pnpm install; fi

# Copy source code
COPY . .

# Build the TanStack Start application
RUN pnpm run build

# Stage 2: Production
FROM node:24-alpine AS production

WORKDIR /app

# Install curl for healthchecks
RUN apk add --no-cache curl

# Copy package.json and install production dependencies
COPY package.json ./
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    if [ -f pnpm-lock.yaml ]; then pnpm install --prod --frozen-lockfile; else pnpm install --prod; fi

# Copy built application
COPY --from=builder /app/dist /app/dist

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Expose port
EXPOSE 3000

# Start the TanStack Start SSR server
CMD ["pnpm", "start"]
