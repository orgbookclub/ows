import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super();
  }
  async create(item: User) {
    return await this.userModel.create(item);
  }
  async get(id: string) {
    return this.userModel.findById(id).exec();
  }
  async getAll() {
    return this.userModel.find().exec();
  }
  async find(query: any) {
    return this.userModel.find(query).exec();
  }
  async update(id: string, updateDto) {
    return this.userModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: 'after',
    });
  }
  async delete(id: string) {
    return this.userModel.findByIdAndRemove(id);
  }
}
