import { HttpException } from "./root";

const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR'
};

const HTTP_STATUS = {
  UNPROCESSABLE_ENTITY: 422
};

export class UnprocessableEntityException extends HttpException {
  constructor(message: string, errors: any = null) {
    super(message, ErrorCodes.VALIDATION_ERROR, HTTP_STATUS.UNPROCESSABLE_ENTITY, errors);
  }
}