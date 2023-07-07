import Ticket, { type ITicketDocument, type ITicket } from '../models/ticket.model';

export const getAll = async (): Promise<ITicketDocument[]> => await Ticket.find({}).sort({ deadline: 'descending' });

export const findAndUpdate = async (ticketId: string, newTicket: ITicket): Promise<ITicketDocument | null> =>
  await Ticket.findOneAndUpdate({ _id: ticketId }, newTicket, { new: true });

export const createNew = async (ticket: ITicket): Promise<ITicketDocument> => await Ticket.create(ticket);
