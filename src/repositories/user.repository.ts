import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CreateUserDto } from "../users/dto/create-user.dto";
import { UpdateUserDto } from "../users/dto/update-user.dto";
import { User, UserDocument } from "../users/schemas/user.schema";

import { BaseRepository } from "./base.repository";

/**
 * Repository for handling all DB operations related to @see User objects.
 */
export class UserRepository extends BaseRepository<UserDocument> {
  /**
   * Initializes an instance of UserRepository.
   *
   * @param {Model<UserDocument>} userModel The mongoose model.
   */
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super();
  }

  /**
   * Creates a user document in the database.
   *
   * @param {CreateUserDto} item The dto object.
   * @returns {Promise<UserDocument>} The result document.
   */
  async create(item: CreateUserDto): Promise<UserDocument> {
    return await this.userModel.create(item);
  }

  /**
   * Gets a user document with the given ID.
   *
   * @param {string} id The object ID.
   * @returns {Promise<UserDocument>} The result document.
   */
  async get(id: string): Promise<UserDocument> {
    return await this.userModel.findById(id).exec();
  }

  /**
   * Gets all user documents from the DB.
   *
   * @returns {Promise<UserDocument[]>} The result document list.
   */
  async getAll(): Promise<UserDocument[]> {
    return await this.userModel.find().exec();
  }

  /**
   * Gets all user documents which match the query.
   *
   * @param {any} query The query object.
   * @returns {Promise<UserDocument[]>} The result document list.
   */
  async find(query: any): Promise<UserDocument[]> {
    return await this.userModel.find(query).exec();
  }

  /**
   * Updates the user document in the DB.
   *
   * @param {string} id The object ID of the doc to update.
   * @param {UpdateUserDto} updateDto The updated doc.
   * @returns {Promise<UserDocument>} The result document (after update).
   */
  async update(id: string, updateDto: UpdateUserDto): Promise<UserDocument> {
    return await this.userModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: "after",
    });
  }

  /**
   * Deletes a user document from the DB.
   *
   * @param {string} id The object ID of the doc.
   */
  async delete(id: string) {
    return await this.userModel.findByIdAndRemove(id);
  }
}
