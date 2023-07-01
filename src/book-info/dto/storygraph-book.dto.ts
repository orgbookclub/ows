import { BookDto } from "../../books/dto/book.dto";

class QuestionAnswerDto {
  /**
   * The question on the book page.
   *
   * @example "Plot- or character-driven?"
   */
  question: string;

  /**
   * The answer for the question on the book page.
   *
   * @example "A mix: 55% | Plot: 22% | Character: 21%"
   */
  answer: string;
}

/**
 * Dto for a Storygraph Book.
 */
export class StorygraphBookDto extends BookDto {
  /**
   * The name of the series, if the book belongs to any.
   *
   * @example "American Gods #1"
   */
  series: string;

  /**
   * The SG link to the cover of the book.
   *
   * @example "https://cdn.thestorygraph.com/yb51m9d8kpr0i3rga9u7yxb4qvzu"
   */
  coverUrl: string;

  /**
   * The average rating of the book.
   *
   * @example 4.11
   */
  avgRating: number;

  /**
   * The trigger warnings for the book.
   *
   * @example "Graphic - Death, Sexual content, Violence\n Moderate - Child death, Racial slurs, Slavery\n Minor - Car accident"
   */
  warnings: string;

  /**
   * The moods for the book.
   *
   * @example ["adventurous (83%)", "mysterious (73%)", "dark(66%)"]
   */
  moods: string[];

  /**
   * The paces for the book.
   *
   * @example ["slow (51%)", "medium (42%)", "fast (5%)"]
   */
  pace: string[];

  /**
   * The set of question answer pairs for the book.
   */
  quesAns: QuestionAnswerDto[];

  /**
   * The description or blurb of the book.
   *
   * @example "Days before his release from prison, Shadow's wife, Laura, dies in a mysterious car crash. Numbly, he makes his way back home. On the plane, he encounters the enigmatic Mr Wednesday, who claims to be a refugee from a distant war, a former god and the king of America. Together they embark on a profoundly strange journey across the heart of the USA, whilst all around them a storm of preternatural and epic proportions threatens to break. Scary, gripping and deeply unsettling, American Gods takes a long, hard look into the soul of America. You'll be surprised by what - and who - it finds there..."
   */
  description: string;
}
