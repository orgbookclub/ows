import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { BookInfoModule } from "../book-info/book-info.module";
import { BookRepository } from "../repositories/book.repository";

import { BooksController } from "./books.controller";
import { BooksService } from "./books.service";
import { Book, BookSchema } from "./schemas/book.schema";

/**
 * The Books Module.
 * This module is responsible for interaction with the @see Book documents in the database.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    BookInfoModule,
  ],
  controllers: [BooksController],
  providers: [BooksService, BookRepository],
  exports: [BooksService],
})
export class BooksModule {}
