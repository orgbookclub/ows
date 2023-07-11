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
   * @param userModel The mongoose model.
   */
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super();
  }

  /**
   * Creates a user document in the database.
   *
   * @param item The dto object.
   * @returns The result document.
   */
  async create(item: CreateUserDto) {
    return await this.userModel.create(item);
  }

  /**
   * Gets a user document with the given ID.
   *
   * @param id The object ID.
   * @returns The result document.
   */
  async get(id: string) {
    return await this.userModel.findById(id).exec();
  }

  /**
   * Gets all user documents from the DB.
   *
   * @returns The result document list.
   */
  async getAll() {
    return await this.userModel.find().exec();
  }

  /**
   * Gets all user documents which match the query.
   *
   * @param query The query object.
   * @returns The result document list.
   */
  async find(query: any) {
    return await this.userModel.find(query).exec();
  }

  /**
   * Updates the user document in the DB.
   *
   * @param id The object ID of the doc to update.
   * @param updateDto The updated doc.
   * @returns The result document (after update).
   */
  async update(id: string, updateDto: UpdateUserDto) {
    return await this.userModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: "after",
    });
  }

  /**
   * Deletes a user document from the DB.
   *
   * @param id The object ID of the doc.
   */
  async delete(id: string) {
    await this.userModel.findByIdAndRemove(id);
    return;
  }
}
