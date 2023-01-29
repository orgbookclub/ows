import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

import { Book } from "../../books/schemas/book.schema";
<<<<<<< HEAD
import { User } from "../../users/schemas/user.schema";
=======
>>>>>>> origin/develop
import { DateRange } from "../dto/date-range.dto";
import { EventStatus } from "../dto/event-status";
import { EventType } from "../dto/event-type";
import { Participant } from "../dto/participant.dto";

const participantSchema = {
  _id: false,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  points: Number,
};

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
    type: participantSchema,
  })
  requestedBy: Participant;

  @Prop({
    type: [participantSchema],
  })
  interested: Participant[];

  @Prop({
    type: [participantSchema],
  })
  readers: Participant[];

  @Prop({
    type: [participantSchema],
  })
  leaders: Participant[];

  @Prop()
  description: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
