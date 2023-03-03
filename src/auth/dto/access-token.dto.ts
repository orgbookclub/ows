/**
 * The access token DTO.
 */
export class AccessTokenDto {
  /**
   * The JWT access token.
   *
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4MTMwNTkyOTc5OTAxNDgwOTYiLCJpYXQiOjE2Nzc4NTM4MDl9.KUIv6nH97m8cER_m0bj09HVxGUmajKY35rDkKY8JI5o"
   */
  // eslint-disable-next-line camelcase
  access_token: string;
}
