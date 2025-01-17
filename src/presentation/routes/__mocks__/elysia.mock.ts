type Handler = Function;
type RouteOptions = any;

export interface IMockElysia {
  routes: Record<string, Handler>;
  errorHandler: Handler;
  group: (path: string, handler: (app: IMockElysia) => any) => IMockElysia;
  post: (path: string, handler: Handler, options?: RouteOptions) => IMockElysia;
  onError: (handler: Handler) => IMockElysia;
  use: (middleware: Handler) => IMockElysia;
  handle: (request: Request) => Promise<Response>;
}

export class MockElysia implements IMockElysia {
  routes: Record<string, Handler> = {};
  errorHandler: Handler = () => { };

  group(path: string, handler: (app: IMockElysia) => any) {
    return handler(this);
  }

  post(path: string, handler: Handler, _options?: RouteOptions) {
    this.routes[path] = handler;
    return this;
  }

  onError(handler: Handler) {
    this.errorHandler = handler;
    return this;
  }

  use(_middleware: Handler) {
    return this;
  }

  async handle(request: Request) {
    const path = new URL(request.url).pathname.replace('/auth', '');
    const handler = this.routes[path];

    if (!handler) {
      return new Response('Not Found', { status: 404 });
    }

    try {
      const body = request.method !== 'GET' ? await request.json() : undefined;
      const result = await handler({
        jwt: {
          sign: async () => 'mock.jwt.token',
          verify: async () => ({ userId: '123', email: 'test@example.com' })
        },
        body,
        cookie: {
          auth: {
            set: () => { },
            remove: () => { }
          }
        }
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return this.errorHandler({ error });
    }
  }
}
