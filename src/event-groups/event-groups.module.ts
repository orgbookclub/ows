import { Module } from "@nestjs/common";

import { EventGroupsController } from "./event-groups.controller";
import { EventGroupsService } from "./event-groups.service";

/**
 *
 */
@Module({
  controllers: [EventGroupsController],
  providers: [EventGroupsService],
})
export class EventGroupsModule {}
