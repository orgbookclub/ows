import { UnauthorizedException } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { ClientPasswordStrategy } from "./client-password.strategy";

describe("ClientPasswordStrategy", () => {
  function makeStrategy(
    validateClient: AuthService["validateClient"],
  ): ClientPasswordStrategy {
    const stub = { validateClient } as unknown as AuthService;
    return new ClientPasswordStrategy(stub);
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

  it("awaits the validator instead of evaluating the unresolved Promise as truthy", async () => {
    let resolveValidate: (value: undefined) => void = () => undefined;
    const validate = jest.fn(
      () => new Promise<undefined>((res) => (resolveValidate = res)),
    );
    const strategy = makeStrategy(validate);

    const pending = strategy.validate("gregg", "wrong");
    resolveValidate(undefined);

    await expect(pending).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
