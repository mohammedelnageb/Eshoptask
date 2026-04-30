# Build stage
FROM node:18-alpine AS builder

WORKDIR /build

COPY package*.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

COPY . .

RUN npm run build

# Production stage
FROM nginx:1.25-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /build/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
