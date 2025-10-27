/**
 * Middlewares Index
 * Exporta todos os middlewares da aplicação
 */

// Authentication middlewares
export * from './auth.middleware';

// Error handling middlewares
export * from './error.middleware';

// Validation middlewares
export * from './validation.middleware';

/**
 * Middleware para validação de entrada
 */
export { validateContentType, requestTimeout, securityHeaders, requestId, requestLogger } from './error.middleware';

/**
 * Middleware de autenticação
 */
export { 
  default as authMiddleware,
  optionalAuthMiddleware
} from './auth.middleware';

/**
 * Middleware de tratamento de erros
 */
export { 
  errorHandler, 
  notFoundHandler, 
  asyncErrorHandler 
} from './error.middleware';