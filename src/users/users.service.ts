import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";

import { UserRepository } from "../repositories/user.repository";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

/**
 *
 */
@Injectable()
export class UsersService {
  /**
   *
   * @param repository
   */
  constructor(private repository: UserRepository) {
    Logger.debug("Initialized UsersService");
  }

  /**
   *
   * @param createUserDto
   */
  async create(createUserDto: CreateUserDto) {
    const user = await this.findOneByUserId(createUserDto.userId);
    if (user != null) {
      throw new ForbiddenException("User already exists!");
    }
    return await this.repository.create(createUserDto);
  }

  /**
   *
   */
  async findAll() {
    return await this.repository.getAll();
  }

  /**
   *
   * @param id
   */
  async findOneByUserId(id: number) {
    const users = await this.repository.find({ userId: id });
    if (users.length == 0) {
      return null;
    }
    if (users.length > 1) {
      throw new InternalServerErrorException("Multiple users found");
    }
    return users[0];
  }

  /**
   *
   * @param id
   */
  async findOne(id: string) {
    const users = await this.repository.find({ _id: id });
    if (users.length == 0) {
      return null;
    }
    if (users.length > 1) {
      throw new InternalServerErrorException("Multiple users found");
    }
    return users[0];
  }

  /**
   *
   * @param id
   * @param updateUserDto
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.repository.update(id, updateUserDto);
  }

  /**
   *
   * @param id
   */
  async remove(id: string) {
    await this.repository.delete(id);
    return true;
  }
}
