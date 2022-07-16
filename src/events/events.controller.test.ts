import { Test, TestingModule } from '@nestjs/testing';
import { EventRepository } from '../repositories/event.repository';
import { MockRepository } from '../repositories/mock.repository';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsController', () => {
  let controller: EventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventRepository,
          useValue: new MockRepository<Event>([]),
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
