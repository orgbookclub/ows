import { Module } from '@nestjs/common';
import { EventGroupsService } from './event-groups.service';
import { EventGroupsController } from './event-groups.controller';

@Module({
  controllers: [EventGroupsController],
  providers: [EventGroupsService],
})
export class EventGroupsModule {}
