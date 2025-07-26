import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// Default configuration
const DEFAULT_CONFIG = {
  level: process.env.LOG_LEVEL || 'INFO',
  enableConsole: true,
  enableFile: process.env.LOG_FILE === 'true',
  logFile: join(__dirname, 'logs', 'ticketflow.log'),
  enableRequestLogging: true,
  enableResponseLogging: process.env.LOG_RESPONSE === 'true',
  enableDatabaseLogging: true,
  enablePerformanceLogging: process.env.LOG_PERFORMANCE === 'true',
  timestampFormat: 'ISO'
};

class Logger {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logLevel = LOG_LEVELS[this.config.level.toUpperCase()] || LOG_LEVELS.INFO;
    
    // Ensure logs directory exists
    if (this.config.enableFile) {
      const logsDir = dirname(this.config.logFile);
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
    }
  }

  _shouldLog(level) {
    return level <= this.logLevel;
  }

  _formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const levelName = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level);
    
    let formattedMessage = `[${timestamp}] [${levelName}] ${message}`;
    
    if (data) {
      if (typeof data === 'object') {
        formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
      } else {
        formattedMessage += ` ${data}`;
      }
    }
    
    return formattedMessage;
  }

  _writeLog(level, message, data = null) {
    if (!this._shouldLog(level)) return;

    const formattedMessage = this._formatMessage(level, message, data);
    
    // Console output
    if (this.config.enableConsole) {
      const emoji = {
        ERROR: '❌',
        WARN: '⚠️',
        INFO: 'ℹ️',
        DEBUG: '🔍',
        TRACE: '🔬'
      };
      const levelName = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level);
      const emojiIcon = emoji[levelName] || '📝';
      console.log(`${emojiIcon} ${formattedMessage}`);
    }
    
    // File output
    if (this.config.enableFile) {
      try {
        fs.appendFileSync(this.config.logFile, formattedMessage + '\n');
      } catch (error) {
        console.error('❌ Failed to write to log file:', error);
      }
    }
  }

  error(message, data = null) {
    this._writeLog(LOG_LEVELS.ERROR, message, data);
  }

  warn(message, data = null) {
    this._writeLog(LOG_LEVELS.WARN, message, data);
  }

  info(message, data = null) {
    this._writeLog(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data = null) {
    this._writeLog(LOG_LEVELS.DEBUG, message, data);
  }

  trace(message, data = null) {
    this._writeLog(LOG_LEVELS.TRACE, message, data);
  }

  // Request logging middleware
  requestLogger() {
    return (req, res, next) => {
      if (!this.config.enableRequestLogging) {
        return next();
      }

      const startTime = Date.now();
      
      this.info(`🚀 ${req.method} ${req.path}`, {
        method: req.method,
        path: req.path,
        query: req.query,
        headers: this.config.level === 'TRACE' ? req.headers : { 'user-agent': req.headers['user-agent'] },
        body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
        ip: req.ip || req.connection.remoteAddress
      });

      // Log response
      const originalSend = res.send;
      res.send = function(data) {
        const duration = Date.now() - startTime;
        
        if (logger.config.enableResponseLogging) {
          logger.info(`📤 ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`, {
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            responseSize: data ? data.length : 0
          });
        }
        
        return originalSend.call(this, data);
      };

      next();
    };
  }

  // Database operation logging
  logDatabaseOperation(operation, details) {
    if (!this.config.enableDatabaseLogging) return;
    
    this.debug(`💾 Database ${operation}`, details);
  }

  // Performance logging
  logPerformance(operation, duration, details = {}) {
    if (!this.config.enablePerformanceLogging) return;
    
    this.info(`⏱️ Performance: ${operation} took ${duration}ms`, {
      operation,
      duration: `${duration}ms`,
      ...details
    });
  }

  // Error logging with stack trace
  logError(error, context = {}) {
    this.error(`❌ Error: ${error.message}`, {
      stack: error.stack,
      ...context
    });
  }

  // Configuration logging
  logConfiguration() {
    this.info('🔧 Logger Configuration', {
      level: this.config.level,
      enableConsole: this.config.enableConsole,
      enableFile: this.config.enableFile,
      logFile: this.config.logFile,
      enableRequestLogging: this.config.enableRequestLogging,
      enableResponseLogging: this.config.enableResponseLogging,
      enableDatabaseLogging: this.config.enableDatabaseLogging,
      enablePerformanceLogging: this.config.enablePerformanceLogging
    });
  }
}

// Create default logger instance
const logger = new Logger();

export { Logger, logger, LOG_LEVELS }; 