/**
 * Logger Configuration
 * Configurações do sistema de logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerConfig {
  level: LogLevel;
  format: 'json' | 'pretty';
  timestamp: boolean;
  colorize: boolean;
  maxFileSize: string;
  maxFiles: number;
}

export const loggerConfig: LoggerConfig = {
  level: (process.env.LOG_LEVEL as LogLevel) || 'info',
  format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
  timestamp: true,
  colorize: process.env.NODE_ENV !== 'production',
  maxFileSize: '10m',
  maxFiles: 5,
};

// Níveis de log em ordem de prioridade
export const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
} as const;

// Cores para diferentes níveis (desenvolvimento)
export const LOG_COLORS = {
  error: '\x1b[31m', // Vermelho
  warn: '\x1b[33m',  // Amarelo
  info: '\x1b[36m',  // Ciano
  debug: '\x1b[35m', // Magenta
  reset: '\x1b[0m',  // Reset
} as const;

/**
 * Interface para estrutura de log
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Função para formatar logs
 */
export function formatLog(entry: LogEntry): string {
  if (loggerConfig.format === 'json') {
    return JSON.stringify(entry);
  }
  
  const color = loggerConfig.colorize ? LOG_COLORS[entry.level] : '';
  const reset = loggerConfig.colorize ? LOG_COLORS.reset : '';
  const timestamp = loggerConfig.timestamp ? `[${entry.timestamp}] ` : '';
  
  return `${color}${timestamp}${entry.level.toUpperCase()}: ${entry.message}${reset}`;
}

/**
 * Logger simples para desenvolvimento
 */
export const logger = {
  debug: (message: string, metadata?: any) => {
    if (LOG_LEVELS[loggerConfig.level] >= LOG_LEVELS.debug) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'debug',
        message,
        metadata
      };
      console.log(formatLog(entry));
    }
  },
  
  info: (message: string, metadata?: any) => {
    if (LOG_LEVELS[loggerConfig.level] >= LOG_LEVELS.info) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message,
        metadata
      };
      console.log(formatLog(entry));
    }
  },
  
  warn: (message: string, metadata?: any) => {
    if (LOG_LEVELS[loggerConfig.level] >= LOG_LEVELS.warn) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'warn',
        message,
        metadata
      };
      console.warn(formatLog(entry));
    }
  },
  
  error: (message: string, metadata?: any) => {
    if (LOG_LEVELS[loggerConfig.level] >= LOG_LEVELS.error) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        message,
        metadata
      };
      console.error(formatLog(entry));
    }
  }
};