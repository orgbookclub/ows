import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthModule } from "./auth/auth.module";
import { BookInfoModule } from "./book-info/book-info.module";
import { BooksModule } from "./books/books.module";
import { EventsModule } from "./events/events.module";
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
