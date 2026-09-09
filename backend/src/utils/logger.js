import crypto from 'crypto';

// ANSI Terminal Color Codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  // Bright foreground
  redBright: '\x1b[91m',
  greenBright: '\x1b[92m',
  yellowBright: '\x1b[93m',
  blueBright: '\x1b[94m',
  magentaBright: '\x1b[95m',
  cyanBright: '\x1b[96m',
  whiteBright: '\x1b[97m',

  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
};

/**
 * Format current timestamp as YYYY-MM-DD HH:mm:ss.SSS
 */
function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`;
}

/**
 * Format payload size in bytes to human-readable string
 */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Color-code HTTP Method
 */
function colorMethod(method) {
  switch (method.toUpperCase()) {
    case 'GET':
      return `${colors.green}${colors.bright}GET${colors.reset}`;
    case 'POST':
      return `${colors.cyan}${colors.bright}POST${colors.reset}`;
    case 'PUT':
      return `${colors.yellow}${colors.bright}PUT${colors.reset}`;
    case 'PATCH':
      return `${colors.yellowBright}${colors.bright}PATCH${colors.reset}`;
    case 'DELETE':
      return `${colors.red}${colors.bright}DELETE${colors.reset}`;
    case 'OPTIONS':
      return `${colors.gray}OPTIONS${colors.reset}`;
    default:
      return `${colors.white}${method}${colors.reset}`;
  }
}

/**
 * Color-code HTTP Status Code
 */
function colorStatus(status) {
  if (status >= 500) {
    return `${colors.redBright}${colors.bright}${status}${colors.reset}`;
  }
  if (status >= 400) {
    return `${colors.yellow}${colors.bright}${status}${colors.reset}`;
  }
  if (status >= 300) {
    return `${colors.cyan}${status}${colors.reset}`;
  }
  if (status >= 200) {
    return `${colors.green}${colors.bright}${status}${colors.reset}`;
  }
  return `${colors.white}${status}${colors.reset}`;
}

/**
 * Core Structured Logger
 */
export const logger = {
  info(message, context = 'SYSTEM') {
    const time = `${colors.gray}${getTimestamp()}${colors.reset}`;
    const tag = `${colors.cyan}${colors.bright}[INFO]${colors.reset}`;
    const ctx = `${colors.blueBright}[${context}]${colors.reset}`;
    console.log(`${time} ${tag} ${ctx} ${message}`);
  },

  success(message, context = 'SYSTEM') {
    const time = `${colors.gray}${getTimestamp()}${colors.reset}`;
    const tag = `${colors.green}${colors.bright}[SUCCESS]${colors.reset}`;
    const ctx = `${colors.greenBright}[${context}]${colors.reset}`;
    console.log(`${time} ${tag} ${ctx} ${message}`);
  },

  warn(message, context = 'SYSTEM') {
    const time = `${colors.gray}${getTimestamp()}${colors.reset}`;
    const tag = `${colors.yellow}${colors.bright}[WARN]${colors.reset}`;
    const ctx = `${colors.yellowBright}[${context}]${colors.reset}`;
    console.warn(`${time} ${tag} ${ctx} ${colors.yellow}${message}${colors.reset}`);
  },

  error(message, error = null, context = 'SYSTEM') {
    const time = `${colors.gray}${getTimestamp()}${colors.reset}`;
    const tag = `${colors.redBright}${colors.bright}[ERROR]${colors.reset}`;
    const ctx = `${colors.red}[${context}]${colors.reset}`;
    console.error(`${time} ${tag} ${ctx} ${colors.redBright}${message}${colors.reset}`);

    if (error && error.stack) {
      console.error(`${colors.dim}${error.stack}${colors.reset}`);
    } else if (error) {
      console.error(`${colors.dim}${JSON.stringify(error, null, 2)}${colors.reset}`);
    }
  },

  debug(message, context = 'SYSTEM') {
    if (process.env.NODE_ENV === 'production') return;
    const time = `${colors.gray}${getTimestamp()}${colors.reset}`;
    const tag = `${colors.magenta}${colors.bright}[DEBUG]${colors.reset}`;
    const ctx = `${colors.magentaBright}[${context}]${colors.reset}`;
    console.log(`${time} ${tag} ${ctx} ${colors.dim}${message}${colors.reset}`);
  },

  /**
   * Beautiful Startup Banner
   */
  banner({ name, version, port, env, district, urls = [] }) {
    const w = 58;
    const line = '─'.repeat(w);
    console.log(`\n${colors.cyanBright}┌${line}┐${colors.reset}`);
    console.log(`${colors.cyanBright}│${colors.reset}  ${colors.bright}${colors.whiteBright}🏛️  ${name.padEnd(w - 6)}${colors.reset}${colors.cyanBright}│${colors.reset}`);
    if (version) {
      console.log(`${colors.cyanBright}│${colors.reset}  ${colors.dim}v${version}${colors.reset}${''.padEnd(w - version.length - 3)}${colors.cyanBright}│${colors.reset}`);
    }
    console.log(`${colors.cyanBright}├${line}┤${colors.reset}`);
    console.log(`${colors.cyanBright}│${colors.reset}  ${colors.dim}Environment :${colors.reset} ${colors.green}${env || 'development'}${colors.reset}${''.padEnd(w - 16 - (env || 'development').length)}${colors.cyanBright}│${colors.reset}`);
    console.log(`${colors.cyanBright}│${colors.reset}  ${colors.dim}Port        :${colors.reset} ${colors.yellow}${port}${colors.reset}${''.padEnd(w - 16 - String(port).length)}${colors.cyanBright}│${colors.reset}`);
    if (district) {
      console.log(`${colors.cyanBright}│${colors.reset}  ${colors.dim}District    :${colors.reset} ${colors.magentaBright}${district}${colors.reset}${''.padEnd(w - 16 - district.length)}${colors.cyanBright}│${colors.reset}`);
    }
    console.log(`${colors.cyanBright}├${line}┤${colors.reset}`);
    for (const { label, url } of urls) {
      const entry = `  ${colors.dim}${label.padEnd(12)}:${colors.reset} ${colors.cyan}${url}${colors.reset}`;
      const rawLen = 14 + label.length + url.length;
      console.log(`${colors.cyanBright}│${colors.reset}${entry}${''.padEnd(Math.max(0, w - (label.length + url.length + 15)))}${colors.cyanBright}│${colors.reset}`);
    }
    console.log(`${colors.cyanBright}└${line}┘\n${colors.reset}`);
  },
};

/**
 * Express HTTP Request Logger Middleware
 * Provides real-time request tracing, timing, status codes, and payload tracking
 */
export function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();

  // Attach unique Request ID
  const reqId = `req_${crypto.randomUUID().slice(0, 8)}`;
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);

  // Exclude noisy favicon requests
  if (req.originalUrl === '/favicon.ico') {
    return next();
  }

  // Response completion hook
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = (Number(end - start) / 1e6).toFixed(2);

    const time = `${colors.gray}${getTimestamp()}${colors.reset}`;
    const ctx = `${colors.blueBright}[HTTP]${colors.reset}`;
    const methodStr = colorMethod(req.method);
    const urlStr = `${colors.white}${req.originalUrl}${colors.reset}`;
    const statusStr = colorStatus(res.statusCode);

    // Duration formatting
    let durationStr = `${colors.dim}+${durationMs}ms${colors.reset}`;
    if (Number(durationMs) > 500) {
      durationStr = `${colors.yellowBright}${colors.bright}+${durationMs}ms [SLOW]${colors.reset}`;
    } else if (Number(durationMs) > 200) {
      durationStr = `${colors.yellow}+${durationMs}ms${colors.reset}`;
    }

    // Size header if present
    const contentLength = res.getHeader('content-length');
    const sizeStr = contentLength ? `${colors.dim}(${formatBytes(Number(contentLength))})${colors.reset}` : '';

    const idStr = `${colors.dim}[${reqId}]${colors.reset}`;

    console.log(`${time} ${ctx} ${methodStr} ${urlStr} ${statusStr} ${durationStr} ${sizeStr} ${idStr}`);
  });

  next();
}

export default logger;
