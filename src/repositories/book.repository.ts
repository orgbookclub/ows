import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CreateBookDto } from "../books/dto/create-book.dto";
import { Book, BookDocument } from "../books/schemas/book.schema";

import { BaseRepository } from "./base.repository";

/**
 *
 */
export class BookRepository extends BaseRepository<Book> {
  /**
   *
   * @param bookModel
   */
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
  ) {
    super();
  }
  /**
   *
   * @param item
   */
  async create(item: CreateBookDto) {
    return await this.bookModel.create(item);
  }
  /**
   *
   * @param id
   */
  async get(id: string) {
    return await this.bookModel.findById(id).exec();
  }
  /**
   *
   */
  async getAll() {
    return await this.bookModel.find().exec();
  }
  /**
   *
   * @param query
   */
  async find(query: any) {
    return await this.bookModel.find(query).exec();
  }
  /**
   *
   * @param id
   * @param updateDto
   */
  async update(id: string, updateDto) {
    return await this.bookModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: "after",
    });
  }
  /**
   *
   * @param id
   */
  async delete(id: string) {
    return await this.bookModel.findByIdAndRemove(id);
  }
}
