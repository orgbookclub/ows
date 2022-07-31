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
 *
 */
@ApiTags("Users")
@Controller("api/users")
export class UsersController {
  /**
   *
   * @param usersService
   */
  constructor(private readonly usersService: UsersService) {
    Logger.debug("Initialized UsersController");
  }

  /**
   *
   * @param createUserDto
   */
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  /**
   *
   */
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  /**
   *
   * @param id
   */
  @Get(":userid")
  async findOneByUserId(@Param("id") id: number) {
    return await this.usersService.findOneByUserId(id);
  }

  /**
   *
   * @param id
   * @param updateUserDto
   */
  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  /**
   *
   * @param id
   */
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return await this.usersService.remove(id);
  }
}
