type ErrorCodes = string;

export class HttpException extends Error {
    message: string;
    errorCode: string;
    statusCode: number;
    errors: any;

    constructor(message: string, errorCode: ErrorCodes, statusCode: number, errors: any = null) {
        super(message);
        this.message = message;
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.errors = errors;
    }
}

/**
 * Classe base para todas as exceções customizadas
 */
export class RootException extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly details?: any;

    constructor(message: string, code: string, statusCode: number, details?: any) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;

        // Manter stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}