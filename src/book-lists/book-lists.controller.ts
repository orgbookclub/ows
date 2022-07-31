import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { BookListsService } from "./book-lists.service";
import { CreateBookListDto } from "./dto/create-book-list.dto";
import { UpdateBookListDto } from "./dto/update-book-list.dto";

/**
 *
 */
@ApiTags("Book Lists")
@Controller("book-lists")
export class BookListsController {
  /**
   *
   * @param bookListsService
   */
  constructor(private readonly bookListsService: BookListsService) {
    //
  }

  /**
   *
   * @param createBookListDto
   */
  @Post()
  create(@Body() createBookListDto: CreateBookListDto) {
    return this.bookListsService.create(createBookListDto);
  }

  /**
   *
   */
  @Get()
  findAll() {
    return this.bookListsService.findAll();
  }

  /**
   *
   * @param id
   */
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.bookListsService.findOne(+id);
  }

  /**
   *
   * @param id
   * @param updateBookListDto
   */
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateBookListDto: UpdateBookListDto,
  ) {
    return this.bookListsService.update(+id, updateBookListDto);
  }

  /**
   *
   * @param id
   */
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.bookListsService.remove(+id);
  }
}
