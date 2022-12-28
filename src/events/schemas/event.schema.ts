import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

import { Book } from "../../books/schemas/book.schema";
import { DateRange } from "../dto/date-range.dto";
import { EventStatus } from "../dto/event-status";
import { EventType } from "../dto/event-type";
import { Participant } from "../dto/participant.dto";

export type EventDocument = Event & Document;

/**
 * The class representing an Event in the database.
 */
@Schema()
export class Event {
  @Prop()
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Book" })
  book: Book;

  @Prop({ type: [{ type: String }] })
  threads: string[];

  @Prop({
    type: String,
    required: true,
    enum: EventStatus,
    default: EventStatus.Requested,
  })
  status: EventStatus;

  @Prop({
    type: String,
    required: true,
    enum: EventType,
    default: EventType.BuddyRead,
  })
  type: EventType;

  @Prop(DateRange)
  dates: DateRange;

  @Prop({
    type: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      points: Number,
    },
  })
  requestedBy: Participant;

  @Prop({
    type: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        points: Number,
      },
    ],
  })
  interested: Participant[];

  @Prop({
    type: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        points: Number,
      },
    ],
  })
  readers: Participant[];

  @Prop({
    type: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        points: Number,
      },
    ],
  })
  leaders: Participant[];

  @Prop()
  description: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
