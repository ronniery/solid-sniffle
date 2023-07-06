import { Request, Response, NextFunction } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";

// Handle the exceptions that were thrown by application
export default (err: Error & { status?: number }, _req: Request, res: Response, next: NextFunction): void => {
  const status = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || getReasonPhrase(status);

  res.status(status).json({ status, error: message });
}