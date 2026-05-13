/**
 * Public JWK entry exposed at /auth/.well-known/jwks.json (RFC 7517).
 */
export class JwksKeyDto {
  /**
   * The key type. RSA for OWS.
   *
   * @example "RSA"
   */
  kty: string;

  /**
   * The intended use of the key. Always `sig` for signing.
   *
   * @example "sig"
   */
  use: string;

  /**
   * The signing algorithm associated with this key.
   *
   * @example "RS256"
   */
  alg: string;

  /**
   * The deterministic key id (RFC 7638 thumbprint).
   *
   * @example "EJxa…XlA"
   */
  kid: string;

  /**
   * The base64url-encoded RSA modulus.
   *
   * @example "0vx7agoebGcQ…"
   */
  n: string;

  /**
   * The base64url-encoded RSA public exponent.
   *
   * @example "AQAB"
   */
  e: string;
}

/**
 * The JWKS document shape exposed at /auth/.well-known/jwks.json.
 */
export class JwksDto {
  /**
   * The set of public keys verifiers can use to validate OWS-issued JWTs.
   */
  keys: JwksKeyDto[];
}
