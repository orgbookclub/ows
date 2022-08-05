import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Logger,
  Param,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

/**
 * The Users Controller.
 * This interacts with the @see User objects stored in the database.
 */
@ApiTags("Users")
@Controller("api/users")
export class UsersController {
  /**
   * Initializes an instance of UsersController.
   *
   * @param {UsersService} usersService The users service.
   */
  constructor(private readonly usersService: UsersService) {
    Logger.debug("Initialized UsersController");
  }

  /**
   * Creates a user from the given Dto object.
   *
   * @param {CreateUserDto} createUserDto The Dto object.
   */
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  /**
   * Gets all user documents from the database.
   */
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  /**
   * Gets a user from the user Id.
   *
   * @param {number} userId The user ID of the user. NOT the Object ID.
   */
  @Get(":userid")
  async findOneByUserId(@Param("id") userId: number) {
    return await this.usersService.findOneByUserId(userId);
  }

  /**
   * Updates a user with the given Id.
   *
   * @param {string} id The object ID.
   * @param {UpdateUserDto} updateUserDto The dto object.
   */
  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  /**
   * Deletes a user with the given Id.
   *
   * @param {string} id The object ID.
   */
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return await this.usersService.remove(id);
  }
}
