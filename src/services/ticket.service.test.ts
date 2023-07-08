import { orderBy, random, size } from 'lodash';

import { connect, disconnect, dropCollections } from '@/utils/helpers/test.db';
import TicketModel, { type ITicketDocument, type ITicket, type TicketStatus } from '@/models/ticket.model';
import { getAll, add, update } from './ticket.service';
import { factory } from '@/utils/helpers/factories';

describe('Ticket Service', () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await disconnect();
  });

  afterEach(async () => {
    await dropCollections();
  });

  describe('getAll', () => {
    let tickets: ITicket[] = [];

    beforeEach(async () => {
      const numberOfTickets = random(5, 20, false);
      const factoryTickets = factory.ticket.buildList(numberOfTickets);

      await TicketModel.insertMany(factoryTickets);

      tickets = factoryTickets;
    });

    const convertDocumentsToTickets = (documents: ITicketDocument[]): ITicket[] =>
      documents.map((document) => document.toJSON());

    it('should return all tickets in a natural order', async () => {
      const allTickets = await getAll().then(convertDocumentsToTickets);

      expect(size(allTickets)).toEqual(size(tickets));
      expect(allTickets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            client: expect.any(String),
            issue: expect.any(String),
            deadline: expect.any(String),
            status: expect.any(String),
          }),
        ])
      );
    });

    it('should return all tickets in descending order of deadline', async () => {
      const orderedTickets = orderBy(tickets, 'deadline', 'desc');
      const allTickets = await getAll().then(convertDocumentsToTickets);

      expect(size(allTickets)).toEqual(size(tickets));
      expect(allTickets).not.toEqual(tickets);
      expect(allTickets).toStrictEqual(orderedTickets);
    });
  });

  describe('findAndUpdate', () => {
    it('should find and update a ticket with the new ticket data', async () => {
      const oldTicket = factory.ticket.build();
      const nextTicket: ITicket = {
        ...oldTicket,
        status: 'illegal' as TicketStatus,
        client: 'jest',
        deadline: '1999-01-01',
        issue: 'no-issue',
      };

      await TicketModel.create(oldTicket);
      const updatedTicket = await update(nextTicket._id, nextTicket);

      expect(updatedTicket).toBeDefined();
      expect(updatedTicket?.toJSON()).toEqual(nextTicket);
      expect(updatedTicket?.toJSON()).not.toEqual(oldTicket);
    });
  });

  describe('createNew', () => {
    it('should create a new ticket', async () => {
      const ticket: ITicket = factory.ticket.build();
      const createdTicket = await add(ticket);
      const foundTicket = await TicketModel.findOne({ _id: createdTicket._id });

      expect(foundTicket).toBeDefined();
      expect(createdTicket.toJSON()).toEqual(ticket);
    });
  });
});
