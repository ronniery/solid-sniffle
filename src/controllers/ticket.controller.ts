import { type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { getAll, findAndUpdate, createNew } from '../services/ticket.service';
import ApiError from '../utils/api.error';

// GET /tickets
export const getAllTickets = async (_req: Request, res: Response): Promise<void> => {
  await getAll().then((tickets = []) => {
    res.status(StatusCodes.OK).json({ tickets });
  });
};

// POST: /tickets
export const createTicket = async (req: Request, res: Response): Promise<void> => {
  const { ticket } = req.body;
  const createdTicket = await createNew(ticket);

  res.status(StatusCodes.CREATED).json(createdTicket);
};

// PUT: /tickets/{id}
export const updateTicketById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { ticket: newTicket } = req.body;
  const ticket = await findAndUpdate(id, newTicket);

  if (ticket == null) {
    throw new ApiError('Ticket not found', { status: StatusCodes.NOT_FOUND });
  }

  res.status(StatusCodes.OK).json(ticket.toJSON());
};
