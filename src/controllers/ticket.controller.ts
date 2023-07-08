import { type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { getAll, update, add } from '../services/ticket.service';
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
  const createdTicket = await add(ticket);

  res.status(StatusCodes.CREATED).json(createdTicket);
};

// PUT: /tickets/{id}
export const updateTicket = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { ticket: newTicket } = req.body;
  const ticket = await update(id, newTicket);

  if (ticket == null) {
    throw new ApiError('Ticket not found', { status: StatusCodes.NOT_FOUND });
  }

  res.status(StatusCodes.OK).json(ticket.toJSON());
};
