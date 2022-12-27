import { BookDto } from "../../books/dto/book.dto";

class QuestionAnswerDto {
  question: string;
  answer: string;
}

/**
 * Dto for a Storygraph Book.
 */
export class StorygraphBookDto extends BookDto {
  series: string;
  coverUrl: string;
  avgRating: number;
  warnings: string;
  moods: string[];
  pace: string[];
  quesAns: QuestionAnswerDto[];
  description: string;
  genres: string[];
}
