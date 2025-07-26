# 📝 TicketFlow Logging Guide

This guide explains how to configure and use the enhanced logging system in TicketFlow.

## 🚀 Quick Start

### Basic Logging Levels

```bash
# Default logging (INFO level)
npm run dev:server

# Debug logging (more detailed)
npm run dev:debug

# Trace logging (most detailed)
npm run dev:trace

# File logging (saves to server/logs/ticketflow.log)
npm run dev:file

# Performance logging
npm run dev:performance
```

## 📊 Log Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| **ERROR** | Critical errors that break functionality | Production monitoring |
| **WARN** | Potential issues that don't break functionality | Development debugging |
| **INFO** | General application flow | Default level |
| **DEBUG** | Detailed debugging information | Development debugging |
| **TRACE** | Most detailed logging | Deep debugging |

## 🔧 Environment Variables

### Log Level Control
```bash
# Set log level
export LOG_LEVEL=DEBUG
npm run dev:server

# Available levels: ERROR, WARN, INFO, DEBUG, TRACE
```

### File Logging
```bash
# Enable file logging
export LOG_FILE=true
npm run dev:server

# Logs will be saved to server/logs/ticketflow.log
```

### Response Logging
```bash
# Log all HTTP responses with timing
export LOG_RESPONSE=true
npm run dev:server
```

### Performance Logging
```bash
# Log performance metrics
export LOG_PERFORMANCE=true
npm run dev:server
```

## 📋 Available NPM Scripts

### Development Scripts
```bash
# Standard development
npm run dev                    # Both frontend and backend
npm run dev:server            # Backend only (INFO level)
npm run dev:client            # Frontend only

# Enhanced logging
npm run dev:debug             # DEBUG level logging
npm run dev:trace             # TRACE level logging
npm run dev:file              # DEBUG + file logging
npm run dev:performance       # INFO + performance logging

# Node.js compatibility
npm run dev:server-compatible # Node.js v18 compatible
```

## 🔍 What Gets Logged

### Request Logging
- HTTP method and path
- Request headers (filtered in TRACE mode)
- Request body (if present)
- Client IP address
- Query parameters

### Response Logging
- HTTP status code
- Response time
- Response size
- Error details

### Database Logging
- SQL operations
- Migration status
- Database verification results

### Performance Logging
- Operation duration
- Memory usage
- Database query times

### Error Logging
- Full stack traces
- Error context
- Request details when errors occur

## 📁 Log File Structure

When file logging is enabled, logs are saved to:
```
server/logs/ticketflow.log
```

### Log Format
```
[2025-01-27T10:30:45.123Z] [INFO] 🚀 GET /rest/ticket
{
  "method": "GET",
  "path": "/rest/ticket",
  "query": {},
  "headers": {
    "user-agent": "Mozilla/5.0..."
  },
  "ip": "127.0.0.1"
}
```

## 🛠️ Advanced Configuration

### Custom Logger Configuration
```javascript
import { Logger } from './server/logger.js';

const customLogger = new Logger({
  level: 'DEBUG',
  enableFile: true,
  logFile: '/path/to/custom.log',
  enableRequestLogging: true,
  enableResponseLogging: true,
  enableDatabaseLogging: true,
  enablePerformanceLogging: true
});
```

### Logging in Your Code
```javascript
import { logger } from './server/logger.js';

// Basic logging
logger.info('User logged in', { userId: 123, timestamp: new Date() });

// Error logging with context
logger.logError(error, { 
  endpoint: '/api/users', 
  userId: 123,
  requestId: 'req-456' 
});

// Performance logging
const startTime = Date.now();
// ... your operation ...
logger.logPerformance('database_query', Date.now() - startTime, {
  query: 'SELECT * FROM users',
  resultCount: 50
});

// Database operation logging
logger.logDatabaseOperation('SELECT', {
  table: 'tickets',
  conditions: { status: 'open' },
  resultCount: 25
});
```

## 🔍 Debugging Examples

### Debug API Issues
```bash
# Run with DEBUG level
npm run dev:debug

# Check logs for:
# - Request/response details
# - Database operations
# - Error stack traces
```

### Performance Analysis
```bash
# Run with performance logging
npm run dev:performance

# Look for:
# - Slow database queries
# - Long response times
# - Memory usage patterns
```

### Deep Debugging
```bash
# Run with TRACE level
npm run dev:trace

# Includes:
# - Full request headers
# - Detailed database queries
# - All middleware operations
```

## 📊 Log Analysis

### Common Log Patterns

#### Successful Request
```
[INFO] 🚀 GET /rest/ticket
[INFO] ✅ GET /rest/ticket - Returning 6 tickets
```

#### Error Request
```
[INFO] 🚀 POST /rest/ticket
[ERROR] ❌ Error: NOT NULL constraint failed: tickets.issue_title
{
  "stack": "SqliteError: NOT NULL constraint failed...",
  "endpoint": "/rest/ticket",
  "method": "POST"
}
```

#### Performance Issue
```
[INFO] ⏱️ Performance: database_query took 150ms
{
  "operation": "database_query",
  "duration": "150ms",
  "query": "SELECT * FROM tickets WHERE status = 'open'"
}
```

## 🚨 Troubleshooting

### Log File Not Created
```bash
# Check directory permissions
ls -la server/logs/

# Create directory manually if needed
mkdir -p server/logs/
```

### Too Much Logging
```bash
# Reduce log level
export LOG_LEVEL=WARN
npm run dev:server
```

### Missing Performance Data
```bash
# Enable performance logging
export LOG_PERFORMANCE=true
npm run dev:server
```

## 📈 Production Logging

### Recommended Production Settings
```bash
# Production environment variables
export LOG_LEVEL=WARN
export LOG_FILE=true
export LOG_RESPONSE=false
export LOG_PERFORMANCE=true
```

### Log Rotation
Consider using log rotation tools like `logrotate` for production:

```bash
# Example logrotate configuration
/path/to/ticketflow/server/logs/ticketflow.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
```

## 🎯 Best Practices

1. **Use appropriate log levels**
   - ERROR: Only for actual errors
   - WARN: For potential issues
   - INFO: For general flow
   - DEBUG: For development debugging
   - TRACE: For deep debugging

2. **Include context in logs**
   ```javascript
   logger.info('User action', {
     userId: user.id,
     action: 'login',
     timestamp: new Date()
   });
   ```

3. **Don't log sensitive data**
   - Avoid logging passwords, tokens, or personal data
   - Use placeholder values for sensitive fields

4. **Monitor log file size**
   - Implement log rotation in production
   - Monitor disk space usage

5. **Use structured logging**
   - Include relevant context with each log
   - Use consistent field names

## 🔧 Integration with Monitoring

The logging system can be easily integrated with monitoring tools:

- **ELK Stack**: Parse JSON logs
- **Splunk**: Use structured logging
- **CloudWatch**: Monitor log files
- **Prometheus**: Extract metrics from logs

## 📚 Additional Resources

- [Node.js Logging Best Practices](https://nodejs.org/en/docs/guides/logging/)
- [Winston Logger](https://github.com/winstonjs/winston) (Alternative logging library)
- [Pino Logger](https://github.com/pinojs/pino) (High-performance logging) 