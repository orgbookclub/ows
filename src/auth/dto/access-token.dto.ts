/* eslint-disable camelcase */

/**
 * RFC 6749 §5.1 access token response.
 */
export class AccessTokenDto {
  /**
   * The signed JWT access token.
   *
   * @example "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Imt..."
   */
  access_token: string;

  /**
   * The token type. Always `Bearer` for this flow.
   *
   * @example "Bearer"
   */
  token_type: "Bearer";

  /**
   * The token lifetime in seconds. Clients should refresh before expiry.
   *
   * @example 3600
   */
  expires_in: number;

  /**
   * The space-separated list of scopes granted on this token.
   *
   * @example "events:read users:read"
   */
  scope: string;
}
