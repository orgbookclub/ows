import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { AuthorDto } from "../dto/author.dto";

/**
 * The class representing a Book in the database.
 * Can contain both StoryGraph & Goodreads books.
 */
@Schema()
export class Book {
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
}

/**
 *
 */
export class BookDocument extends Book {
  _id: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
