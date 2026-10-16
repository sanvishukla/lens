# Build from the repo root: docker build -f apps/worker/Dockerfile .
FROM node:24-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    PORT=7860

COPY package.json ./
COPY apps/web/package.json apps/web/
COPY apps/worker/package.json apps/worker/
COPY packages/core/package.json packages/core/

RUN npm install --workspace @lens/worker --omit=dev \
 && npx playwright install --with-deps chromium

COPY packages/core packages/core
COPY apps/worker apps/worker

# Hugging Face Spaces runs containers as uid 1000, which is `node` in this image.
USER node
EXPOSE 7860
CMD ["node", "apps/worker/src/index.ts"]
