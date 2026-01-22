# Customer Spend Agent Lambda Dockerfile
FROM public.ecr.aws/lambda/nodejs:20 AS builder

WORKDIR /build

# Install build dependencies
RUN dnf install -y make gcc g++ python3

# Copy package files
COPY package.json package-lock.json ./
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/server/shared/package.json ./packages/server/shared/
COPY packages/server/evaluators/shared/package.json ./packages/server/evaluators/shared/
COPY packages/server/evaluators/customer-spend-agent/package.json ./packages/server/evaluators/customer-spend-agent/

# Install dependencies
RUN npm ci

# Copy source files
COPY packages/schemas ./packages/schemas/
COPY packages/server/shared ./packages/server/shared/
COPY packages/server/evaluators/shared ./packages/server/evaluators/shared/
COPY packages/server/evaluators/customer-spend-agent ./packages/server/evaluators/customer-spend-agent/

# Build all packages
RUN npm run build --workspace=@grounded/schemas && \
    npm run build --workspace=@grounded/server-shared && \
    npm run build --workspace=@grounded/agents-shared && \
    npm run build --workspace=customer-spend-agent

# Production image
FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}

# Copy built artifacts
COPY --from=builder /build/packages/server/evaluators/customer-spend-agent/dist ./
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/packages/schemas/dist ./node_modules/@grounded/schemas/dist
COPY --from=builder /build/packages/server/shared/dist ./node_modules/@grounded/server-shared/dist
COPY --from=builder /build/packages/server/evaluators/shared/dist ./node_modules/@grounded/agents-shared/dist

CMD ["handler.handler"]
