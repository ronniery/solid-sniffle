import { type Types } from 'mongoose';
import Ticket, { type ITicketDocument, type ITicket } from '@/models/ticket.model';

export const getAllTickets = async (): Promise<ITicketDocument[]> =>
  await Ticket.find({}).sort({ deadline: 'descending' });

export const updateTicket = async (
  ticketId: string | Types.ObjectId,
  newTicket: ITicket
): Promise<ITicketDocument | null> => await Ticket.findByIdAndUpdate({ _id: ticketId }, newTicket, { new: true });

export const createTicket = async (ticket: ITicket): Promise<ITicketDocument> => await Ticket.create(ticket);
