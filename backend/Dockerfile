FROM node:20-alpine AS builder
WORKDIR /app
RUN npm config set fetch-timeout 600000 && npm config set fetch-retries 5
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build && npm prune --production

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN mkdir -p /app/storage && chmod +x ./docker-entrypoint.sh
EXPOSE 3000
CMD ["./docker-entrypoint.sh"]
