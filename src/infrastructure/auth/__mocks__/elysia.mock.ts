// src/infrastructure/auth/__mocks__/elysia.mock.ts
export interface IMockElysia {
  middleware: Array<(ctx: any) => any>;
  derive: (handler: (ctx: any) => any) => any;
  use: (plugin: any) => IMockElysia;
}

export class MockElysia implements IMockElysia {
  middleware: Array<(ctx: any) => any> = [];

  derive(handler: (ctx: any) => any) {
    return handler;
  }

  use(plugin: any) {
    if (typeof plugin === 'function') {
      this.middleware.push(plugin);
    }
    return this;
  }
}
