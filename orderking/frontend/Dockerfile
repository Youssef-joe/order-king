# frontend/Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.output ./.output
EXPOSE 3000
ENV HOST=0.0.0.0 PORT=3000
CMD ["node", ".output/server/index.mjs"]
