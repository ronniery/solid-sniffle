import request, { type Response } from 'supertest';
import { Types } from 'mongoose';
import { type Express } from 'express';
import { orderBy, isArray, size } from 'lodash';
import { StatusCodes } from 'http-status-codes';

import { factory } from '../@helpers/factories';
import { createTestHost } from '../@helpers/test.server';
import ticketModel, { type TicketStatus, type ITicket } from '../models/ticket.model';
import routes from '../routes/ticket.route';

// Not compatible with ES6 import/export
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

type Payload = Partial<ITicket> | Record<string, unknown> | undefined | null;

interface CreateFaultyTicketOptions {
  message: string | RegExp;
  status: number;
}

describe('Ticket Controller', () => {
  let server: Express;
  let modelMock: { reset: () => void } | undefined;

  beforeEach(async () => {
    server = await createTestHost(routes);
  });

  afterEach(() => {
    modelMock?.reset();
  });

  const createTicket = async (payload: Payload): Promise<Response> =>
    await request(server)
      .post('/tickets')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload as object);

  describe('(get) All tickets on route /tickets', () => {
    const getAllTickets = async (): Promise<Response> =>
      await request(server).get('/tickets').expect('Content-Type', /json/).expect(StatusCodes.OK);

    it('should get empty array of tickets', async () => {
      const { body } = await getAllTickets();

      expect(body.tickets).toBeDefined();
      expect(isArray(body.tickets)).toBeTruthy();
    });

    it('should expect tickets to have the right properties', async () => {
      const ticket = factory.ticket.build();

      // Mock model result
      modelMock = mockingoose(ticketModel).toReturn([ticket], 'find');

      const { body } = await getAllTickets();

      expect(size(body.tickets)).toEqual(1);
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

    it('should get all available tickets, unsorted', async () => {
      const _tickets = factory.ticket.buildList(
        5,
        {},
        {
          transient: { _id: new Types.ObjectId().toString() },
        }
      );

      // Mock model result
      modelMock = mockingoose(ticketModel).toReturn(_tickets, 'find');

      const { body } = await getAllTickets();

      expect(body.tickets).toBeDefined();
      expect(size(body.tickets)).toEqual(size(_tickets));
      expect(body.tickets).toEqual(expect.arrayContaining(_tickets));
    });

    it('should get all available tickets, sorted descending by date', async () => {
      const _tickets = factory.ticket.buildList(
        5,
        {},
        {
          transient: { _id: new Types.ObjectId().toString() },
        }
      );

      const descOrderedTickets = orderBy(_tickets, 'deadline', 'desc');

      modelMock = mockingoose(ticketModel).toReturn(descOrderedTickets, 'find');

      const { body } = await getAllTickets();

      expect(body.tickets).toBeDefined();
      expect(body.tickets).not.toStrictEqual(_tickets);
      expect(body.tickets).toStrictEqual(descOrderedTickets);
    });
  });

  describe('(post) Create tickets on route /tickets', () => {
    const createTicketFaulty = async (payload: Payload, options: CreateFaultyTicketOptions): Promise<void> => {
      const response = await createTicket(payload);
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
      const response = await createTicket({ ticket });

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.type).toBe('application/json');

      return response;
    };

    it('should create a new ticket', async () => {
      const ticket = factory.ticket.build();
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
    }, 900000);

    it('should return error if body has not allowed properties', async () => {
      const badTicket: Payload = { name: 'test', action: 'jest' };

      await createTicketFaulty(badTicket, {
        message: '"ticket" is required',
        status: StatusCodes.BAD_REQUEST,
      });
    }, 90000);

    it('should return error if body has not allowed properties, and ticket property', async () => {
      const ticket = factory.ticket.build();
      const badTicket: Payload = { name: 'test', ticket };

      await createTicketFaulty(badTicket, {
        message: '"name" is not allowed',
        status: StatusCodes.BAD_REQUEST,
      });
    }, 90000);

    it('should return errors if ticket client name is not valid', async () => {
      // Client name does not exists
      let { client, ...ticket } = factory.ticket.build();

      await createTicketFaulty(
        { ticket },
        {
          message: '"ticket.client" is required',
          status: StatusCodes.BAD_REQUEST,
        }
      );

      // Client name is smaller than 1 [length]
      ticket = factory.ticket.build({ client: 'a' });

      await createTicketFaulty(
        { ticket },
        {
          message: '"ticket.client" length must be at least 2 characters long',
          status: StatusCodes.BAD_REQUEST,
        }
      );

      // Client name is bigger than 80 [length]
      ticket = factory.ticket.build({ client: 'a'.padEnd(95, 'a') });

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
      let { issue, ...ticket } = factory.ticket.build();

      await createTicketFaulty(
        { ticket },
        {
          message: '"ticket.issue" is required',
          status: StatusCodes.BAD_REQUEST,
        }
      );

      // Client name is smaller than 10 [length]
      ticket = factory.ticket.build({ issue: 'aaaaaaa' });

      await createTicketFaulty(
        { ticket },
        {
          message: '"ticket.issue" length must be at least 10 characters long',
          status: StatusCodes.BAD_REQUEST,
        }
      );

      // Client name is bigger than 450 [length]
      ticket = factory.ticket.build({ issue: 'a'.padEnd(500, 'a') });

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
      const { status, ...ticket } = factory.ticket.build();

      await createTicketSuccessfully(ticket);
    });

    it('should return errors if ticket status is not valid', async () => {
      // Status has an invalid value
      const ticket = factory.ticket.build({ status: 'test' as TicketStatus });

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
      const { deadline, ...ticket } = factory.ticket.build();

      await createTicketSuccessfully(ticket);
    });

    it('should return errors if ticket deadline is not valid', async () => {
      // Deadline has an invalid value
      let ticket = factory.ticket.build({ deadline: 'test' });

      await createTicketFaulty(
        { ticket },
        {
          message: '"ticket.deadline" must be a valid date',
          status: StatusCodes.BAD_REQUEST,
        }
      );

      // Deadline is too old
      ticket = factory.ticket.build({ deadline: new Date('1980-01-01').toISOString() });

      await createTicketFaulty(
        { ticket },
        {
          message: /"ticket.deadline" must be greater than/,
          status: StatusCodes.BAD_REQUEST,
        }
      );

      // Deadline is too far in future
      ticket = factory.ticket.build({ deadline: new Date('2099-01-01').toISOString() });

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
    let createdTicket: Payload;

    beforeEach(async () => {
      const ticket = factory.ticket.build();
      const { body } = await createTicket(ticket);

      createdTicket = body;
    });

    it('should update a ticket by ID', async () => {
      modelMock = mockingoose(ticketModel).toReturn((query: any) => {
        return 'test';
      });

      console.log(createdTicket);
      // .toReturn({ answer: "puta que pariu" }, 'findOneAndUpdate');

      // const response = await request(server)
      //   .put(`/tickets/${createdTicket?._id}`)
      //   .send({
      //     ticket: {
      //       status: Status.CLOSED,
      //     },
      //   });

      // expect(response.status).toBe(StatusCodes.OK);
      // expect(response.body).toBeDefined();
      // Add more assertions based on the expected response
    }, 900000);
  });

  it('should throw an error if ticket is not found during update', async () => {
    const id = 'nonexistent-id'; // Provide a nonexistent ticket ID
    const newTicket = {
      /* Provide updated ticket data */
    };
    const response = await request(server).put(`/tickets/${id}`).send({ ticket: newTicket });
    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(response.body.error).toBeDefined();
    // Add more assertions based on the expected error response
  });
});
