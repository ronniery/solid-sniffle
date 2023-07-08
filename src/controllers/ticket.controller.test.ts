import request, { type Response } from 'supertest';
import { type Express } from 'express';
import { orderBy, isArray, size, random, get } from 'lodash';
import { StatusCodes } from 'http-status-codes';

import { factory } from '@/utils/helpers/factories';
import { createTestHost } from '@/utils/helpers/test.server';
import TicketModel, { type TicketStatus, type ITicket } from '@/models/ticket.model';
import { registerTicketRoutes } from '@/routes/ticket.route';
import { connect, disconnect, dropCollections } from '@/utils/helpers/test.db';

interface CreateFaultyTicketOptions {
  message: string | RegExp;
  status: number;
}

const createTicket = async (server: Express, payload: Partial<Record<string, unknown>>): Promise<Response> =>
  await request(server)
    .post('/tickets')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(payload as object);

describe('Ticket Controller', () => {
  let server: Express;

  beforeEach(async () => {
    server = await createTestHost(registerTicketRoutes);
  });

  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await disconnect();
  });

  afterEach(async () => {
    await dropCollections();
  });

  describe('(get) All tickets on route /tickets', () => {
    const getAllTickets = async (): Promise<Response> =>
      await request(server).get('/tickets').expect('Content-Type', /json/).expect(StatusCodes.OK);

    let tickets: Array<Partial<ITicket>> = [];

    beforeEach(async () => {
      tickets = factory.ticket.withId.buildList(random(3, 20, false));

      await TicketModel.insertMany(tickets);
    });

    it('should get empty array of tickets', async () => {
      // Let's first remove everything inside database;
      await TicketModel.deleteMany();

      const { body } = await getAllTickets();

      expect(body.tickets).toBeDefined();
      expect(isArray(body.tickets)).toBeTruthy();
    });

    it('should expect tickets to have the right properties', async () => {
      const { body } = await getAllTickets();

      expect(size(body.tickets)).toBe(size(tickets));
      expect(body.tickets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            client: expect.any(String),
            issue: expect.any(String),
            deadline: expect.any(String),
            status: expect.any(String),
            _id: expect.any(String),
          }),
        ])
      );
    });

    it('should get all available tickets, sorted descending by date', async () => {
      const descOrderedTickets = orderBy(tickets, 'deadline', 'desc').map(({ _id, ...ticket }) => ({
        ...ticket,
        _id: _id?.toString(),
      }));

      const { body } = await getAllTickets();

      expect(body.tickets).toBeDefined();
      expect(body.tickets).not.toStrictEqual(tickets);
      expect(body.tickets).toStrictEqual(descOrderedTickets);
    });
  });

  describe('(post) Create tickets on route /tickets', () => {
    const createTicketFaulty = async (
      payload: Partial<Record<string, unknown>>,
      options: CreateFaultyTicketOptions
    ): Promise<void> => {
      const response = await createTicket(server, payload);
      const { message, status } = options;
      const { body, error, status: httpStatus, type } = response;

      expect(type).toBe('application/json');
      expect(httpStatus).toBe(status);

      expect(body).toBeDefined();
      expect(body).toEqual(
        expect.objectContaining({
          error: expect.any(String),
          status: expect.any(Number),
        })
      );

      expect(body.error).toMatch(message);
      expect(body.status).toBe(status);
      expect(error).toBeDefined();
    };

    const createTicketSuccessfully = async (ticket: Partial<ITicket>): Promise<Response> => {
      const response = await createTicket(server, { ticket });

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.type).toBe('application/json');

      return response;
    };

    it('should create a new ticket', async () => {
      const ticket = factory.ticket.withoutId.build();
      const { body, status } = await createTicketSuccessfully(ticket);

      expect(status).toBe(StatusCodes.CREATED);
      expect(body).toBeDefined();
    });

    it('should return error if body is nullable value', async () => {
      const ticket = null;

      await createTicketFaulty(
        { ticket },
        {
          message: '"ticket" must be of type object',
          status: StatusCodes.BAD_REQUEST,
        }
      );
    });

    it('should return error if body has not allowed properties', async () => {
      const badTicket = { name: 'test', action: 'jest' };

      await createTicketFaulty(badTicket, {
        message: '"ticket" is required',
        status: StatusCodes.BAD_REQUEST,
      });
    });

    it('should return error if body has not allowed properties, and ticket property', async () => {
      const ticket = factory.ticket.withoutId.build();
      const badTicket = { name: 'test', ticket };

      await createTicketFaulty(badTicket, {
        message: '"name" is not allowed',
        status: StatusCodes.BAD_REQUEST,
      });
    });

    it('should return errors if ticket client name is not valid', async () => {
      // Client name does not exists
      let { client, ...ticket } = factory.ticket.withoutId.build();

      await createTicketFaulty(
        { ticket },
        {
          message: '"ticket.client" is required',
          status: StatusCodes.BAD_REQUEST,
        }
      );

      // Client name is smaller than 1 [length]
      ticket = factory.ticket.withoutId.build({ client: 'a' });

      await createTicketFaulty(
        { ticket },
        {
          message: '"ticket.client" length must be at least 2 characters long',
          status: StatusCodes.BAD_REQUEST,
        }
      );

      // Client name is bigger than 80 [length]
      ticket = factory.ticket.withoutId.build({ client: 'a'.padEnd(95, 'a') });

      await createTicketFaulty(
        { ticket },
        {
          message: '"ticket.client" length must be less than or equal to 80 characters long',
          status: StatusCodes.BAD_REQUEST,
        }
      );
    });

    it('should return errors if ticket issue is not valid', async () => {
      // Issue does not exists
      let { issue, ...ticket } = factory.ticket.withoutId.build();

      await createTicketFaulty(
        { ticket },
        {
          message: '"ticket.issue" is required',
          status: StatusCodes.BAD_REQUEST,
        }
      );

      // Client name is smaller than 10 [length]
      ticket = factory.ticket.withoutId.build({ issue: 'aaaaaaa' });

      await createTicketFaulty(
        { ticket },
        {
          message: '"ticket.issue" length must be at least 10 characters long',
          status: StatusCodes.BAD_REQUEST,
        }
      );

      // Client name is bigger than 450 [length]
      ticket = factory.ticket.withoutId.build({ issue: 'a'.padEnd(500, 'a') });

      await createTicketFaulty(
        { ticket },
        {
          message: '"ticket.issue" length must be less than or equal to 450 characters long',
          status: StatusCodes.BAD_REQUEST,
        }
      );
    });

    it('should create ticket if its status does not exists', async () => {
      // Status does not exists inside ticket
      const { status, ...ticket } = factory.ticket.withoutId.build();

      await createTicketSuccessfully(ticket);
    });

    it('should return errors if ticket status is not valid', async () => {
      // Status has an invalid value
      const ticket = factory.ticket.withoutId.build({ status: 'test' as TicketStatus });

      await createTicketFaulty(
        { ticket },
        {
          message: '"ticket.status" must be one of [open, closed]',
          status: StatusCodes.BAD_REQUEST,
        }
      );
    });

    it('should create ticket if its deadline does not exists', async () => {
      // Deadline does not exists inside ticket
      const { deadline, ...ticket } = factory.ticket.withoutId.build();

      await createTicketSuccessfully(ticket);
    });

    it('should return errors if ticket deadline is not valid', async () => {
      // Deadline has an invalid value
      let ticket = factory.ticket.withoutId.build({ deadline: 'test' });

      await createTicketFaulty(
        { ticket },
        {
          message: '"ticket.deadline" must be a valid date',
          status: StatusCodes.BAD_REQUEST,
        }
      );

      // Deadline is too old
      ticket = factory.ticket.withoutId.build({ deadline: new Date('1980-01-01').toISOString() });

      await createTicketFaulty(
        { ticket },
        {
          message: /"ticket.deadline" must be greater than/,
          status: StatusCodes.BAD_REQUEST,
        }
      );

      // Deadline is too far in future
      ticket = factory.ticket.withoutId.build({ deadline: new Date('2099-01-01').toISOString() });

      await createTicketFaulty(
        { ticket },
        {
          message: /"ticket.deadline" must be less than/,
          status: StatusCodes.BAD_REQUEST,
        }
      );
    });
  });

  describe('(put) Update ticket on route /tickets/:id', () => {
    let createdTicket: ITicket;

    beforeEach(async () => {
      const ticket = factory.ticket.withoutId.build();
      const { body } = await createTicket(server, { ticket });

      createdTicket = body;
    });

    it('should update a ticket by ID', async () => {
      const ticketId = get<ITicket, string>(createdTicket, '_id').toString();
      const response = await request(server)
        .put('/tickets/'.concat(ticketId))
        .send({
          ticket: {
            status: 'closed',
          },
        });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toBeDefined();

      expect(response.body).toHaveProperty('client', createdTicket.client);
      expect(response.body).toHaveProperty('issue', createdTicket.issue);
      expect(response.body).toHaveProperty('deadline', createdTicket.deadline);
      expect(response.body).toHaveProperty('_id', createdTicket._id);
    });

    it('should return an error, if we pass an invalid ID', async () => {
      const response = await request(server)
        .put('/tickets/invalid')
        .send({
          ticket: {
            status: 'closed',
          },
        });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.error).toBe('"value" length must be at least 24 characters long');
    });

    it('should return an error, if we pass an ObjectID invalid', async () => {
      const response = await request(server)
        .put('/tickets/507f191e810c19729de81111')
        .send({
          ticket: {
            status: 'closed',
          },
        });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.error).toBe('Ticket not found');
    });
  });
});
