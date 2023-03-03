/* eslint-disable camelcase */

/**
 * Dto for the client credentials
 */
export class ClientCredentialsDto {
  /**
   * The grant type.
   *
   * @example "client_credentials"
   */
  grant_type: "client_credentials";
  /**
   * The Client ID.
   *
   * @example "client_id"
   */
  client_id: string;
  /**
   * The client secret.
   *
   * @example "clientSecret"
   */
  client_secret: string;
}
