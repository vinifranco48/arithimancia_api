const ErrorCodes = {
    UNAUTHORIZED: 'UNAUTHORIZED'
};

const HTTP_STATUS = {
    UNAUTHORIZED: 401
};
import { HttpException } from "./root";

export class UnauthorizedException extends HttpException {
    constructor(message: string, errorCode: string, errors: any = null) {
        super(message, errorCode, HTTP_STATUS.UNAUTHORIZED, errors);
    }
}