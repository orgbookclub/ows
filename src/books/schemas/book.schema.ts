import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { AuthorDto } from "../dto/author.dto";
import { BookDto } from "../dto/book.dto";

/**
 * The class representing a Book in the database.
 * Can contain both StoryGraph & Goodreads books.
 */
@Schema()
export class Book extends BookDto {
  @Prop()
  title: string;

  @Prop([AuthorDto])
  authors: AuthorDto[];

  @Prop({
    type: String,
    unique: true,
    set: (url: string) => url.split("?")[0],
  })
  url: string;

  @Prop([String])
  genres: string[];

  @Prop()
  coverUrl: string;

  @Prop()
  numPages: number;
}

/**
 * Class representing a book document in the database.
 */
export class BookDocument extends Book {
  _id: string;
}

export const BookSchema = SchemaFactory.createForClass(Book).index({
  title: "text",
  genres: "text",
  authors: "text",
});
