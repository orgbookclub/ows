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
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserDocument } from "./schemas/user.schema";
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
   * @returns {Promise<UserDocument>} A user document.
   */
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDocument> {
    return await this.usersService.create(createUserDto);
  }

  /**
   * Gets all user documents from the database.
   *
   * @returns {Promise<UserDocument[]>} A list of user documents.
   */
  @Get()
  async findAll(): Promise<UserDocument[]> {
    return await this.usersService.findAll();
  }

  /**
   * Gets a user from the user Id.
   *
   * @param {string} userId The user ID of the user. NOT the Object ID.
   * @returns {Promise<UserDocument>} A user document.
   */
  @Get(":userid")
  async findOneByUserId(
    @Param("userid") userId: string,
  ): Promise<UserDocument> {
    return await this.usersService.findOneByUserId(userId);
  }

  /**
   * Updates a user with the given Id.
   *
   * @param {string} id The object ID.
   * @param {UpdateUserDto} updateUserDto The dto object.
   * @returns {Promise<UserDocument>} A user document.
   */
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    return await this.usersService.update(id, updateUserDto);
  }

  /**
   * Deletes a user with the given Id.
   *
   * @param {string} id The object ID.
   * @returns {Promise<boolean>} Boolean indicating if doc is deleted.
   */
  @Delete(":id")
  @ApiOkResponse({ type: Boolean })
  async remove(@Param("id") id: string): Promise<boolean> {
    return await this.usersService.remove(id);
  }
}
