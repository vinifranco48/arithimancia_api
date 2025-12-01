/**
 * AWS Lambda Handler
 * Adaptador para executar a aplicação Express no AWS Lambda
 */

import serverless from 'serverless-http';
import app from './app';
import { logger } from './config/logger';

// Configurar para ambiente serverless
process.env.IS_LAMBDA = 'true';

// Criar handler serverless com configuração mínima
const serverlessHandler = serverless(app, {
  binary: ['image/*', 'application/pdf'],
});

// Handler
export const handler = async (event: any, context: any) => {
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