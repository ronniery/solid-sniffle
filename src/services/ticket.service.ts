import Ticket, { ITicket } from '../models/ticket.model';

export const getAll = async () =>
  await Ticket.find({}).sort({ deadline: 'descending' });

export const findAndUpdate = async (ticketId: string, newTicket: ITicket) =>
  await Ticket.findByIdAndUpdate(ticketId, newTicket, { new: true });

export const createNew = async (ticket: ITicket) =>
  await Ticket.create(ticket);
