import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CreateUserDto } from "../users/dto/create-user.dto";
import { User, UserDocument } from "../users/schemas/user.schema";

import { BaseRepository } from "./base.repository";

/**
 *
 */
export class UserRepository extends BaseRepository<User> {
  /**
   *
   * @param userModel
   */
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super();
  }
  /**
   *
   * @param item
   */
  async create(item: CreateUserDto) {
    return await this.userModel.create(item);
  }
  /**
   *
   * @param id
   */
  async get(id: string) {
    return await this.userModel.findById(id).exec();
  }
  /**
   *
   */
  async getAll() {
    return await this.userModel.find().exec();
  }
  /**
   *
   * @param query
   */
  async find(query: any) {
    return await this.userModel.find(query).exec();
  }
  /**
   *
   * @param id
   * @param updateDto
   */
  async update(id: string, updateDto) {
    return await this.userModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: "after",
    });
  }
  /**
   *
   * @param id
   */
  async delete(id: string) {
    return await this.userModel.findByIdAndRemove(id);
  }
}
