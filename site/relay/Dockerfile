# Sudaverse contact relay. Small image, no build step, runs as a non-root user.
FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

# Production dependencies only (nodemailer). The lockfile makes the install reproducible.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY server.mjs ./
COPY lib ./lib

# The official node image ships an unprivileged "node" user.
USER node

EXPOSE 8787

# node is already in the image, so no curl or wget is needed.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8787)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.mjs"]
