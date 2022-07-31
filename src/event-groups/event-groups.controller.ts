import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { CreateEventGroupDto } from "./dto/create-event-group.dto";
import { UpdateEventGroupDto } from "./dto/update-event-group.dto";
import { EventGroupsService } from "./event-groups.service";

/**
 *
 */
@ApiTags("Event Groups")
@Controller("event-groups")
export class EventGroupsController {
  /**
   *
   * @param eventGroupsService
   */
  constructor(private readonly eventGroupsService: EventGroupsService) {}

  /**
   *
   * @param createEventGroupDto
   */
  @Post()
  create(@Body() createEventGroupDto: CreateEventGroupDto) {
    return this.eventGroupsService.create(createEventGroupDto);
  }

  /**
   *
   */
  @Get()
  findAll() {
    return this.eventGroupsService.findAll();
  }

  /**
   *
   * @param id
   */
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.eventGroupsService.findOne(+id);
  }

  /**
   *
   * @param id
   * @param updateEventGroupDto
   */
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateEventGroupDto: UpdateEventGroupDto,
  ) {
    return this.eventGroupsService.update(+id, updateEventGroupDto);
  }

  /**
   *
   * @param id
   */
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.eventGroupsService.remove(+id);
  }
}
