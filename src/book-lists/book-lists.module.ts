import { Module } from '@nestjs/common';
import { BookListsService } from './book-lists.service';
import { BookListsController } from './book-lists.controller';

@Module({
  controllers: [BookListsController],
  providers: [BookListsService]
})
export class BookListsModule {}
