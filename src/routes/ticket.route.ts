import { Express } from 'express';
import asyncHandler from 'express-async-handler';
import * as ticketController from '../controllers/ticket.controller';

const prefix = '/tickets';

/* Register all routes for ticket controller */
export default (app: Express): void => {
  app.get(prefix, asyncHandler(ticketController.listAll));
  app.put(`${prefix}/:id`, asyncHandler(ticketController.updateById));
  app.post(prefix, asyncHandler(ticketController.createOne));
}