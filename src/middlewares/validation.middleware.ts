/**
 * Validation Middleware
 * Middleware para validação automática usando Zod schemas
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, z } from 'zod';
import { UnprocessableEntityException } from '../exceptions/validation';

/**
 * Interface para definir quais partes da requisição validar
 */
interface ValidationOptions {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

/**
 * Middleware de validação que aplica schemas Zod automaticamente
 * @param options - Schemas para validar body, params e/ou query
 * @returns Middleware function
 */
export function validate(options: ValidationOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar body se schema fornecido
      if (options.body) {
        req.body = options.body.parse(req.body);
      }

      // Validar params se schema fornecido
      if (options.params) {
        req.params = options.params.parse(req.params) as any;
      }

      // Validar query se schema fornecido
      if (options.query) {
        const validatedQuery = options.query.parse(req.query);
        // Limpar query existente e aplicar os valores validados
        Object.keys(req.query).forEach(key => {
          delete (req.query as any)[key];
        });
        Object.assign(req.query, validatedQuery);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatar erros de validação Zod
        const validationErrors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          received: err.received
        }));

        // Criar resposta de erro diretamente
        res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: validationErrors,
            timestamp: new Date().toISOString(),
            path: req.originalUrl
          }
        });
        return;
      }

      // Re-throw outros tipos de erro
      return next(error);
    }
  };
}

/**
 * Middleware específico para validação de body
 * @param schema - Schema Zod para validar o body
 * @returns Middleware function
 */
export function validateBody(schema: ZodSchema) {
  return validate({ body: schema });
}

/**
 * Middleware específico para validação de params
 * @param schema - Schema Zod para validar os params
 * @returns Middleware function
 */
export function validateParams(schema: ZodSchema) {
  return validate({ params: schema });
}

/**
 * Middleware específico para validação de query
 * @param schema - Schema Zod para validar a query
 * @returns Middleware function
 */
export function validateQuery(schema: ZodSchema) {
  return validate({ query: schema });
}

/**
 * Middleware para validação de ID numérico em params
 * Valida que o parâmetro 'id' é um número positivo
 */
export function validateId(paramName: string = 'id') {
  const idSchema = z.object({
    [paramName]: z.string()
      .regex(/^\d+$/, `${paramName} deve ser um número`)
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, `${paramName} deve ser positivo`)
  });

  return validateParams(idSchema);
}

/**
 * Middleware para validação de paginação em query
 * Valida parâmetros page e limit com valores padrão
 */
export function validatePagination() {
  const paginationSchema = z.object({
    page: z.string()
      .optional()
      .default("1")
      .refine((val) => /^\d+$/.test(val), "Página deve ser um número")
      .transform((val) => parseInt(val, 10))
      .refine((val) => val >= 1, "Página deve ser pelo menos 1"),
    limit: z.string()
      .optional()
      .default("10")
      .refine((val) => /^\d+$/.test(val), "Limite deve ser um número")
      .transform((val) => parseInt(val, 10))
      .refine((val) => val >= 1 && val <= 100, "Limite deve ser entre 1 e 100")
  });

  return validateQuery(paginationSchema);
}

/**
 * Middleware para sanitização de strings
 * Remove espaços em branco no início e fim de strings
 */
export function sanitizeStrings(req: Request, res: Response, next: NextFunction): void {
  // Função recursiva para sanitizar objetos
  function sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return obj.trim();
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }

  // Sanitizar body, params e query
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  if (req.query) {
    // Para query, precisamos modificar as propriedades individualmente
    // pois req.query é read-only
    const sanitizedQuery = sanitizeObject(req.query);
    Object.keys(req.query).forEach(key => {
      delete (req.query as any)[key];
    });
    Object.assign(req.query, sanitizedQuery);
  }

  next();
}

/**
 * Middleware para validação de Content-Type
 * Garante que requisições POST/PUT tenham Content-Type application/json
 */
export function validateContentType(req: Request, res: Response, next: NextFunction): void {
  const methods = ['POST', 'PUT', 'PATCH'];

  if (methods.includes(req.method)) {
    const contentType = req.headers['content-type'];

    if (!contentType || !contentType.includes('application/json')) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CONTENT_TYPE',
          message: 'Content-Type deve ser application/json',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
      return;
    }
  }

  next();
}

/**
 * Middleware para validação de tamanho do body
 * Limita o tamanho do body da requisição
 */
export function validateBodySize(maxSizeKB: number = 100) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.headers['content-length'];

    if (contentLength) {
      const sizeKB = parseInt(contentLength) / 1024;

      if (sizeKB > maxSizeKB) {
        res.status(413).json({
          success: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: `Body da requisição muito grande. Máximo permitido: ${maxSizeKB}KB`,
            timestamp: new Date().toISOString(),
            path: req.path
          }
        });
        return;
      }
    }

    next();
  };
}

/**
 * Middleware para validação de campos obrigatórios
 * Verifica se campos específicos estão presentes no body
 */
export function validateRequiredFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields: string[] = [];

    for (const field of fields) {
      if (!req.body || req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: `Campos obrigatórios ausentes: ${missingFields.join(', ')}`,
          details: {
            missingFields,
            requiredFields: fields
          },
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
      return;
    }

    next();
  };
}

/**
 * Middleware para validação de tipos de arquivo (para uploads futuros)
 * Valida extensões de arquivo permitidas
 */
export function validateFileTypes(allowedTypes: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Para implementação futura quando houver upload de arquivos
    // Por enquanto, apenas passa adiante
    next();
  };
}

/**
 * Middleware combinado para validação completa
 * Aplica sanitização, validação de content-type e tamanho
 */
export function fullValidation(options: ValidationOptions, maxSizeKB: number = 100) {
  return [
    validateContentType,
    validateBodySize(maxSizeKB),
    sanitizeStrings,
    validate(options)
  ];
}

export default {
  validate,
  validateBody,
  validateParams,
  validateQuery,
  validateId,
  validatePagination,
  sanitizeStrings,
  validateContentType,
  validateBodySize,
  validateRequiredFields,
  validateFileTypes,
  fullValidation
};