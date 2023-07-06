import { Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';
import { getAll, findAndUpdate, createNew } from '../services/ticket.service';
import ApiError from "../utils/api.error";

// GET /tickets
export const listAll = async (_req: Request, res: Response): Promise<void> => {
  // Service call, to list all tickets
  const tickets = await getAll();

  res.status(StatusCodes.OK).send({ tickets });
}

// POST: /tickets
export const createOne = async (req: Request, res: Response): Promise<void> => {
  const { ticket } = req.body;
  // Service call, to create a new ticket
  const createdTicket = await createNew(ticket);

  res.status(StatusCodes.CREATED).json(createdTicket);
}

// PUT: /tickets/{id}
export const updateById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { ticket: newTicket } = req.body;
  // Service call, to update a ticket by it's id
  const ticket = await findAndUpdate(id, newTicket);

  if (!ticket) {
    throw new ApiError('Ticket not found', { status: StatusCodes.NOT_FOUND })
  }

  res.status(StatusCodes.OK).json(ticket.toJSON());
}