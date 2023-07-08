import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type TicketStatus = 'open' | 'closed';

export interface ITicket {
  _id: string | Types.ObjectId;
  client: string;
  issue: string;
  status: TicketStatus;
  deadline: string;
}

// eslint-disable-next-line prettier/prettier
export interface ITicketDocument extends Document { }

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
      enum: ['open', 'closed'] as TicketStatus[],
      default: 'open' as TicketStatus,
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model<ITicketDocument>('Ticket', TicketSchema);
