import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthModule } from "./auth/auth.module";
import { BookInfoModule } from "./book-info/book-info.module";
import { BooksModule } from "./books/books.module";
import { MongooseCastErrorFilter } from "./common/filters/mongoose-cast-error.filter";
import { EventsModule } from "./events/events.module";
import { HealthModule } from "./health/health.module";
import { LoggerModule } from "./logger/logger.module";
import { McpModule } from "./mcp/mcp.module";
import { MigrationsModule } from "./migrations/migrations.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { UsersModule } from "./users/users.module";

/**
 *
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".development.env", ".prod.env"],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_URI"),
      }),
    }),
    BookInfoModule,
    BooksModule,
    EventsModule,
    UsersModule,
    ReviewsModule,
    AuthModule,
    MigrationsModule,
    HealthModule,
    LoggerModule,
    McpModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: MongooseCastErrorFilter,
    },
  ],
})
export class AppModule {}
