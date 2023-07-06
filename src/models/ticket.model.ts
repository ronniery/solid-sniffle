import mongoose, { Schema, Document } from 'mongoose';

export enum Status {
  OPEN = 'open',
  CLOSED = 'closed'
}

export interface ITicket extends Document {
  client: string;
  issue: string;
  status: Status;
  deadline: Date;
}

const TicketSchema: Schema = new Schema({
  client: { type: String, required: true, unique: false },
  issue: { type: String, required: true },
  deadline: {
    type: Date,
    required: true,
    default: () => new Date(+new Date() + 2 * 24 * 60 * 60 * 1000) // Defaults to 2 days in the future
  },
  status: {
    type: String,
    required: true,
    enum: Status,
    default: Status.OPEN
  }
}, { versionKey: false });

export default mongoose.model<ITicket>('Ticket', TicketSchema);