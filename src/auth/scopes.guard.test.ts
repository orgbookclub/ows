import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { Scopes } from "./scopes.decorator";
import { ScopesGuard } from "./scopes.guard";

function buildContext(
  handler: (...args: unknown[]) => unknown,
  user: unknown,
  cls: { new (): unknown } = class {},
): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => cls,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe("ScopesGuard", () => {
  const reflector = new Reflector();
  const guard = new ScopesGuard(reflector);

  it("allows requests on routes with no @Scopes() metadata", () => {
    const handler = () => undefined;
    expect(guard.canActivate(buildContext(handler, undefined))).toBe(true);
  });

  it("rejects with 401 when a scoped route has no req.user", () => {
    class Cls {}
    Scopes("events:read")(Cls);
    const handler = () => undefined;
    expect(() =>
      guard.canActivate(buildContext(handler, undefined, Cls)),
    ).toThrow(UnauthorizedException);
  });

  it("rejects with 403 when required scopes are missing", () => {
    class Cls {}
    Scopes("events:write")(Cls);
    const handler = () => undefined;
    const ctx = buildContext(
      handler,
      { clientId: "mcp", scopes: ["events:read"] },
      Cls,
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("allows requests holding all required scopes", () => {
    class Cls {}
    Scopes("events:read", "users:read")(Cls);
    const handler = () => undefined;
    const ctx = buildContext(
      handler,
      { clientId: "mcp", scopes: ["events:read", "users:read"] },
      Cls,
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("treats the wildcard scope * as satisfying any requirement", () => {
    class Cls {}
    Scopes("migrations:run")(Cls);
    const handler = () => undefined;
    const ctx = buildContext(handler, { clientId: "dev", scopes: ["*"] }, Cls);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("prefers the handler-level metadata over the class-level one", () => {
    class Cls {}
    Scopes("migrations:run")(Cls);
    const handler = () => undefined;
    Scopes("events:read")(handler);
    const ctx = buildContext(
      handler,
      { clientId: "mcp", scopes: ["events:read"] },
      Cls,
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
