import { type Express } from 'express';

import { registerTicketRoutes } from '@/routes/ticket.route';

describe('Ticket Routes', () => {
  const methods: any = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  };

  let server: Express;

  beforeEach(() => {
    server = methods;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should register [get] /ticket routes', async () => {
    registerTicketRoutes(server);

    expect(server.get).toHaveBeenCalled();
    expect(server.get).toHaveBeenCalledTimes(1);
  });

  it('should register [post] /ticket routes', async () => {
    registerTicketRoutes(server);

    expect(server.post).toHaveBeenCalled();
    expect(server.post).toHaveBeenCalledTimes(1);
  });

  it('should register [put] /ticket routes', async () => {
    registerTicketRoutes(server);

    expect(server.put).toHaveBeenCalled();
    expect(server.put).toHaveBeenCalledTimes(1);
  });
});
