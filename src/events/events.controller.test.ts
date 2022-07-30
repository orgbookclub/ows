import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from '../books/books.service';
import { EventRepository } from '../repositories/event.repository';
import { MockRepository } from '../repositories/mock.repository';
import { UsersService } from '../users/users.service';
import { mockEventDocs } from '../utils/mockEventValues';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsController', () => {
  let controller: EventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: BooksService,
          useValue: null,
        },
        {
          provide: UsersService,
          useValue: null,
        },
        {
          provide: EventRepository,
          useValue: new MockRepository<Event>(mockEventDocs),
        },
        EventsService,
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
