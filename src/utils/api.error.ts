import { type StatusCodes } from 'http-status-codes';

interface ApiErrorOptions extends ErrorOptions {
  status?: StatusCodes | undefined;
}

export default class ApiError extends Error {
  status?: StatusCodes;
  constructor(message?: string, options?: ApiErrorOptions) {
    super(message, { cause: options?.cause });
    this.status = options?.status;
  }
}
