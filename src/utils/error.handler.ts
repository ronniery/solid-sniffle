import { type Request, type Response, type NextFunction } from 'express';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import { isEmpty } from 'lodash';

import type ApiError from './api.error';

// Handle the exceptions that were thrown by application
export default (err: ApiError, _req: Request, res: Response, _next: NextFunction): void => {
  const status = err.status ?? StatusCodes.INTERNAL_SERVER_ERROR;
  const message = isEmpty(err.message) ? getReasonPhrase(status) : err.message;
  const cause = err.cause ?? undefined;

  res.status(status).json({ status, error: message, cause });
};
