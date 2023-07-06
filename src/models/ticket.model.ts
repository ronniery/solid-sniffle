import mongoose, { Schema, Document } from 'mongoose';

export enum Status {
  OPEN = 'open',
  CLOSED = 'closed',
}

export interface ITicket extends Document {
  client: string;
  issue: string;
  status: Status;
  deadline: Date;
}

const TicketSchema: Schema = new Schema(
  {
    client: { type: String, required: true, unique: false },
    issue: { type: String, required: true },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Status,
      default: Status.OPEN,
    },
  },
  { versionKey: false }
);

export default mongoose.model<ITicket>('Ticket', TicketSchema);
