import { Factory } from 'fishery';
import { Types } from 'mongoose';
import { faker } from '@faker-js/faker';
import date from 'date-and-time';

import { ITicket, Status } from '../../models/ticket.model';

type TicketTransientParams = {
  _id: string
}

const ticket = Factory.define<ITicket, TicketTransientParams>(({ transientParams = {} }) => {
  const lastDays = date.addDays(new Date(), -2);
  const nextDays = date.addDays(new Date(), 2);

  return {
    client: faker.company.name(),
    status: faker.datatype.boolean() ? Status.OPEN : Status.CLOSED,
    issue: faker.lorem.lines({ min: 1, max: 3 }),
    deadline: faker.date.between({ from: lastDays, to: nextDays }).toISOString(),
    ...transientParams
  }
});

export const factory = { ticket };
