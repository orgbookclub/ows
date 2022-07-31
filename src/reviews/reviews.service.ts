import { Injectable } from "@nestjs/common";

import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";

/**
 *
 */
@Injectable()
export class ReviewsService {
  /**
   *
   * @param createReviewDto
   */
  create(createReviewDto: CreateReviewDto) {
    return "This action adds a new review";
  }

  /**
   *
   */
  findAll() {
    return `This action returns all reviews`;
  }

  /**
   *
   * @param id
   */
  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  /**
   *
   * @param id
   * @param updateReviewDto
   */
  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  /**
   *
   * @param id
   */
  remove(id: number) {
    return `This action removes a #${id} review`;
  }
}
