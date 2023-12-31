import { StatusCodes } from 'http-status-codes';
import ApiError from './api.error';

describe('ApiError', () => {
  it('should set the correct message', () => {
    const errorMessage = 'This is an error message';
    const error = new ApiError(errorMessage);
    expect(error.message).toBe(errorMessage);
  });

  it('should return status as undefined if not provided', () => {
    const error = new ApiError('Error without status code');
    expect(error.status).toBeUndefined();
  });

  it('should set the provided status code', () => {
    const statusCode = StatusCodes.NOT_FOUND;
    const error = new ApiError('Error with status code', { status: statusCode });
    expect(error.status).toBe(statusCode);
  });

  it('should inherit the cause from options', () => {
    const cause = new Error('Root cause of the error');
    const error = new ApiError('Error with cause', { cause });
    expect(error.cause).toBe(cause);
  });

  it('should not have a cause if options do not provide one', () => {
    const error = new ApiError('Error without cause');
    expect(error.cause).toBeUndefined();
  });

  it('should make sure that ApiError is an instance of Error', () => {
    const error = new ApiError('Any error');
    expect(error instanceof Error).toBeTruthy();
  });

  it('should create an ApiError with empty message', () => {
    const error = new ApiError();
    expect(error.message).toBe('');
  });
});
