import Ticket, { type ITicket } from '../models/ticket.model';

export const getAll = async () => await Ticket.find({}).sort({ deadline: 'descending' });

export const findAndUpdate = async (ticketId: string, newTicket: ITicket) =>
  await Ticket.findOneAndUpdate({ _id: ticketId }, newTicket, { new: true });

export const createNew = async (ticket: ITicket) => await Ticket.create(ticket);
