FROM node:20-slim

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY lerna.json ./
COPY tsconfig.base.json ./

# Copy all packages for workspace dependency resolution
COPY packages/ ./packages/

# Install dependencies
RUN npm ci

# Set working directory to gateway-api
WORKDIR /app/packages/server/apis/gateway-api

# Expose default wrangler port
EXPOSE 8787

# Run wrangler dev binding to all interfaces
CMD ["npx", "wrangler", "dev", "--ip", "0.0.0.0", "--port", "8787"]
