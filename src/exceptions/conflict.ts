export const ErrorCodes = {
    CONFLICT: 'CONFLICT'
};

const HTTP_STATUS = {
    CONFLICT: 409
};
import { HttpException } from "./root";

export class ConflictException extends HttpException {
    constructor(message: string, errorCode: string, errors: any = null) {
        super(message, errorCode, HTTP_STATUS.CONFLICT, errors);
    }
}