export const ErrorCodes = {
    NOT_FOUND: 'NOT_FOUND'
};

const HTTP_STATUS = {
    NOT_FOUND: 404
};
import { HttpException } from "./root";

export class NotFoundException extends HttpException {
    constructor(message: string, errorCode: string, errors: any = null) {
        super(message, errorCode, HTTP_STATUS.NOT_FOUND, errors);
    }
}