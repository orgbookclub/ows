import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BookDto } from 'src/models/book.dto';

export type BookDocument = BookDto & Document;

@Schema()
export class Book {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  breed: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
