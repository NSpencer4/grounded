# ===================================
# Stage 1: Build
# ===================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files and workspace configuration
COPY package*.json ./
COPY lerna.json ./
COPY tsconfig.base.json ./

# Copy all packages (monorepo structure)
COPY packages/ ./packages/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Build the organization-api
WORKDIR /app/packages/server/apis/organization-api
RUN npm run build

# ===================================
# Stage 2: Production
# ===================================
FROM node:20-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copy root package files
COPY --chown=nestjs:nodejs package*.json ./
COPY --chown=nestjs:nodejs lerna.json ./
COPY --chown=nestjs:nodejs tsconfig.base.json ./

# Copy node_modules from builder (includes all workspace dependencies)
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy built application from builder
COPY --from=builder --chown=nestjs:nodejs /app/packages/server/apis/organization-api/dist ./packages/server/apis/organization-api/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/server/apis/organization-api/package.json ./packages/server/apis/organization-api/

# Copy shared packages (if any dependencies exist)
COPY --from=builder --chown=nestjs:nodejs /app/packages/server/shared ./packages/server/shared
COPY --from=builder --chown=nestjs:nodejs /app/packages/schemas ./packages/schemas

# Switch to non-root user
USER nestjs

# Set working directory to the app
WORKDIR /app/packages/server/apis/organization-api

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]
