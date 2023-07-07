import { type Request, type Response, type NextFunction } from 'express';
import { type MockRequest, createRequest, type MockResponse, createResponse } from 'node-mocks-http';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

import errorHandler from '../../utils/error.handler';
import ApiError from '../../utils/api.error';

describe('Error Handler', () => {
  let request: MockRequest<Request>;
  let response: MockResponse<Response>;
  let next: NextFunction;

  beforeEach(() => {
    request = createRequest({});
    response = createResponse<Response>({});
    response.status = jest.fn().mockReturnThis();
    response.json = jest.fn().mockReturnThis();

    next = jest.fn();
  });

  it('should handle error with provided status, message, and cause', () => {
    const error = new ApiError('Test Error');
    error.status = StatusCodes.BAD_REQUEST;
    error.cause = 'Some cause';

    errorHandler(error, request, response, next);

    expect(response.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      status: StatusCodes.BAD_REQUEST,
      error: 'Test Error',
      cause: 'Some cause',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle error with default status, message, and cause', () => {
    const error = new ApiError('Test Error');
    error.cause = 'Some cause';

    errorHandler(error, request, response, next);

    expect(response.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.json).toHaveBeenCalledWith({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: 'Test Error',
      cause: 'Some cause',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle error without message or cause', () => {
    const error = new ApiError();
    error.status = StatusCodes.NOT_FOUND;

    errorHandler(error, request, response, next);

    expect(response.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith({
      status: StatusCodes.NOT_FOUND,
      error: getReasonPhrase(StatusCodes.NOT_FOUND),
      cause: undefined,
    });
    expect(next).not.toHaveBeenCalled();
  });
});
