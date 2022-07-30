import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from '../books/books.service';
import { EventRepository } from '../repositories/event.repository';
import { MockRepository } from '../repositories/mock.repository';
import { UsersService } from '../users/users.service';
import { mockBook } from '../utils/mockBookValues';
import { mockEvent, mockEventDocs } from '../utils/mockEventValues';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BooksService,
          useValue: {
            findBookByUrl: async (url: string) => {
              return null;
            },
            createBookFromUrl: async (url: string) => {
              return mockBook('new book', [], url);
            },
          },
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

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const event = mockEvent('new mock event');
      const actual = await service.create(event);
      expect(actual).toEqual({ _id: 'mock random uuid', ...event });
    });
  });

  describe('findAll', () => {
    it('should return all events', async () => {
      const actual = await service.findAll();
      expect(actual).toEqual(mockEventDocs);
    });
  });

  describe('findOne', () => {
    it('should return an event', async () => {
      const actual = await service.findOne(mockEventDocs[0]._id);
      expect(actual).toEqual(mockEventDocs[0]);
    });

    it('should return null if no book found', async () => {
      const randId = 'randId';
      const actual = await service.findOne(randId);
      expect(actual).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update the name of the event', async () => {
      await service.update(mockEventDocs[0]._id, { name: 'updated name' });
      const updatedEvent = await service.findOne(mockEventDocs[0]._id);
      expect(updatedEvent.name).toEqual('updated name');
    });
  });

  describe('remove', () => {
    it('should delete the event', async () => {
      const id = mockEventDocs[0]._id;
      await service.remove(id);
      const book = await service.findOne(id);
      expect(book).toBeUndefined();
    });
  });
});
