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

import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { ReviewsService } from "./reviews.service";

/**
 *
 */
@ApiTags("Reviews")
@Controller("reviews")
export class ReviewsController {
  /**
   *
   * @param reviewsService
   */
  constructor(private readonly reviewsService: ReviewsService) {
    //
  }

  /**
   *
   * @param createReviewDto
   */
  @Post()
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  /**
   *
   */
  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  /**
   *
   * @param id
   */
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.reviewsService.findOne(+id);
  }

  /**
   *
   * @param id
   * @param updateReviewDto
   */
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(+id, updateReviewDto);
  }

  /**
   *
   * @param id
   */
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.reviewsService.remove(+id);
  }
}
