# Actions Orchestrator Lambda Dockerfile
FROM public.ecr.aws/lambda/nodejs:20 AS builder

WORKDIR /build

# Install build dependencies
RUN dnf install -y make gcc g++ python3

# Copy package files
COPY package.json package-lock.json ./
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/server/shared/package.json ./packages/server/shared/
COPY packages/server/orchestrators/actions-orchestrator/package.json ./packages/server/orchestrators/actions-orchestrator/

# Install dependencies
RUN npm ci

# Copy source files
COPY packages/schemas ./packages/schemas/
COPY packages/server/shared ./packages/server/shared/
COPY packages/server/orchestrators/actions-orchestrator ./packages/server/orchestrators/actions-orchestrator/

# Build all packages
RUN yarn run build --workspace=@grounded/schemas && \
    yarn run build --workspace=@grounded/server-shared && \
    yarn run build --workspace=actions-orchestrator

# Production image
FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}

# Copy built artifacts
COPY --from=builder /build/packages/server/orchestrators/actions-orchestrator/dist ./
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/packages/schemas/dist ./node_modules/@grounded/schemas/dist
COPY --from=builder /build/packages/server/shared/dist ./node_modules/@grounded/server-shared/dist

CMD ["handler.handler"]
