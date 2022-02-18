import { Module } from '@nestjs/common';
import { GoodreadsModule } from './goodreads/goodreads.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
