# Multi-stage Dockerfile for Ticketing Application
FROM node:20-slim AS base

# Install Python and build tools for native module compilation
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set Python path for node-gyp
ENV PYTHON=/usr/bin/python3

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
ENV VITE_HOST=0.0.0.0
ENV VITE_PORT=5173

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

# Install Node.js and Python for the API server
RUN apk add --no-cache nodejs npm python3 make g++

# Set Python path for node-gyp
ENV PYTHON=/usr/bin/python3

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
ENV VITE_API_BASE_URL=/rest

# Health check for production
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/echo || exit 1

# Start production server
CMD ["sh", "-c", "node server/server.js & nginx -g 'daemon off;'"] 