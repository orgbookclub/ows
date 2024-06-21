import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CreateBookDto } from "../books/dto/create-book.dto";
import { UpdateBookDto } from "../books/dto/update-book.dto";
import { Book, BookDocument } from "../books/schemas/book.schema";

import { BaseRepository } from "./base.repository";

/**
 * Repository for handling all DB operations related to @see Book objects.
 */
export class BookRepository extends BaseRepository<BookDocument> {
  /**
   * Initializes an instance of BookRepository.
   *
   * @param bookModel The mongoose model.
   */
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
  ) {
    super();
  }

  /**
   * Creates a book document in the database.
   *
   * @param item The dto object.
   * @returns The result document.
   */
  async create(item: CreateBookDto) {
    return await this.bookModel.create(item);
  }

  /**
   * Gets a book document with the given ID.
   *
   * @param id The object ID.
   * @returns The result document.
   */
  async get(id: string) {
    return await this.bookModel.findById(id).exec();
  }

  /**
   * Gets all book documents from the DB.
   *
   * @returns The result document list.
   */
  async getAll() {
    return await this.bookModel.find().exec();
  }

  /**
   * Gets all book documents which match the query.
   *
   * @param query The query object.
   * @returns The result document list.
   */
  async find(query: any) {
    return await this.bookModel.find(query).exec();
  }

  /**
   * Updates the book document in the DB.
   *
   * @param id The object ID of the doc to update.
   * @param updateDto The updated doc.
   * @returns The result document (after update).
   */
  async update(id: string, updateDto: UpdateBookDto) {
    return await this.bookModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: "after",
    });
  }

  /**
   * Deletes a book document from the DB.
   *
   * @param id The object ID of the doc.
   */
  async delete(id: string) {
    await this.bookModel.findByIdAndDelete(id);
    return;
  }
}
