import { ITicket } from "../models/ticket.model";

// to make the file a module and avoid the TypeScript error
export { }

declare global {
  namespace Express {
    export interface Request {
      body: {
        ticket?: ITicket
      };
      params: {
        id?: string
      };
    }
  }
}