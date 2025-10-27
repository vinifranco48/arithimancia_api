/**
 * Cache Configuration
 * Configurações para sistema de cache da aplicação
 */

export interface CacheConfig {
  ttl: number; // Time to live em segundos
  maxSize: number; // Tamanho máximo do cache
  checkPeriod: number; // Período de verificação em segundos
}

export const cacheConfig: CacheConfig = {
  ttl: parseInt(process.env.CACHE_TTL || '3600'), // 1 hora por padrão
  maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000'), // 1000 itens por padrão
  checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '600'), // 10 minutos por padrão
};

/**
 * Cache keys para diferentes tipos de dados
 */
export const CACHE_KEYS = {
  CHARACTER: 'character',
  ITEM: 'item',
  USER_SESSION: 'user_session',
  COMBAT_STATS: 'combat_stats',
} as const;

export type CacheKey = typeof CACHE_KEYS[keyof typeof CACHE_KEYS];