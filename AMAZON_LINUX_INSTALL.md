# Amazon Linux Installation Guide

This guide helps you install and run TicketFlow on Amazon Linux with Node.js v18.

## 🔧 Prerequisites

- Amazon Linux 2 or 2023
- Node.js v18.20.8 (or later v18.x)
- npm v10.8.2 (or later)

## 📦 Installation Steps

### 1. Check Node.js Version
```bash
node --version
npm --version
```

If you see Node.js v18.x, you're good to go!

### 2. Install Dependencies
```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd ticketflow

# Install dependencies
npm install
```

**Note**: You'll see warnings about `better-sqlite3` requiring Node.js 20+, but this is expected and won't affect functionality.

### 3. Run the Compatible Version

#### Option A: Server Only
```bash
npm run dev:server-compatible
```

#### Option B: Full Application
```bash
# Terminal 1: Start the compatible backend
npm run dev:server-compatible

# Terminal 2: Start the frontend
npm run dev:client
```

#### Option C: Using Concurrently (if available)
```bash
# Create a custom script in package.json
npm run dev:server-compatible & npm run dev:client
```

## 🌐 Access the Application

Once running, access the application at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/rest
- **Swagger Documentation**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health

## 🔍 Troubleshooting

### Error: "better-sqlite3 requires Node.js 20+"
**Solution**: This is expected. The compatible version uses `sqlite3` instead and will work fine.

### Error: "Port already in use"
**Solution**: 
```bash
# Find and kill processes using the ports
sudo lsof -ti:3001 | xargs kill -9
sudo lsof -ti:5173 | xargs kill -9
```

### Error: "Permission denied"
**Solution**: 
```bash
# Make sure you have proper permissions
sudo chown -R $USER:$USER .
```

### Error: "Database file not found"
**Solution**: The database will be created automatically on first run. Make sure the `server/` directory is writable.

## 📊 Features Available

The compatible version includes all the same features as the main version:
- ✅ Complete CRUD operations
- ✅ Auto-title generation
- ✅ Auto-status generation (defaults to "Open")
- ✅ SQLite database persistence
- ✅ Data migration from JSON
- ✅ Swagger documentation
- ✅ CORS support
- ✅ Agent notes field
- ✅ Real-time status updates

## 🔄 Migration from JSON

The application will automatically migrate your existing `db.json` data to SQLite on first startup. A backup will be created as `db.json.backup`.

## 🚀 Production Deployment

For production deployment on Amazon Linux:

1. **Use PM2 for process management**:
```bash
npm install -g pm2
pm2 start server/server-compatible.js --name ticketflow
pm2 startup
pm2 save
```

2. **Use nginx as reverse proxy**:
```bash
sudo yum install nginx
# Configure nginx to proxy to localhost:3001
```

3. **Set up SSL with Let's Encrypt**:
```bash
sudo yum install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 📝 Environment Variables

You can customize the application with environment variables:

```bash
export PORT=3001
export NODE_ENV=production
npm run server-compatible
```

## 🆘 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify Node.js version is v18.x
3. Ensure all dependencies are installed
4. Check file permissions in the project directory

The compatible version provides the same functionality as the main version, just with slightly different performance characteristics due to using `sqlite3` instead of `better-sqlite3`. 