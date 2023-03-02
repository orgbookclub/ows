import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

import { Book } from "../../books/schemas/book.schema";
import { DateRange } from "../dto/date-range.dto";
import { EventStatus } from "../dto/event-status";
import { EventType } from "../dto/event-type";
import { Participant } from "../dto/participant.dto";

const participantSchema = {
  _id: false,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  points: Number,
};

/**
 * The class representing an Event in the database.
 */
@Schema()
export class Event {
  /**
   * The name of the event.
   *
   * @example "American Gods"
   */
  @Prop()
  name: string;

  /**
   * The book for which the event is happening.
   */
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Book" })
  book: Book;
  /**
   * A list of channel/thread IDs.
   */
  @Prop({ type: [{ type: String }] })
  threads: string[];
  /**
   * The status of the event.
   *
   * @example "Approved"
   */
  @Prop({
    type: String,
    required: true,
    enum: EventStatus,
    default: EventStatus.Requested,
  })
  status: EventStatus;
  /**
   * The type of the event.
   *
   * @example "BuddyRead"
   */
  @Prop({
    type: String,
    required: true,
    enum: EventType,
    default: EventType.BuddyRead,
  })
  type: EventType;
  /**
   * The dates for the event.
   */
  @Prop(DateRange)
  dates: DateRange;
  /**
   * The participant who requested the event.
   */
  @Prop({
    type: participantSchema,
  })
  requestedBy: Participant;
  /**
   * A list of participants who show interest in the event.
   */
  @Prop({
    type: [participantSchema],
  })
  interested: Participant[];
  /**
   * The participants who read the book in the event duration.
   */
  @Prop({
    type: [participantSchema],
  })
  readers: Participant[];
  /**
   * The participants who lead the discussion for the event.
   */
  @Prop({
    type: [participantSchema],
  })
  leaders: Participant[];
  /**
   * The description of the event.
   */
  @Prop()
  description: string;
}

/**
 * Class representing an event document in the database.
 */
export class EventDocument extends Event {
  _id: string;
}
export const EventSchema = SchemaFactory.createForClass(Event);
