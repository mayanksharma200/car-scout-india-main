const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };
    
    return JSON.stringify(logEntry) + '\n';
  }

  writeToFile(filename, content) {
    const filePath = path.join(this.logDir, filename);
    fs.appendFile(filePath, content, (err) => {
      if (err) {
        console.error('Error writing to log file:', err);
      }
    });
  }

  info(message, meta = {}) {
    const formattedMessage = this.formatMessage('info', message, meta);
    console.log(`ℹ️  ${message}`, meta);
    
    if (process.env.NODE_ENV === 'production') {
      this.writeToFile('app.log', formattedMessage);
    }
  }

  error(message, error = {}, meta = {}) {
    const errorMeta = {
      ...meta,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    };
    
    const formattedMessage = this.formatMessage('error', message, errorMeta);
    console.error(`❌ ${message}`, error);
    
    if (process.env.NODE_ENV === 'production') {
      this.writeToFile('error.log', formattedMessage);
    }
  }

  warn(message, meta = {}) {
    const formattedMessage = this.formatMessage('warn', message, meta);
    console.warn(`⚠️  ${message}`, meta);
    
    if (process.env.NODE_ENV === 'production') {
      this.writeToFile('app.log', formattedMessage);
    }
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`🐛 ${message}`, meta);
    }
  }

  // Request logging middleware
  requestLogger(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.user?.id || 'anonymous'
      };

      if (res.statusCode >= 400) {
        this.warn(`HTTP ${res.statusCode} ${req.method} ${req.url}`, logData);
      } else {
        this.info(`HTTP ${res.statusCode} ${req.method} ${req.url}`, logData);
      }
    });

    next();
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;