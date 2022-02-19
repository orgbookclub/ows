import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Author } from '../common/author.dto';

export type BookDocument = Book & Document;

@Schema()
export class Book {
  @Prop()
  title: string;

  @Prop([Author])
  authors: Array<Author>;

  @Prop()
  url: string;

  @Prop([String])
  genres: Array<string>;
}

export const BookSchema = SchemaFactory.createForClass(Book);