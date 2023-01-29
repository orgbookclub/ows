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
 * The Users Service.
 */
@Injectable()
export class UsersService {
  /**
   * Initializes an instance of UsersService.
   *
   * @param repository Repository for handling all DB operations.
   */
  constructor(private repository: UserRepository) {
    Logger.debug("Initialized UsersService");
  }

  /**
   * Creates a user from the given Dto object.
   *
   * @param createUserDto The Dto object.
   */
  async create(createUserDto: CreateUserDto) {
    const user = await this.findOneByUserId(createUserDto.userId);
    if (user !== null) {
      throw new ForbiddenException("User already exists!");
    }
    return await this.repository.create(createUserDto);
  }

  /**
   * Gets all user documents from the database.
   */
  async findAll() {
    return await this.repository.getAll();
  }

  /**
   * Gets a user from the user Id.
   *
   * @param userId The user ID of the user. NOT the Object ID.
   */
  async findOneByUserId(userId: string) {
    const users = await this.repository.find({ userId: userId });
    if (users.length === 0) {
      return null;
    }
    if (users.length > 1) {
      throw new InternalServerErrorException("Multiple users found");
    }
    return users[0];
  }

  /**
   * Gets a user from the Id.
   *
   * @param id The Object ID.
   */
  async findOne(id: string) {
    const users = await this.repository.find({ _id: id });
    if (users.length === 0) {
      return null;
    }
    if (users.length > 1) {
      throw new InternalServerErrorException("Multiple users found");
    }
    return users[0];
  }

  /**
   * Updates a user with the given Id.
   *
   * @param id The object ID.
   * @param updateUserDto The dto object.
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.repository.update(id, updateUserDto);
  }

  /**
   * Deletes a user with the given Id.
   *
   * @param id The object ID.
   */
  async remove(id: string) {
    await this.repository.delete(id);
    return true;
  }
}
