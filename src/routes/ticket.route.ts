import { Express } from 'express';
import * as ticketController from '../controllers/ticket.controller';

const prefix = '/tickets';

/* Register all routes for ticket controller */
export default (app: Express): void => {
  app.get(prefix, ticketController.getAll);
  app.put(`${prefix}/:id`, ticketController.updateById);
  app.post(prefix, ticketController.createOne);
}