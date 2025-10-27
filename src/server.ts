/**
 * Server Entry Point
 * Ponto de entrada da aplicação com inicialização e tratamento de erros
 */

import 'dotenv/config';
import app from './app';
import { logger } from './config/logger';
import { validateEnvironment } from './config';
import { prisma, initializeDatabaseOptimizations } from './config/database';
import { cleanupExpiredTokens } from './utils/token-blacklist';

// Configurações do servidor
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Inicializar banco de dados
 */
async function initializeDatabase(): Promise<void> {
  try {
    // Testar conexão com o banco
    await prisma.$connect();
    logger.info('Database connection established successfully');

    // Verificar se o banco está acessível
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database health check passed');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

/**
 * Inicializar aplicação
 */
async function startServer(): Promise<void> {
  try {
    logger.info('🚀 Starting Arithimancia API Server...');
    
    // Validar variáveis de ambiente
    logger.info('📋 Validating environment variables...');
    validateEnvironment();
    logger.info('✅ Environment validation passed');

    // Inicializar banco de dados
    logger.info('🗄️  Initializing database connection...');
    await initializeDatabase();
    logger.info('✅ Database connection established');

    // Aplicar otimizações do banco de dados
    logger.info('⚡ Applying database optimizations...');
    await initializeDatabaseOptimizations();
    logger.info('✅ Database optimizations applied');

    // Iniciar limpeza automática de tokens
    logger.info('🧹 Starting token cleanup service...');
    const cleanupInterval = setInterval(async () => {
      try {
        const cleaned = await cleanupExpiredTokens();
        if (cleaned > 0) {
          logger.debug(`Cleaned up ${cleaned} expired tokens`);
        }
      } catch (error) {
        logger.error('Token cleanup failed:', error);
      }
    }, 60 * 60 * 1000); // Executar a cada hora

    // Iniciar servidor HTTP
    const server = app.listen(PORT, () => {
      logger.info('🎉 Server started successfully!');
      logger.info(`🌐 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`📚 API info: http://localhost:${PORT}/`);
      logger.info(`🎮 API endpoints: http://localhost:${PORT}/api/v1`);
      
      if (NODE_ENV === 'development') {
        logger.info(`🔧 Development mode enabled`);
        logger.info(`📖 API Documentation will be available at: http://localhost:${PORT}/api-docs`);
      }
    });

    // Configurar timeout do servidor
    server.timeout = 30000; // 30 segundos
    server.keepAliveTimeout = 65000; // 65 segundos
    server.headersTimeout = 66000; // 66 segundos

    // Configurar graceful shutdown
    setupGracefulShutdown(server, cleanupInterval);

    // Log system information
    logger.info('📊 System Information:', {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
      },
      uptime: process.uptime() + 's'
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Configurar graceful shutdown
 */
function setupGracefulShutdown(server: any, cleanupInterval?: NodeJS.Timeout): void {
  const gracefulShutdown = async (signal: string) => {
    logger.info(`🛑 Received ${signal}. Starting graceful shutdown...`);

    // Parar de aceitar novas conexões
    server.close(async () => {
      logger.info('🔌 HTTP server closed');

      try {
        // Parar limpeza automática de tokens
        if (cleanupInterval) {
          clearInterval(cleanupInterval);
          logger.info('🧹 Token cleanup service stopped');
        }

        // Executar limpeza final de tokens
        logger.info('🧹 Running final token cleanup...');
        const cleaned = await cleanupExpiredTokens();
        logger.info(`🧹 Final cleanup completed: ${cleaned} tokens removed`);

        // Fechar conexão com banco de dados
        logger.info('🗄️  Closing database connection...');
        await prisma.$disconnect();
        logger.info('✅ Database connection closed');

        logger.info('✅ Graceful shutdown completed successfully');
        process.exit(0);
      } catch (error) {
        logger.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

    // Forçar shutdown após 15 segundos
    setTimeout(() => {
      logger.error('⏰ Forced shutdown after timeout');
      process.exit(1);
    }, 15000);
  };

  // Escutar sinais de shutdown
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

/**
 * Tratamento de erros não capturados
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { promise, reason });
  process.exit(1);
});

// Iniciar servidor
if (require.main === module) {
  startServer();
}

export default app;