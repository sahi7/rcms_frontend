# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Pass production environment variables at build time (VITE_ prefix only)
ARG VITE_SEEWEED_PUBLIC_URL
ARG VITE_API_BASE_URL
ARG VITE_UPSTREAM_SERVER
ARG VITE_SPACE_SERVER

ENV VITE_SEEWEED_PUBLIC_URL=${VITE_SEEWEED_PUBLIC_URL}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_UPSTREAM_SERVER=${VITE_UPSTREAM_SERVER}
ENV VITE_SPACE_SERVER=${VITE_SPACE_SERVER}

# Production build (minifies, tree-shakes, removes dev-only code)
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built static assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: copy custom nginx config for security headers + SPA routing
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G nginx -g nginx nginx
USER nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]