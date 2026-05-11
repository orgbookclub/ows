import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { BooksModule } from "../books/books.module";
import { EventRepository } from "../repositories/event.repository";
import { UsersModule } from "../users/users.module";

import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";
import { Event, EventSchema } from "./schemas/event.schema";
import { EventsV2Controller } from "./v2/events.v2.controller";

/**
 * The Events Module.
 * This module is responsible for interacting with the @see Event documents in the database.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    BooksModule,
    UsersModule,
  ],
  controllers: [EventsController, EventsV2Controller],
  providers: [EventsService, EventRepository],
  exports: [EventsService],
})
export class EventsModule {}
