# 1. Base Stage
FROM node:20-alpine AS base
WORKDIR /app
# Install dependencies needed for node-gyp
RUN apk add --no-cache python3 make g++ 

# 2. Dependencies Stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 3. Builder Stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# We disable telemetry and set env to production for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN npm run build

# 4. Runner Stage
FROM base AS runner
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000

# Copy necessary files
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
