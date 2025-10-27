export const ErrorCodes = {
    BAD_REQUEST: 'BAD_REQUEST'
};

const HTTP_STATUS = {
    BAD_REQUEST: 400
};
import { HttpException } from "./root";

export class BadRequestException extends HttpException {
    constructor(message: string, errorCode: string, errors: any = null) {
        super(message, errorCode, HTTP_STATUS.BAD_REQUEST, errors);
    }
}