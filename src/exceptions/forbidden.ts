export const ErrorCodes = {
    FORBIDDEN: 'FORBIDDEN'
};

const HTTP_STATUS = {
    FORBIDDEN: 403
};
import { HttpException } from "./root";

export class ForbiddenException extends HttpException {
    constructor(message: string, errorCode: string, errors: any = null) {
        super(message, errorCode, HTTP_STATUS.FORBIDDEN, errors);
    }
}