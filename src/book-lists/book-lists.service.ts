import { Injectable } from '@nestjs/common';
import { CreateBookListDto } from './dto/create-book-list.dto';
import { UpdateBookListDto } from './dto/update-book-list.dto';

@Injectable()
export class BookListsService {
  create(createBookListDto: CreateBookListDto) {
    return 'This action adds a new bookList';
  }

  findAll() {
    return `This action returns all bookLists`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bookList`;
  }

  update(id: number, updateBookListDto: UpdateBookListDto) {
    return `This action updates a #${id} bookList`;
  }

  remove(id: number) {
    return `This action removes a #${id} bookList`;
  }
}
