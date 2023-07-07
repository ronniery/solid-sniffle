import Joi from 'joi';
import date from 'date-and-time';
import { type NextFunction, type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Status } from '../models/ticket.model';
import ApiError from '../utils/api.error';

const _validateWithSchema = (schema: Joi.Schema, target: Record<string, unknown> | string | number): void => {
  const { error } = schema.validate(target);

  if (error != null) {
    throw new ApiError(error.message, { status: StatusCodes.BAD_REQUEST });
  }
};

const _validateRequestBody = (req: Request): void => {
  const bodySchema = Joi.object({
    ticket: Joi.object().required(),
  });

  _validateWithSchema(bodySchema, req.body);
};

export const validateTicketCreation = (req: Request, _res: Response, next: NextFunction): void => {
  _validateRequestBody(req);

  const { ticket } = req.body;
  const lastTwoDays = date.addDays(new Date(), -2);
  const nextTwoDays = date.addDays(new Date(), 2);

  const ticketOnBody = Joi.object({
    client: Joi.string().min(2).max(80).required(),
    issue: Joi.string().min(10).max(450).required(),
    status: Joi.string().optional().valid(Status.OPEN, Status.CLOSED).default(Status.OPEN),
    deadline: Joi.date().optional().greater(lastTwoDays).less(nextTwoDays).default(new Date().toISOString()),
  });

  _validateWithSchema(ticketOnBody, ticket);

  // Call next handler
  next();
};

export const validateTicketUpdate = (req: Request, _res: Response, next: NextFunction): void => {
  _validateRequestBody(req);

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
    status: Joi.string().required().valid(Status.OPEN, Status.CLOSED),
  }).options({ allowUnknown: false });

  _validateWithSchema(ticketOnBody, ticket);

  // Call next handler
  next();
};
