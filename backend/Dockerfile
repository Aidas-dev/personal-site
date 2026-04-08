# Multi-stage Dockerfile for Medusa v2 Backend + Admin
# Stage 1: Builder
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files for Docker layer caching
COPY package.json package-lock.json* ./

# Install dependencies — uses lock file for deterministic, fast installs
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; else npm install --legacy-peer-deps; fi

# Copy source code
COPY . .

# Build the Medusa application (includes admin panel)
RUN npm run build

# Stage 2: Production
FROM node:24-alpine AS production

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/.medusa ./.medusa

# Copy package.json and lock file from builder, install production deps
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Set production environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:9000/health || exit 1

# Expose port
EXPOSE 9000

# Start Medusa server
WORKDIR /app/.medusa/server
CMD ["npm", "run", "start"]
