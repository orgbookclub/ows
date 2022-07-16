import { Test, TestingModule } from '@nestjs/testing';
import { EventRepository } from '../repositories/event.repository';
import { MockRepository } from '../repositories/mock.repository';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: EventRepository,
          useValue: new MockRepository<Event>([]),
        },
        EventsService,
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
