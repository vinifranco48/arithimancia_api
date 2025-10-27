/**
 * JWT Utilities
 * Utilitários para geração, verificação e refresh de tokens JWT
 */

import jwt from 'jsonwebtoken';
import { UnauthorizedException } from '../exceptions/unauthorized';

// Configurações JWT do ambiente
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Interface para payload do token
export interface TokenPayload {
  playerId: number;
  username: string;
  email: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

// Interface para resposta de tokens
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Gerar token de acesso
 */
export function generateAccessToken(payload: Omit<TokenPayload, 'type' | 'iat' | 'exp'>): string {
  const tokenPayload = {
    playerId: payload.playerId,
    username: payload.username,
    email: payload.email,
    type: 'access' as const
  };

  return jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: '15m',
    issuer: 'arithimancia-api',
    audience: 'arithimancia-client'
  });
}

/**
 * Gerar token de refresh
 */
export function generateRefreshToken(payload: Omit<TokenPayload, 'type' | 'iat' | 'exp'>): string {
  const tokenPayload = {
    playerId: payload.playerId,
    username: payload.username,
    email: payload.email,
    type: 'refresh' as const
  };

  return jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'arithimancia-api',
    audience: 'arithimancia-client'
  });
}

/**
 * Gerar par de tokens (access + refresh)
 */
export function generateTokenPair(payload: Omit<TokenPayload, 'type' | 'iat' | 'exp'>): TokenResponse {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
}

/**
 * Verificar e decodificar token
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'arithimancia-api',
      audience: 'arithimancia-client'
    }) as TokenPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedException('Token expired', 'TOKEN_EXPIRED');
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedException('Invalid token', 'TOKEN_INVALID');
    }

    throw new UnauthorizedException('Token verification failed', 'TOKEN_VERIFICATION_FAILED');
  }
}

/**
 * Verificar se token é de acesso
 */
export function verifyAccessToken(token: string): TokenPayload {
  const payload = verifyToken(token);
  
  if (payload.type !== 'access') {
    throw new UnauthorizedException('Invalid token type', 'INVALID_TOKEN_TYPE');
  }

  return payload;
}

/**
 * Verificar se token é de refresh
 */
export function verifyRefreshToken(token: string): TokenPayload {
  const payload = verifyToken(token);
  
  if (payload.type !== 'refresh') {
    throw new UnauthorizedException('Invalid token type', 'INVALID_TOKEN_TYPE');
  }

  return payload;
}

/**
 * Extrair token do header Authorization
 */
export function extractTokenFromHeader(authHeader: string | undefined): string {
  if (!authHeader) {
    throw new UnauthorizedException('No authorization header provided', 'NO_AUTH_HEADER');
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    throw new UnauthorizedException('No token provided', 'NO_TOKEN');
  }

  return token;
}

/**
 * Decodificar token sem verificar (para debug)
 */
export function decodeTokenUnsafe(token: string): any {
  return jwt.decode(token);
}

/**
 * Verificar se token está próximo do vencimento
 */
export function isTokenNearExpiry(token: string, thresholdMinutes: number = 5): boolean {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    const threshold = thresholdMinutes * 60;
    
    return (decoded.exp - now) <= threshold;
  } catch {
    return true;
  }
}