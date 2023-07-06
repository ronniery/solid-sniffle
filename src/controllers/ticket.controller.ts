import { Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';
import * as ticketService from '../services/ticket.service';

const { INTERNAL_SERVER_ERROR: InternalError } = StatusCodes;

// GET /tickets
export const getAll = async (_req: Request, res: Response) => {
  try {
    // Service call, to list all tickets
    const tickets = await ticketService.getAll();

    res.status(StatusCodes.OK).send({ tickets });
  } catch (err: unknown) {
    res.status(InternalError).json(err)
  }
}

// POST: /tickets
export const createOne = async (req: Request, res: Response) => {
  const { ticket } = req.body;

  try {
    // Service call, to create a new ticket
    await ticketService.add(ticket);

    res.status(StatusCodes.OK)
  } catch (err: unknown) {
    res.status(InternalError).json(err)
  }
}

// PUT: /tickets/{id}
export const updateById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { ticket } = req.body;

  try {
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Service call, to update a ticket by it's id
    await ticketService.update(id, ticket);

    res.json(StatusCodes.OK);
  } catch (err: unknown) {
    res.status(InternalError).json(err)
  }
}