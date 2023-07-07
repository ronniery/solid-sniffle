import mongoose, { Schema, type Document } from 'mongoose';

export enum Status {
  OPEN = 'open',
  CLOSED = 'closed',
}

export interface ITicket {
  _id: string;
  client: string;
  issue: string;
  status: Status;
  deadline: string;
}

export interface ITicketDocument extends Document {}

const TicketSchema: Schema = new Schema(
  {
    client: { type: String, required: true, unique: false },
    issue: { type: String, required: true },
    deadline: {
      type: String,
      required: true,
      default: () => new Date().toISOString(),
    },
    status: {
      type: String,
      required: true,
      enum: Status,
      default: Status.OPEN,
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model<ITicketDocument>('Ticket', TicketSchema);
