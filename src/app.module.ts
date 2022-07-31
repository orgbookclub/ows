import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { BookInfoModule } from "./book-info/book-info.module";
import { BookListsModule } from "./book-lists/book-lists.module";
import { BooksModule } from "./books/books.module";
import { EventGroupsModule } from "./event-groups/event-groups.module";
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
    BookListsModule,
    EventGroupsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
