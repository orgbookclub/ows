import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoodreadsModule } from 'src/goodreads/goodreads.module';
import { BookRepository } from 'src/repositories/book.repository';
import { Book, BookSchema } from 'src/schemas/book.schema';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    GoodreadsModule,
  ],
  controllers: [BooksController],
  providers: [BooksService, BookRepository],
  exports: [BooksService, BookRepository],
})
export class BooksModule {}
