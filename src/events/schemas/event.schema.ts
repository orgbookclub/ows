import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Book } from '../../books/schemas/book.schema';
import { User } from '../../users/schemas/user.schema';
import { EventStatus } from '../dto/event-status';
import { EventType } from '../dto/event-type';
import { DateRange } from '../dto/event.dto';

export type EventDocument = Event & Document;

@Schema()
export class Event {
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

  @Prop([DateRange])
  dates: DateRange;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  requestedBy: User;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  interested: User[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  participators: User[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  leaders: User[];

  @Prop()
  notes: string;

  @Prop()
  readerPoints: number;

  @Prop()
  leaderPoints: number;
}

export const EventSchema = SchemaFactory.createForClass(Event);
