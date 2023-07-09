import { type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import ApiError from '@/utils/api.error';
import {
  getAllTickets as getAllTicketsServiceCall,
  updateTicket as updateTicketServiceCall,
  createTicket as createTicketServiceCall,
} from '@/services/ticket.service';

// GET /tickets
export const getAllTickets = async (_req: Request, res: Response): Promise<void> => {
  await getAllTicketsServiceCall().then((tickets = []) => {
    res.status(StatusCodes.OK).json({ tickets });
  });
};

// POST: /tickets
export const createTicket = async (req: Request, res: Response): Promise<void> => {
  const { ticket } = req.body;
  const createdTicket = await createTicketServiceCall(ticket);

  res.status(StatusCodes.CREATED).json(createdTicket);
};

// PUT: /tickets/{id}
export const updateTicket = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { ticket: newTicket } = req.body;
  const ticket = await updateTicketServiceCall(id, newTicket);

  if (ticket == null) {
    throw new ApiError('Ticket not found', { status: StatusCodes.NOT_FOUND });
  }

  res.status(StatusCodes.OK).json(ticket.toJSON());
};
