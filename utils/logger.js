const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Log levels
const levels = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
};

class Logger {
    static log(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...meta
        };
        
        // Console output
        console.log(`[${timestamp}] ${level}: ${message}`, meta);
        
        // File output (only in production)
        if (process.env.NODE_ENV === 'production') {
            const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
            fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
        }
    }
    
    static error(message, meta = {}) {
        this.log(levels.ERROR, message, meta);
    }
    
    static warn(message, meta = {}) {
        this.log(levels.WARN, message, meta);
    }
    
    static info(message, meta = {}) {
        this.log(levels.INFO, message, meta);
    }
    
    static debug(message, meta = {}) {
        if (process.env.NODE_ENV !== 'production') {
            this.log(levels.DEBUG, message, meta);
        }
    }
}

module.exports = Logger;