import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Book } from '../../books/schemas/book.schema';
import { User } from '../../users/schemas/user.schema';
import { EventStatus } from '../dto/event-status';
import { EventType } from '../dto/event-type';
import { DateRange } from '../dto/dateRange';
import { Participant } from '../dto/participant';

export type EventDocument = Event & Document;

@Schema()
export class Event {
  @Prop({
    type: Number,
    unique: true,
  })
  id: number;

  @Prop()
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Book' })
  book: Book;

  @Prop({
    type: String,
    required: true,
    enum: EventStatus,
    default: EventStatus.Requested,
  })
  status: keyof typeof EventStatus;

  @Prop({
    type: String,
    required: true,
    enum: EventType,
    default: EventType.BuddyRead,
  })
  type: keyof typeof EventType;

  @Prop(DateRange)
  dates: DateRange;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  requestedBy: User;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  interested: User[];

  @Prop({
    type: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        points: Number,
      },
    ],
  })
  readers: Participant[];

  @Prop({
    type: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        points: Number,
      },
    ],
  })
  leaders: Participant[];

  @Prop()
  notes: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
