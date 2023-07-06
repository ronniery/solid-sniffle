import Ticket, { ITicket } from '../models/ticket.model';

export const getAll = async () =>
  await Ticket.find({});

export const update = async (ticketId: string, ticket: ITicket) =>
  await Ticket.findByIdAndUpdate(ticketId, ticket);

export const add = async (ticket: ITicket) =>
  await Ticket.create(ticket);

export const getById = async (ticketId: string) =>
  await Ticket.findOne({ id: ticketId });
