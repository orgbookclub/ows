import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private repository: UserRepository) {
    Logger.debug('Initialized UsersService');
  }
  async create(createUserDto: CreateUserDto) {
    const user = await this.findOne(createUserDto.id);
    if (user != null) {
      throw new ForbiddenException('User already exists!');
    }
    return await this.repository.create(createUserDto);
  }

  async findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    const users = await this.repository.find({ id: id });
    if (users.length == 0) {
      return null;
    }
    return users[0];
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
