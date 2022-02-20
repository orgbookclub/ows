import { Module } from '@nestjs/common';
import { GoodreadsModule } from './goodreads/goodreads.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { ReviewsModule } from './reviews/reviews.module';
import { BookListsModule } from './book-lists/book-lists.module';
import { EventGroupsModule } from './event-groups/event-groups.module';
import { BooksModule } from './books/books.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.development.env', '.prod.env'],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    GoodreadsModule,
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
