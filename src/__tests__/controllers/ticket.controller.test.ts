import request from 'supertest';
import { Types } from 'mongoose';
import { Express } from 'express';
import { orderBy, isArray, size, first } from 'lodash';
import { StatusCodes } from 'http-status-codes';

import { factory } from '../@fixtures/factory';
import { createTestHost } from '../test.server';
import model, { ITicket } from '../../models/ticket.model';
import routes from '../../routes/ticket.route';
import { MongoMemoryServer } from 'mongodb-memory-server';

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

  describe('[GET] all tickets on /tickets', () => {
    it('should get empty array of tickets', async () => {
      const { body } = await request(server)
        .get('/tickets')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.OK);

      expect(body.tickets).toBeDefined();
      expect(isArray(body.tickets)).toBeTruthy();
    });

    it('should expect tickets to have the right properties', async () => {
      const ticket = factory.ticket.build();

      // Mock model result
      modelMock = mockingoose(model)
        .toReturn([ticket], 'find');

      const { body } = await request(server)
        .get('/tickets')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.OK);

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

      const { body } = await request(server)
        .get('/tickets')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.OK);

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

      const { body } = await request(server)
        .get('/tickets')
        .expect('Content-Type', /json/)
        .expect(StatusCodes.OK);

      expect(body.tickets).toBeDefined();
      expect(body.tickets).not.toStrictEqual(_tickets);
      expect(body.tickets).toStrictEqual(descOrderedTickets);
    });
  })



  it('should create a new ticket', async () => {
    const ticket = { /* Provide ticket data for creation */ };
    const response = await request(server).post('/tickets').send({ ticket });
    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body).toBeDefined();
    // Add more assertions based on the expected response
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