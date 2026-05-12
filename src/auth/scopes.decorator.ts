import { SetMetadata } from "@nestjs/common";

/**
 * Metadata key used by ScopesGuard to look up the scopes a route requires.
 */
export const SCOPES_METADATA = "scopes";

/**
 * Marks a controller class or handler as requiring all of the given OAuth
 * scopes on the bearer token. A token holding the wildcard scope `*`
 * satisfies any requirement.
 *
 * @param scopes The scopes the caller must hold.
 * @returns The custom decorator.
 */
export const Scopes = (...scopes: string[]) =>
  SetMetadata(SCOPES_METADATA, scopes);
