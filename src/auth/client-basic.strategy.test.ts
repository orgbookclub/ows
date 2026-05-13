import { UnauthorizedException } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { ClientBasicStrategy } from "./client-basic.strategy";

describe("ClientBasicStrategy", () => {
  function makeStrategy(
    validateClient: AuthService["validateClient"],
  ): ClientBasicStrategy {
    const stub = { validateClient } as unknown as AuthService;
    return new ClientBasicStrategy(stub);
  }

  it("returns the resolved authenticated client on valid credentials", async () => {
    const expected = { clientId: "gregg", scopes: ["events:read"] };
    const strategy = makeStrategy(jest.fn().mockResolvedValue(expected));

    await expect(strategy.validate("gregg", "right-secret")).resolves.toEqual(
      expected,
    );
  });

  it("throws UnauthorizedException when the validator resolves to undefined", async () => {
    const strategy = makeStrategy(jest.fn().mockResolvedValue(undefined));

    await expect(
      strategy.validate("gregg", "wrong-secret"),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
