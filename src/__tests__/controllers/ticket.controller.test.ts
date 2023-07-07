import request from 'supertest';
import { Types } from 'mongoose';
import { Express } from 'express';
import { orderBy, isArray, size, first, isObject } from 'lodash';
import { StatusCodes } from 'http-status-codes';

import { factory } from '../@fixtures/factory';
import { createTestHost } from '../test.server';
import model, { ITicket, Status } from '../../models/ticket.model';
import routes from '../../routes/ticket.route';

// Not compatible with ES6 import/export
const mockingoose = require('mockingoose');

describe('Ticket Controller', () => {
  let server: Express;
  let modelMock: { reset: () => {} } | undefined;

  beforeEach(async () => {
    server = await createTestHost(routes);
  });

  afterEach(() => {
    modelMock?.reset();
  })

  describe('/GET/ All tickets on route /tickets', () => {
    const getAllTickets = async () =>
      request(server)
        .get('/tickets')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.OK);

    it('should get empty array of tickets', async () => {
      const { body } = await getAllTickets();

      expect(body.tickets).toBeDefined();
      expect(isArray(body.tickets)).toBeTruthy();
    });

    it('should expect tickets to have the right properties', async () => {
      const ticket = factory.ticket.build();

      // Mock model result
      modelMock = mockingoose(model)
        .toReturn([ticket], 'find');

      const { body } = await getAllTickets();

      expect(size(body.tickets)).toEqual(1);
      expect(body.tickets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            client: expect.any(String),
            issue: expect.any(String),
            deadline: expect.any(String),
            status: expect.any(String),
            _id: expect.any(String)
          })
        ])
      )
    })

    it('should get all available tickets, unsorted', async () => {
      const _tickets = factory.ticket.buildList(5, {}, {
        transient: { _id: new Types.ObjectId().toString() }
      })

      // Mock model result
      modelMock = mockingoose(model)
        .toReturn(_tickets, 'find');

      const { body } = await getAllTickets();

      expect(body.tickets).toBeDefined();
      expect(size(body.tickets)).toEqual(size(_tickets));
      expect(body.tickets).toEqual(expect.arrayContaining(_tickets));
    });

    it('should get all available tickets, sorted descending by date', async () => {
      const _tickets = factory.ticket.buildList(5, {}, {
        transient: { _id: new Types.ObjectId().toString() }
      })

      const descOrderedTickets = orderBy(_tickets, 'deadline', 'desc');

      modelMock = mockingoose(model)
        .toReturn(descOrderedTickets, 'find');

      const { body } = await getAllTickets();

      expect(body.tickets).toBeDefined();
      expect(body.tickets).not.toStrictEqual(_tickets);
      expect(body.tickets).toStrictEqual(descOrderedTickets);
    });
  });

  describe('/POST/ Create tickets on route /tickets', () => {
    const createTicket = async (ticket: Partial<ITicket>) =>
      request(server)
        .post('/tickets')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ ticket })

    const createFailTicket = async (ticket: Partial<ITicket>, { message, status }: { message: string | RegExp, status: number }) => {
      const response = await createTicket(ticket);
      const { body, error, status: httpStatus, type } = response;

      expect(type).toBe('application/json');
      expect(httpStatus).toBe(status);

      expect(body).toBeDefined();
      expect(body).toEqual(
        expect.objectContaining({
          error: expect.any(String),
          status: expect.any(Number)
        })
      );
      expect(body.error).toMatch(message);
      expect(body.status).toBe(status);
      expect(error).toBeDefined();
    }

    const createSuccessTicket = async (ticket: Partial<ITicket>) => {
      const response = await createTicket(ticket);

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.type).toBe('application/json');

      return response;
    }

    it('should create a new ticket', async () => {
      const ticket = factory.ticket.build();
      const { body, status } = await createSuccessTicket(ticket);

      expect(status).toBe(StatusCodes.CREATED);
      expect(body).toBeDefined();
    });

    it('should return error if body is empty', async () => {
      await createFailTicket({}, {
        message: "\"ticket\" is required",
        status: StatusCodes.BAD_REQUEST
      });
    });

    it('should return errors if ticket client name is not valid', async () => {
      // Client name does not exists
      let { client, ...ticket } = factory.ticket.build();

      await createFailTicket(ticket, {
        message: "\"client\" is required",
        status: StatusCodes.BAD_REQUEST
      });

      // Client name is smaller than 1 [length]
      ticket = factory.ticket.build({ client: 'a' });

      await createFailTicket(ticket, {
        message: "\"client\" length must be at least 2 characters long",
        status: StatusCodes.BAD_REQUEST
      });

      // Client name is bigger than 80 [length]
      ticket = factory.ticket.build({ client: 'a'.padEnd(95, 'a') });

      await createFailTicket(ticket, {
        message: "\"client\" length must be less than or equal to 80 characters long",
        status: StatusCodes.BAD_REQUEST
      });
    });

    it('should return errors if ticket issue is not valid', async () => {
      // Issue does not exists
      let { issue, ...ticket } = factory.ticket.build();

      await createFailTicket(ticket, {
        message: "\"issue\" is required",
        status: StatusCodes.BAD_REQUEST
      });

      // Client name is smaller than 10 [length]
      ticket = factory.ticket.build({ issue: 'aaaaaaa' });

      await createFailTicket(ticket, {
        message: "\"issue\" length must be at least 10 characters long",
        status: StatusCodes.BAD_REQUEST
      });

      // Client name is bigger than 450 [length]
      ticket = factory.ticket.build({ issue: 'a'.padEnd(500, 'a') });

      await createFailTicket(ticket, {
        message: "\"issue\" length must be less than or equal to 450 characters long",
        status: StatusCodes.BAD_REQUEST
      });
    });

    it('should create ticket if its status does not exists', async () => {
      // Status does not exists inside ticket
      let { status, ...ticket } = factory.ticket.build();

      await createSuccessTicket(ticket);
    });

    it('should return errors if ticket status is not valid', async () => {
      // Status has an invalid value
      const ticket = factory.ticket.build({ status: 'test' as Status });

      await createFailTicket(ticket, {
        message: "\"status\" must be one of [open, closed]",
        status: StatusCodes.BAD_REQUEST
      });
    });

    it('should create ticket if its deadline does not exists', async () => {
      // Deadline does not exists inside ticket
      let { deadline, ...ticket } = factory.ticket.build();

      await createSuccessTicket(ticket);
    });

    it('should return errors if ticket deadline is not valid', async () => {
      // Deadline has an invalid value
      let ticket = factory.ticket.build({ deadline: 'test' });

      await createFailTicket(ticket, {
        message: "\"deadline\" must be a valid date",
        status: StatusCodes.BAD_REQUEST
      });

      // Deadline is too old
      ticket = factory.ticket.build({ deadline: new Date('1980-01-01').toISOString() });

      await createFailTicket(ticket, {
        message: /\"deadline\" must be greater than/,
        status: StatusCodes.BAD_REQUEST
      });

      // Deadline is too far in future
      ticket = factory.ticket.build({ deadline: new Date('2099-01-01').toISOString() });

      await createFailTicket(ticket, {
        message: /\"deadline\" must be less than/,
        status: StatusCodes.BAD_REQUEST
      });

    });
  });

  it('should update a ticket by ID', async () => {
    const id = '123'; // Provide a valid ticket ID
    const newTicket = { /* Provide updated ticket data */ };
    const response = await request(server).put(`/tickets/${id}`).send({ ticket: newTicket });
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toBeDefined();
    // Add more assertions based on the expected response
  });

  it('should throw an error if ticket is not found during update', async () => {
    const id = 'nonexistent-id'; // Provide a nonexistent ticket ID
    const newTicket = { /* Provide updated ticket data */ };
    const response = await request(server).put(`/tickets/${id}`).send({ ticket: newTicket });
    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(response.body.error).toBeDefined();
    // Add more assertions based on the expected error response
  });
});