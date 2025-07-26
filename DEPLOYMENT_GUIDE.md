# 🚀 Deployment Guide for Remote Server

This guide helps you deploy TicketFlow to a remote server and fix the localhost connection issue.

## 🔧 The Problem

When you deploy the application to a remote server, the frontend tries to connect to `localhost:3001` instead of the remote server's IP address. This happens because the API base URL is hardcoded in some places.

## ✅ The Solution

We've updated the code to use environment variables properly. Here's how to deploy:

### **Step 1: Build the Application**

```bash
# Build the production version
npm run build
```

This creates a `dist/` folder with static files.

### **Step 2: Set Environment Variables**

**Important**: Environment variables must be set at build time, not runtime for Vite applications.

#### **Option A: Set Environment Variables Before Building**
```bash
# Set environment variables before building
export VITE_API_BASE_URL=http://YOUR_SERVER_IP:3001/rest
export VITE_API_KEY=68544b73bb5cccc333f6d956
export VITE_CORS_API_KEY=68544b73bb5cccc333f6d956
export VITE_WEBHOOK_ENABLED=true
export VITE_WEBHOOK_URL=https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/407ea6a6f17305dad5ca10c33dbd2da5433dcdfe9c7e096dc9de0bf541c5a51c501d839441a7e9f1fe42f8add4ed6c84/events
export VITE_WEBHOOK_TIMEOUT=5000
export PORT=3001

# Then build
npm run build
```

#### **Option B: Create .env File Before Building**
```bash
cat > .env << EOF
VITE_API_BASE_URL=http://YOUR_SERVER_IP:3001/rest
VITE_API_KEY=68544b73bb5cccc333f6d956
VITE_CORS_API_KEY=68544b73bb5cccc333f6d956
VITE_WEBHOOK_ENABLED=true
VITE_WEBHOOK_URL=https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/407ea6a6f17305dad5ca10c33dbd2da5433dcdfe9c7e096dc9de0bf541c5a51c501d839441a7e9f1fe42f8add4ed6c84/events
VITE_WEBHOOK_TIMEOUT=5000
PORT=3001
EOF

# Then build
npm run build
```

**Replace `YOUR_SERVER_IP` with your actual server IP address.**

**Note**: The frontend now uses relative URLs (`/rest`) as fallback instead of hardcoded localhost, making it more flexible for different deployment environments.

### **Step 3: Start the Backend Server**

```bash
# For Node.js 20+
npm run server

# For Node.js 18 (Amazon Linux)
npm run server-compatible
```

### **Step 4: Serve the Frontend**

#### **Option A: Using a Static File Server**

```bash
# Install serve globally
npm install -g serve

# Serve the dist folder
serve -s dist -l 80
```

#### **Option B: Using nginx**

```bash
# Install nginx
sudo apt-get update
sudo apt-get install nginx

# Copy dist files to nginx directory
sudo cp -r dist/* /var/www/html/

# Configure nginx (create /etc/nginx/sites-available/ticketflow)
sudo nano /etc/nginx/sites-available/ticketflow
```

Add this nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /rest/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy Swagger docs
    location /api-docs/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/ticketflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### **Option C: Using Docker**

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### **Step 5: Verify Deployment**

1. **Check Backend**: `curl http://YOUR_SERVER_IP:3001/rest/ticket`
2. **Check Frontend**: Open `http://YOUR_SERVER_IP` in browser
3. **Check Swagger**: `http://YOUR_SERVER_IP:3001/api-docs`

## 🔍 Troubleshooting

### **Still Getting localhost Error?**

1. **Clear Browser Cache**: Hard refresh (Ctrl+F5)
2. **Check Environment Variables**: Verify `.env` file exists and has correct values
3. **Check Server Logs**: Look for configuration loading messages
4. **Verify Build**: Make sure you're serving the latest build

### **CORS Errors?**

The server is configured to allow all origins in development. For production, update the CORS configuration in `server/server.js`:

```javascript
// Update CORS origins for production
origin: ['https://your-domain.com', 'http://your-domain.com']
```

### **Port Issues?**

- **Backend**: Make sure port 3001 is open in firewall
- **Frontend**: Make sure port 80 (or your chosen port) is open

## 📋 Quick Deployment Script

```bash
#!/bin/bash
# Quick deployment script

# Set environment variables
export VITE_API_BASE_URL=http://$(curl -s ifconfig.me):3001/rest
export VITE_API_KEY=68544b73bb5cccc333f6d956
export VITE_CORS_API_KEY=68544b73bb5cccc333f6d956
export VITE_WEBHOOK_ENABLED=true
export VITE_WEBHOOK_URL=https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/407ea6a6f17305dad5ca10c33dbd2da5433dcdfe9c7e096dc9de0bf541c5a51c501d839441a7e9f1fe42f8add4ed6c84/events
export VITE_WEBHOOK_TIMEOUT=5000
export PORT=3001

# Build the application
npm run build

# Start backend
npm run server &

# Serve frontend
npx serve -s dist -l 80
```

## 🎯 Success Indicators

- ✅ Frontend loads without localhost errors
- ✅ API calls work (tickets load in table)
- ✅ Swagger docs accessible
- ✅ CORS requests succeed
- ✅ Webhook notifications work (if enabled)

## 🔄 Updates

After making code changes:

1. Rebuild: `npm run build`
2. Restart backend: `pkill -f "node server" && npm run server`
3. Refresh frontend (or restart static server)

---

**Need help?** Check the server logs for configuration messages and error details. 