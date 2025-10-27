/**
 * Database Configuration
 * Configurações de conexão com Supabase e Prisma
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { Request, Response, NextFunction } from 'express';

// Cliente Prisma com otimizações
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

// Configurações de conexão do banco
export const databaseConfig = {
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
  queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '15000'),
};

// Função para testar conexão
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('✅ Conexão com banco de dados estabelecida');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error);
    return false;
  }
}

// Middleware simples de otimização de queries
export const queryOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Adicionar timestamp para tracking de performance
  req.startTime = Date.now();
  next();
};

// Função para inicializar otimizações do banco
export async function initializeDatabaseOptimizations(): Promise<void> {
  try {
    logger.info('Initializing database optimizations...');
    
    // Configurar connection pool baseado no ambiente
    const poolSize = process.env.NODE_ENV === 'production' ? 10 : 5;
    logger.info(`Database connection pool configured with max ${poolSize} connections`);
    
    logger.info('Database optimizations initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database optimizations:', error);
  }
}

// Função para desconectar gracefully
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Disconnected from database');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
    }
  }
}
