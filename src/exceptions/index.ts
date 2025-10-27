/**
 * Exceptions Index
 * Exporta todas as exceções da aplicação
 */

// Base exception
export * from './root';

// HTTP Status exceptions - exportar apenas as classes, não os ErrorCodes
export { BadRequestException } from './bad-request';
export { UnauthorizedException } from './unauthorized';
export { ForbiddenException } from './forbidden';
export { NotFoundException } from './not-found';
export { ConflictException } from './conflict';
export { UnprocessableEntityException } from './validation';

/**
 * Mapa de códigos de erro para status HTTP
 */
export const ERROR_STATUS_MAP = {
  // 400 Bad Request
  BAD_REQUEST: 400,
  INVALID_INPUT: 400,
  MISSING_FIELD: 400,
  INVALID_CHARACTER_CLASS: 400,
  INVALID_ATTRIBUTES: 400,

  // 401 Unauthorized
  UNAUTHORIZED: 401,
  INVALID_TOKEN: 401,
  MISSING_TOKEN: 401,
  INVALID_CREDENTIALS: 401,
  SESSION_EXPIRED: 401,

  // 403 Forbidden
  FORBIDDEN: 403,
  INSUFFICIENT_PERMISSIONS: 403,
  CHARACTER_NOT_OWNED: 403,
  MAX_CHARACTERS_REACHED: 403,
  RESOURCE_ACCESS_DENIED: 403,

  // 404 Not Found
  NOT_FOUND: 404,
  CHARACTER_NOT_FOUND: 404,
  ITEM_NOT_FOUND: 404,
  USER_NOT_FOUND: 404,
  ROUTE_NOT_FOUND: 404,
  DATABASE_RECORD_NOT_FOUND: 404,

  // 409 Conflict
  CONFLICT: 409,
  DUPLICATE_RESOURCE: 409,
  CHARACTER_NAME_EXISTS: 409,
  INVALID_STATE_TRANSITION: 409,
  RESOURCE_IN_USE: 409,
  CONCURRENT_MODIFICATION: 409,

  // 422 Validation Error
  VALIDATION_ERROR: 422,
  FIELD_VALIDATION: 422,
  CHARACTER_VALIDATION: 422,
  ATTRIBUTE_VALIDATION: 422,
  BUSINESS_RULE_VALIDATION: 422,
  INVALID_CHARACTER_STATS: 422,
  INVALID_ITEM_EQUIPMENT: 422,
} as const;

/**
 * Função utilitária para criar exceções baseadas em código
 */
export function createException(code: keyof typeof ERROR_STATUS_MAP, message: string, details?: any) {
  const statusCode = ERROR_STATUS_MAP[code];
  
  // Importa dinamicamente a classe apropriada baseada no status
  switch (statusCode) {
    case 400:
      const { BadRequestException } = require('./bad-request');
      return new BadRequestException(message, details);
    case 401:
      const { UnauthorizedException } = require('./unauthorized');
      return new UnauthorizedException(message, details);
    case 403:
      const { ForbiddenException } = require('./forbidden');
      return new ForbiddenException(message, details);
    case 404:
      const { NotFoundException } = require('./not-found');
      return new NotFoundException(message, details);
    case 409:
      const { ConflictException } = require('./conflict');
      return new ConflictException(message, details);
    case 422:
      const { ValidationException } = require('./validation');
      return new ValidationException(message, details);
    default:
      const { AppException } = require('./root');
      return new AppException(message, statusCode, code, details);
  }
}