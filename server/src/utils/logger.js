const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    
    console.log(`[${timestamp}] ${level}: ${message} ${metaString}`);
  }

  info(message, meta = {}) {
    if (this.isDevelopment) {
      console.log(`${colors.cyan}ℹ ${message}${colors.reset}`, meta);
    }
    this.log('INFO', message, meta);
  }

  success(message, meta = {}) {
    if (this.isDevelopment) {
      console.log(`${colors.green}✓ ${message}${colors.reset}`, meta);
    }
    this.log('SUCCESS', message, meta);
  }

  warn(message, meta = {}) {
    if (this.isDevelopment) {
      console.log(`${colors.yellow}⚠ ${message}${colors.reset}`, meta);
    }
    this.log('WARN', message, meta);
  }

  error(message, error = null) {
    if (this.isDevelopment) {
      console.log(`${colors.red}✗ ${message}${colors.reset}`);
      if (error) console.error(error);
    }
    this.log('ERROR', message, error ? { error: error.message, stack: error.stack } : {});
  }

  debug(message, meta = {}) {
    if (this.isDevelopment) {
      console.log(`${colors.magenta}🐛 ${message}${colors.reset}`, meta);
    }
  }

  socket(message, meta = {}) {
    if (this.isDevelopment) {
      console.log(`${colors.blue}🔌 ${message}${colors.reset}`, meta);
    }
    this.log('SOCKET', message, meta);
  }

  database(message, meta = {}) {
    if (this.isDevelopment) {
      console.log(`${colors.cyan}💾 ${message}${colors.reset}`, meta);
    }
    this.log('DATABASE', message, meta);
  }
}

export default new Logger();