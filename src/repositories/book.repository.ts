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
   * @param {Model<BookDocument>} bookModel The mongoose model.
   */
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
  ) {
    super();
  }

  /**
   * Creates a book document in the database.
   *
   * @param {CreateBookDto} item The dto object.
   * @returns {Promise<BookDocument>} The result document.
   */
  async create(item: CreateBookDto): Promise<BookDocument> {
    return await this.bookModel.create(item);
  }

  /**
   * Gets a book document with the given ID.
   *
   * @param {string} id The object ID.
   * @returns {Promise<BookDocument>} The result document.
   */
  async get(id: string): Promise<BookDocument> {
    return await this.bookModel.findById(id).exec();
  }

  /**
   * Gets all book documents from the DB.
   *
   * @returns {Promise<BookDocument[]>} The result document list.
   */
  async getAll(): Promise<BookDocument[]> {
    return await this.bookModel.find().exec();
  }

  /**
   * Gets all book documents which match the query.
   *
   * @param {any} query The query object.
   * @returns {Promise<BookDocument[]>} The result document list.
   */
  async find(query: any): Promise<BookDocument[]> {
    return await this.bookModel.find(query).exec();
  }

  /**
   * Updates the book document in the DB.
   *
   * @param {string} id The object ID of the doc to update.
   * @param {UpdateBookDto} updateDto The updated doc.
   * @returns {Promise<BookDocument>} The result document (after update).
   */
  async update(id: string, updateDto: UpdateBookDto): Promise<BookDocument> {
    return await this.bookModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: "after",
    });
  }

  /**
   * Deletes a book document from the DB.
   *
   * @param {string} id The object ID of the doc.
   */
  async delete(id: string) {
    return await this.bookModel.findByIdAndRemove(id);
  }
}
