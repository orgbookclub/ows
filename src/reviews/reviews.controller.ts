/* eslint-disable jsdoc/require-param-type */
/* eslint-disable jsdoc/require-param-description */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsdoc/require-returns */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { Scopes } from "../auth/scopes.decorator";

import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { ReviewsService } from "./reviews.service";

/**
 *
 */
@ApiTags("Reviews")
@Controller("reviews")
@ApiBearerAuth()
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
  @Scopes("reviews:write")
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  /**
   *
   */
  @Get()
  @Scopes("reviews:read")
  findAll() {
    return this.reviewsService.findAll();
  }

  /**
   *
   * @param id
   */
  @Get(":id")
  @Scopes("reviews:read")
  findOne(@Param("id") id: string) {
    return this.reviewsService.findOne(+id);
  }

  /**
   *
   * @param id
   * @param updateReviewDto
   */
  @Patch(":id")
  @Scopes("reviews:write")
  update(@Param("id") id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(+id, updateReviewDto);
  }

  /**
   *
   * @param id
   */
  @Delete(":id")
  @Scopes("reviews:write")
  remove(@Param("id") id: string) {
    return this.reviewsService.remove(+id);
  }
}
