# Multi-stage Dockerfile for Ticketing Application
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development

# Install all dependencies including dev dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose ports for development
EXPOSE 3001 5173

# Set environment variables for development
ENV NODE_ENV=development
ENV PORT=3001
ENV VITE_WEBHOOK_ENABLED=false
ENV VITE_WEBHOOK_URL=https://api.genesys.com/webhook/tickets

# Health check for development
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/echo || exit 1

# Start development server
CMD ["npm", "run", "dev"]

# Production build stage
FROM base AS build

# Install all dependencies including dev dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install Node.js for the API server
RUN apk add --no-cache nodejs npm

# Copy built application to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy server files
COPY --from=build /app/server /app/server
COPY --from=build /app/package*.json /app/

# Install production dependencies for server
WORKDIR /app
RUN npm ci --only=production

# Expose ports
EXPOSE 80 3001

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=3001
ENV VITE_WEBHOOK_ENABLED=false
ENV VITE_WEBHOOK_URL=https://api.genesys.com/webhook/tickets

# Health check for production
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/echo || exit 1

# Start production server
CMD ["sh", "-c", "node server/server.js & nginx -g 'daemon off;'"] 