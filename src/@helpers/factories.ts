import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import date from 'date-and-time';

import { type ITicket } from '../models/ticket.model';
import { Types } from 'mongoose';

interface TicketTransientParams {
  _id: string;
}

const ticket = Factory.define<ITicket, TicketTransientParams>(() => {
  const lastDays = date.addDays(new Date(), -2);
  const nextDays = date.addDays(new Date(), 2);

  return {
    client: faker.company.name(),
    status: faker.datatype.boolean() ? 'open' : 'closed',
    issue: faker.lorem.lines({ min: 1, max: 3 }),
    deadline: faker.date.between({ from: lastDays, to: nextDays }).toISOString(),
    _id: new Types.ObjectId(),
  };
});

export const factory = { ticket };
