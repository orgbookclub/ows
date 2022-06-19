import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
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
    const user = await this.findOneByUserId(createUserDto.id);
    if (user != null) {
      throw new ForbiddenException('User already exists!');
    }
    return await this.repository.create(createUserDto);
  }

  async findAll() {
    return await this.repository.getAll();
  }

  async findOneByUserId(id: string) {
    const users = await this.repository.find({ id: id });
    if (users.length == 0) {
      return null;
    }
    if (users.length > 1) {
      throw new InternalServerErrorException('Multiple users found');
    }
    return users[0];
  }

  async findOne(id: string) {
    const users = await this.repository.find({ _id: id });
    if (users.length == 0) {
      return null;
    }
    if (users.length > 1) {
      throw new InternalServerErrorException('Multiple users found');
    }
    return users[0];
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.repository.update(id, updateUserDto);
  }

  async remove(id: string) {
    await this.repository.delete(id);
    return true;
  }
}
