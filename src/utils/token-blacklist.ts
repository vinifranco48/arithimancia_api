/**
 * Token Blacklist Utilities
 * Sistema de blacklist para tokens invalidados (logout)
 */

import { decodeTokenUnsafe } from './jwt';

// In-memory blacklist (em produção, usar Redis ou banco de dados)
const blacklistedTokens = new Set<string>();

// Cleanup automático de tokens expirados (executar periodicamente)
const expiredTokens = new Map<string, number>(); // token -> expiry timestamp

/**
 * Adicionar token à blacklist
 */
export function blacklistToken(token: string): void {
  try {
    const decoded = decodeTokenUnsafe(token) as any;
    
    if (decoded && decoded.exp) {
      const expiryTime = decoded.exp * 1000; // Converter para milliseconds
      blacklistedTokens.add(token);
      expiredTokens.set(token, expiryTime);
    } else {
      // Se não conseguir decodificar, adicionar mesmo assim por segurança
      blacklistedTokens.add(token);
    }
  } catch (error) {
    // Em caso de erro, adicionar à blacklist por segurança
    blacklistedTokens.add(token);
  }
}

/**
 * Verificar se token está na blacklist
 */
export function isTokenBlacklisted(token: string): boolean {
  return blacklistedTokens.has(token);
}

/**
 * Remover token da blacklist
 */
export function removeFromBlacklist(token: string): void {
  blacklistedTokens.delete(token);
  expiredTokens.delete(token);
}

/**
 * Limpar tokens expirados da blacklist
 * @returns Número de tokens removidos
 */
export function cleanupExpiredTokens(): number {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [token, expiryTime] of expiredTokens.entries()) {
    if (now > expiryTime) {
      blacklistedTokens.delete(token);
      expiredTokens.delete(token);
      cleanedCount++;
    }
  }
  
  return cleanedCount;
}

/**
 * Obter estatísticas da blacklist
 */
export function getBlacklistStats(): {
  totalTokens: number;
  expiredTokens: number;
  activeTokens: number;
} {
  const now = Date.now();
  let expiredCount = 0;
  
  for (const expiryTime of expiredTokens.values()) {
    if (now > expiryTime) {
      expiredCount++;
    }
  }
  
  return {
    totalTokens: blacklistedTokens.size,
    expiredTokens: expiredCount,
    activeTokens: blacklistedTokens.size - expiredCount
  };
}

/**
 * Limpar toda a blacklist (usar com cuidado)
 */
export function clearBlacklist(): void {
  blacklistedTokens.clear();
  expiredTokens.clear();
}

// Executar limpeza automática a cada 1 hora
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

// Executar limpeza inicial após 1 minuto
setTimeout(cleanupExpiredTokens, 60 * 1000);