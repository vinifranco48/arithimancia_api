/**
 * AWS Lambda Handler
 * Adaptador para executar a aplicação Express no AWS Lambda
 */

import serverless from 'serverless-http';
import app from './app';
import { logger } from './config/logger';
import { initializeSQLite } from './utils/init-sqlite';

// Configurar para ambiente serverless
process.env.IS_LAMBDA = 'true';

// Flag para controlar inicialização
let isInitialized = false;

// Criar handler serverless com configuração mínima
const serverlessHandler = serverless(app, {
  binary: ['image/*', 'application/pdf'],
});

// Handler com inicialização do SQLite
export const handler = async (event: any, context: any) => {
  // Inicializar SQLite na primeira invocação (cold start)
  if (!isInitialized) {
    try {
      logger.info('🚀 Lambda cold start - initializing SQLite...');
      await initializeSQLite();
      isInitialized = true;
      logger.info('✅ SQLite initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize SQLite:', error);
      // Continuar mesmo com erro - pode ser que o banco já exista
    }
  }

  try {
    // Log detalhado do evento
    logger.info('Lambda event received', {
      version: event.version,
      method: event.requestContext?.http?.method || event.httpMethod,
      path: event.requestContext?.http?.path || event.path,
      rawPath: event.rawPath,
      bodyType: typeof event.body,
      bodyLength: event.body ? event.body.length : 0,
      isBase64: event.isBase64Encoded,
      headers: event.headers,
    });

    // HTTP API v2 format - o body vem como string
    // Não precisamos fazer nada, o Express vai parsear
    
    // Processar requisição
    const response: any = await serverlessHandler(event, context);
    
    logger.info('Lambda response', {
      statusCode: response.statusCode,
    });
    
    return response;
  } catch (error: any) {
    logger.error('Lambda handler error', {
      error: error.message,
      stack: error.stack,
    });
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: {
          code: 'LAMBDA_ERROR',
          message: 'Internal server error',
          timestamp: new Date().toISOString(),
        },
      }),
    };
  }
};

// Para compatibilidade com diferentes versões
export default handler;