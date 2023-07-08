import Joi from 'joi';
import date from 'date-and-time';
import { type NextFunction, type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { type TicketStatus, type ITicket } from '@/models/ticket.model';
import ApiError from '../api.error';

const _validateWithSchema = (schema: Joi.Schema, target: Record<string, unknown> | string | number): void => {
  const { error } = schema.validate(target, {
    allowUnknown: false,
    abortEarly: true,
  });

  if (error != null) {
    throw new ApiError(error.message, { status: StatusCodes.BAD_REQUEST });
  }
};

export const validateTicketCreation = (req: Request, _res: Response, next: NextFunction): void => {
  const lastTwoDays = date.addDays(new Date(), -2);
  const nextTwoDays = date.addDays(new Date(), 2);
  const ticketOnBody = Joi.object({
    ticket: Joi.object<ITicket>({
      client: Joi.string().min(2).max(80).required(),
      issue: Joi.string().min(10).max(450).required(),
      status: Joi.string<TicketStatus>().optional().valid('open', 'closed').default('open'),
      deadline: Joi.date().optional().greater(lastTwoDays).less(nextTwoDays).default(new Date().toISOString()),
    })
      .required()
      .options({ allowUnknown: false }),
  })
    .required()
    .options({ allowUnknown: false });

  _validateWithSchema(ticketOnBody, req.body);

  // Call next handler
  next();
};

export const validateTicketUpdate = (req: Request, _res: Response, next: NextFunction): void => {
  const { ticket } = req.body;
  const { id: ticketId } = req.params;

  // Check if the `req.params.id` is a valid element
  const ticketIdOnParams = Joi.string()
    .required()
    .min(24)
    .regex(/^[0-9a-fA-F]{24}$/)
    .message('The given "id", must be a valid (MongoDB) ObjectId');

  _validateWithSchema(ticketIdOnParams, ticketId);

  // Check if the `req.body` ticket contains a valid status
  const ticketOnBody = Joi.object({
    status: Joi.string<TicketStatus>().required().valid('open', 'closed'),
  }).options({ allowUnknown: false });

  _validateWithSchema(ticketOnBody, ticket);

  // Call next handler
  next();
};
