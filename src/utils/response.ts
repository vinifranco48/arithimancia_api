interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    timestamp?: string;
    path?: string;
  };
}

interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
  timestamp?: string;
  path?: string;
}

type ErrorCodes = string;

/**
 * Monta uma resposta de sucesso
 * @param data - dados do payload
 * @param message - mensagem opcional
 */
export function success<T>(message = 'Success', data?: T): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

/**
 * Monta uma resposta de sucesso (alias)
 */
export function createSuccessResponse<T>(data?: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

/**
 * Monta uma resposta de erro
 * @param message - mensagem do erro
 * @param errorCode - código do erro opcional
 * @param error - descrição interna do erro
 */
export function failure(message: string, errorCode: ErrorCodes, errors?: any[]): ApiResponse<null> {
  return {
    success: false,
    error: {
      code: errorCode,
      message,
      details: errors,
    },
  };
}

/**
 * Monta uma resposta de erro (alias)
 */
export function createErrorResponse(error: ErrorResponse): ApiResponse<null> {
  return {
    success: false,
    error,
  };
}

/**
 * Classe utilitária para respostas (compatibilidade)
 */
export class ResponseUtil {
  static success<T>(data?: T, message?: string): ApiResponse<T> {
    return createSuccessResponse(data, message);
  }

  static error(res: any, message: string, statusCode: number, code: string): void {
    res.status(statusCode).json(createErrorResponse({
      code,
      message,
      timestamp: new Date().toISOString()
    }));
  }

  static notFound(res: any, message: string): void {
    res.status(404).json(createErrorResponse({
      code: 'NOT_FOUND',
      message,
      timestamp: new Date().toISOString()
    }));
  }

  static validationError(res: any, errors: any[]): void {
    res.status(422).json(createErrorResponse({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errors,
      timestamp: new Date().toISOString()
    }));
  }
}