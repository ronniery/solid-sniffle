import mongoose, { Schema, Document } from 'mongoose';

export enum Status {
  OPEN = 'open',
  CLOSED = 'closed'
}

export interface ITicket extends Document {
  client: string;
  issue: string;
  status: Status;
}

const TicketSchema: Schema = new Schema({
  client: { type: String, required: true, unique: true },
  issue: { type: String, required: true },
  status: { type: Number, required: true, enum: Status }
});

export default mongoose.model<ITicket>('Ticket', TicketSchema);