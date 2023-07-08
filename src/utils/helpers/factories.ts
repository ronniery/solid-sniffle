import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import date from 'date-and-time';
import { Types } from 'mongoose';

import { type ITicket } from '@/models/ticket.model';

const withoutId = Factory.define<Omit<ITicket, '_id'>>(() => {
  const lastDays = date.addDays(new Date(), -2);
  const nextDays = date.addDays(new Date(), 2);

  return {
    client: faker.company.name(),
    status: faker.datatype.boolean() ? 'open' : 'closed',
    issue: faker.lorem.lines({ min: 1, max: 3 }),
    deadline: faker.date.between({ from: lastDays, to: nextDays }).toISOString(),
  };
});

const withId = Factory.define<ITicket>(() => ({
  ...withoutId.build(),
  _id: new Types.ObjectId(),
}));

const ticket = { withId, withoutId };

export const factory = { ticket };
