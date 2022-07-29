import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schemas/event.schema';
import { EventRepository } from '../repositories/event.repository';
import { BooksModule } from '../books/books.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    BooksModule,
    UsersModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, EventRepository],
})
export class EventsModule {}
