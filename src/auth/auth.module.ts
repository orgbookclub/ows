import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ClientBasicStrategy } from "./client-basic.strategy";
import { ClientPasswordStrategy } from "./client-password.strategy";
import { ClientRegistryService } from "./client-registry.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { JwtKeysService } from "./jwt-keys.service";
import { JwtStrategy } from "./jwt.strategy";
import { ScopesGuard } from "./scopes.guard";

const ACCESS_TOKEN_TTL_SECONDS = 3600;
const TOKEN_ISSUER = "ows";
const TOKEN_AUDIENCE = "ows-api";

/**
 * The Auth Module.
 * Responsible for handling authentication, and auth guards.
 */
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const keys = new JwtKeysService(configService);
        return {
          privateKey: keys.getPrivateKeyPem(),
          publicKey: keys.getPublicKeyPem(),
          signOptions: {
            algorithm: "RS256",
            expiresIn: ACCESS_TOKEN_TTL_SECONDS,
            issuer: TOKEN_ISSUER,
            audience: TOKEN_AUDIENCE,
            keyid: keys.getKid(),
          },
          verifyOptions: {
            algorithms: ["RS256"],
            issuer: TOKEN_ISSUER,
            audience: TOKEN_AUDIENCE,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ClientBasicStrategy,
    ClientPasswordStrategy,
    ClientRegistryService,
    JwtKeysService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ScopesGuard,
    },
    {
      provide: "ACCESS_TOKEN_TTL_SECONDS",
      useValue: ACCESS_TOKEN_TTL_SECONDS,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
