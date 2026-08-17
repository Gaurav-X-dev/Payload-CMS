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

# The runtime user is created BEFORE anything is copied so every COPY below can assign ownership
# directly. Previously the copies ran first and landed as root:root, and only /app/media was
# chowned afterwards — which left /app/.next owned by root with mode 755. Next.js then could not
# create its cache directory at runtime and every response logged:
#   Failed to update prerender cache — Error: EACCES: permission denied, mkdir '/app/.next/cache'
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/media ./media

# `.next/cache` is created by Next.js on first write, not by the build, so it does not exist in
# any of the copies above — it has to be pre-created with the right owner. `.next` and
# `.next/server` come from the standalone copy and are re-asserted here so a future COPY that
# forgets --chown cannot silently reintroduce the EACCES failure.
RUN mkdir -p /app/.next/cache \
  && chown -R nextjs:nodejs /app/.next /app/media

# Build-time assertion: fail the image build rather than ship one that cannot write its cache.
# Runs as the real runtime user against the real path Next.js uses.
USER nextjs
RUN test -w /app/.next \
  && test -w /app/.next/cache \
  && test -w /app/media \
  && node -e "const fs=require('node:fs');const p='/app/.next/cache/.write-probe';fs.mkdirSync('/app/.next/cache',{recursive:true});fs.writeFileSync(p,'ok');fs.unlinkSync(p);console.log('cache dir is writable by', process.getuid())"

EXPOSE 3000

CMD ["node", "server.js"]
