import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Logger,
  NotFoundException,
  Param,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";

import { Scopes } from "../auth/scopes.decorator";
import { ParseObjectIdPipe } from "../common/pipes/parse-object-id.pipe";

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
@ApiBearerAuth()
export class UsersController {
  /**
   * Initializes an instance of UsersController.
   *
   * @param usersService The users service.
   */
  constructor(private readonly usersService: UsersService) {
    Logger.debug("Initialized UsersController");
  }

  /**
   * Creates a user from the given Dto object.
   *
   * @param createUserDto The Dto object.
   * @returns A user document.
   */
  @Post()
  @Scopes("users:write")
  @ApiOkResponse({ type: UserDocument })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  /**
   * Gets all user documents from the database.
   *
   * @returns A list of user documents.
   */
  @Get()
  @Scopes("users:read")
  @ApiOkResponse({ type: [UserDocument] })
  async findAll() {
    return await this.usersService.findAll();
  }

  /**
   * Gets a user from the user Id.
   *
   * @param userId The user ID of the user. NOT the Object ID.
   * @returns A user document.
   */
  @Get(":userid")
  @Scopes("users:read")
  @ApiOkResponse({ type: UserDocument })
  @ApiNotFoundResponse({ description: "User not found." })
  async findOneByUserId(@Param("userid") userId: string) {
    const user = await this.usersService.findOneByUserId(userId);
    if (!user) {
      throw new NotFoundException(`User with userId "${userId}" not found`);
    }
    return user;
  }

  /**
   * Updates a user with the given Id.
   *
   * @param id The object ID.
   * @param updateUserDto The dto object.
   * @returns A user document.
   */
  @Patch(":id")
  @Scopes("users:write")
  @ApiOkResponse({ type: UserDocument })
  async update(
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  /**
   * Deletes a user with the given Id.
   *
   * @param id The object ID.
   * @returns Boolean indicating if doc is deleted.
   */
  @Delete(":id")
  @Scopes("users:write")
  @ApiOkResponse({ type: Boolean })
  async remove(@Param("id", ParseObjectIdPipe) id: string) {
    return await this.usersService.remove(id);
  }
}
