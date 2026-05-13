import { Module } from "@nestjs/common";

import { JwtKeysService } from "./jwt-keys.service";

/**
 * Tiny module that exposes `JwtKeysService` so it can be imported both
 * by `AuthModule` (where it is consumed by `JwtStrategy`) and by
 * `JwtModule.registerAsync` (where its PEMs feed the JWT signing
 * configuration). Sharing one module keeps Nest from instantiating
 * `JwtKeysService` twice and ensures every consumer agrees on the
 * active signing key and `kid`.
 */
@Module({
  providers: [JwtKeysService],
  exports: [JwtKeysService],
})
export class JwtKeysModule {}
