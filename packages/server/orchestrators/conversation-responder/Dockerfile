# Conversation Responder Lambda Dockerfile
FROM public.ecr.aws/lambda/nodejs:20 AS builder

WORKDIR /build

# Install build dependencies
RUN dnf install -y make gcc g++ python3

# Copy package files
COPY package.json package-lock.json ./
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/server/shared/package.json ./packages/server/shared/
COPY packages/server/orchestrators/conversation-responder/package.json ./packages/server/orchestrators/conversation-responder/

# Install dependencies
RUN npm ci

# Copy source files
COPY packages/schemas ./packages/schemas/
COPY packages/server/shared ./packages/server/shared/
COPY packages/server/orchestrators/conversation-responder ./packages/server/orchestrators/conversation-responder/

# Build all packages
RUN npm run build --workspace=@grounded/schemas && \
    npm run build --workspace=@grounded/server-shared && \
    npm run build --workspace=conversations-responder || true

# Production image
FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}

# Copy built artifacts
COPY --from=builder /build/packages/server/orchestrators/conversation-responder/dist ./
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/packages/schemas/dist ./node_modules/@grounded/schemas/dist
COPY --from=builder /build/packages/server/shared/dist ./node_modules/@grounded/server-shared/dist

CMD ["handler.handler"]
