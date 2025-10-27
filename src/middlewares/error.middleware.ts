/**
 * Error Handling Middleware
 * Middleware para tratamento centralizado de erros
 */

import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/root';
import { ResponseUtil } from '../utils/response';

/**
 * Interface para erro estruturado
 */
interface ErrorResponse {
  success: false;
  code: string;
  message: string;
  details?: any;
  stack?: string;
  timestamp: string;
  requestId?: string;
}

/**
 * Middleware principal de tratamento de erros
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log do erro
  console.error('Error caught by middleware:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    requestId: res.locals.requestId,
  });

  // Se é uma exceção customizada (HttpException)
  if (error instanceof HttpException) {
    const errorResponse: ErrorResponse = {
      success: false,
      code: error.errorCode,
      message: error.message,
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId,
    };

    // Adicionar detalhes em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = error.errors;
      errorResponse.stack = error.stack;
    }

    res.status(error.statusCode).json(errorResponse);
    return;
  }

  // Erros de validação do Prisma
  if (error.name === 'PrismaClientValidationError') {
    ResponseUtil.validationError(res, [
      {
        field: 'database',
        message: 'Erro de validação no banco de dados',
        code: 'PRISMA_VALIDATION_ERROR',
      },
    ]);
    return;
  }

  // Erros de constraint do Prisma
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        ResponseUtil.error(
          res,
          'Violação de restrição única. Registro já existe.',
          409,
          'DUPLICATE_ENTRY'
        );
        return;
      
      case 'P2025':
        ResponseUtil.notFound(res, 'Registro não encontrado');
        return;
      
      case 'P2003':
        ResponseUtil.error(
          res,
          'Violação de chave estrangeira',
          400,
          'FOREIGN_KEY_CONSTRAINT'
        );
        return;
      
      default:
        ResponseUtil.error(
          res,
          'Erro no banco de dados',
          500,
          'DATABASE_ERROR'
        );
        return;
    }
  }

  // Erros de sintaxe JSON
  if (error instanceof SyntaxError && 'body' in error) {
    ResponseUtil.validationError(res, [
      {
        field: 'body',
        message: 'JSON inválido no corpo da requisição',
        code: 'INVALID_JSON',
      },
    ]);
    return;
  }

  // Erro interno do servidor (não tratado)
  const errorResponse: ErrorResponse = {
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : error.message,
    timestamp: new Date().toISOString(),
    requestId: res.locals.requestId,
  };

  // Adicionar stack trace em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  res.status(500).json(errorResponse);
};

/**
 * Middleware para capturar rotas não encontradas (404)
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  ResponseUtil.error(
    res,
    `Rota '${req.method} ${req.path}' não encontrada`,
    404,
    'ROUTE_NOT_FOUND'
  );
};

/**
 * Middleware para tratar erros assíncronos
 */
export const asyncErrorHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para validar Content-Type
 */
export const validateContentType = (expectedType: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const contentType = req.headers['content-type'];
      
      if (!contentType || !contentType.includes(expectedType)) {
        ResponseUtil.error(
          res,
          `Content-Type deve ser ${expectedType}`,
          400,
          'INVALID_CONTENT_TYPE'
        );
        return;
      }
    }
    
    next();
  };
};

/**
 * Middleware para timeout de requisições
 */
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        ResponseUtil.error(
          res,
          'Timeout da requisição',
          408,
          'REQUEST_TIMEOUT'
        );
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    res.on('close', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

/**
 * Middleware para adicionar headers de segurança
 */
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Remover header que expõe tecnologia
  res.removeHeader('X-Powered-By');
  
  // Headers de segurança
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CSP básico para APIs
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none';"
  );

  next();
};

/**
 * Middleware para adicionar Request ID
 */
export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const reqId = req.headers['x-request-id'] as string || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  res.locals.requestId = reqId;
  res.setHeader('X-Request-ID', reqId);
  
  next();
};

/**
 * Middleware para logging de requisições
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    console.log({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString(),
    });
  });
  
  next();
};