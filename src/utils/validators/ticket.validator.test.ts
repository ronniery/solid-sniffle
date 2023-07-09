import { type Response, type Request, type NextFunction } from 'express';
import {
  createRequest,
  createResponse,
  type RequestOptions,
  type MockRequest,
  type MockResponse,
} from 'node-mocks-http';

import { validateTicketCreation, validateTicketUpdate } from './ticket.validator';
import { type TicketStatus } from '@/models/ticket.model';
import ApiError from '../api.error';

interface ExpressActions {
  request: MockRequest<Request>;
  response: MockResponse<Response>;
  next: NextFunction;
}

describe('Ticket Validators', () => {
  const createExpressActions = (reqOpts: RequestOptions): ExpressActions => {
    const next: NextFunction = jest.fn();
    const response: MockResponse<Response> = createResponse({});
    const request: MockRequest<Request> = createRequest(reqOpts);

    return { next, request, response };
  };

  describe('validateTicketCreation', () => {
    it('should call next function if request body is valid', () => {
      const { request, response, next } = createExpressActions({
        body: {
          client: 'Simple Task',
          issue: 'Running jest test is awesome!',
        },
      });

      validateTicketCreation(request, response, next);
      expect(next).toHaveBeenCalled();
    });

    it('should throw ApiError with status 400 if request body is invalid', () => {
      const { request, response, next } = createExpressActions({
        body: {
          client: 'J',
          issue: 'Running jest test is awesome!',
        },
      });

      expect(() => {
        validateTicketCreation(request, response, next);
      }).toThrow(ApiError);
      expect(next).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(0);
    });
  });

  describe('validateTicketUpdate', () => {
    it('should call next function if request body and params are valid', () => {
      const { request, response, next } = createExpressActions({
        body: {
          status: 'open' as TicketStatus,
        },
        params: {
          id: '5349b4ddd2781d08c09890f3',
        },
      });

      validateTicketUpdate(request, response, next);

      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith();
    });

    it('should throw `ApiError` with status 400 if request params are invalid', () => {
      const { request, response, next } = createExpressActions({
        body: {
          status: 'open' as TicketStatus,
        },
        params: {
          id: 'invalidId',
        },
      });

      expect(() => {
        validateTicketUpdate(request, response, next);
      }).toThrow(ApiError);
      expect(next).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should throw ApiError with status 400 if request body is invalid', () => {
      const { request, response, next } = createExpressActions({
        body: {
          status: 'INVALID_STATUS',
        },
        params: {
          id: '5349b4ddd2781d08c09890f4',
        },
      });

      expect(() => {
        validateTicketUpdate(request, response, next);
      }).toThrow(ApiError);
      expect(next).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should throw ApiError with status 400 if id has the right size, but wrong content', () => {
      const { request, response, next } = createExpressActions({
        body: {
          status: 'INVALID_STATUS',
        },
        params: {
          id: '5349b4ddd2781d0*7^!?(RB!',
        },
      });

      expect(() => {
        validateTicketUpdate(request, response, next);
      }).toThrow(ApiError);
      expect(() => {
        validateTicketUpdate(request, response, next);
      }).toThrow('The given "id", must be a valid (MongoDB) ObjectId');
      expect(next).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(0);
    });
  });
});
