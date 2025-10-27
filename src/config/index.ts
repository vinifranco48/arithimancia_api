/**
 * Configuration Index
 * Exporta todas as configurações da aplicação
 */

export * from './cache';
export * from './cors';
export * from './database';
export * from './logger';
export * from './server';


const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'DATABASE_URL',
  'JWT_SECRET',
];

export function validateEnvironment(): void {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias não encontradas: ${missing.join(', ')}`
    );
  }
}

// Configuração consolidada da aplicação
export const appConfig = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  jwt: {
    secret: process.env.JWT_SECRET!,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
} as const;