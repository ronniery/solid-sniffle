import { type Express } from 'express';

import { registerHealthRoutes } from '@/routes/health.route';

describe('Health Route', () => {
  const methods: any = {
    get: jest.fn(),
  };

  const server: Express = methods;

  it('should register [get] /health route', async () => {
    registerHealthRoutes(server);

    expect(server.get).toHaveBeenCalled();
    expect(server.get).toHaveBeenCalledTimes(1);
  });
});
