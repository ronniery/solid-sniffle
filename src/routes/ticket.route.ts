import { type Express } from 'express';
import asyncHandler from 'express-async-handler';

import { validateTicketCreation, validateTicketUpdate } from '../utils/validators/ticket.validator';
import * as ticketController from '../controllers/ticket.controller';

const prefix = '/tickets';

/* Register all routes for ticket controller */
export default (app: Express): void => {
  app.get(prefix, asyncHandler(ticketController.getAllTickets));
  app.put(`${prefix}/:id`, validateTicketUpdate, asyncHandler(ticketController.updateTicket));
  app.post(prefix, validateTicketCreation, asyncHandler(ticketController.createTicket));
};
