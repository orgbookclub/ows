import { Test, TestingModule } from '@nestjs/testing';
import { EventGroupsController } from './event-groups.controller';
import { EventGroupsService } from './event-groups.service';

describe('EventGroupsController', () => {
  let controller: EventGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventGroupsController],
      providers: [EventGroupsService],
    }).compile();

    controller = module.get<EventGroupsController>(EventGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
