# Organization API Lambda Dockerfile
FROM public.ecr.aws/lambda/nodejs:20 AS builder

WORKDIR /build

# Install build dependencies
RUN dnf install -y make gcc g++ python3

# Copy package files
COPY package.json package-lock.json ./
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/server/shared/package.json ./packages/server/shared/
COPY packages/server/apis/organization-api/package.json ./packages/server/apis/organization-api/

# Install dependencies
RUN npm ci

# Copy source files
COPY packages/schemas ./packages/schemas/
COPY packages/server/shared ./packages/server/shared/
COPY packages/server/apis/organization-api ./packages/server/apis/organization-api/

# Build packages
RUN npm run build --workspace=@grounded/schemas && \
    npm run build --workspace=@grounded/server-shared && \
    npm run build --workspace=@grounded/organization-api

# Production image
FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}

# Copy built artifacts (esbuild bundles everything into dist)
COPY --from=builder /build/packages/server/apis/organization-api/dist ./
COPY --from=builder /build/node_modules ./node_modules

CMD ["index.handler"]
