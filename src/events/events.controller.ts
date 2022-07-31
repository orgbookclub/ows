import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Logger,
  Param,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { EventsService } from "./events.service";

/**
 *
 */
@ApiTags("Events")
@Controller("api/events")
export class EventsController {
  /**
   *
   * @param eventsService
   */
  constructor(private readonly eventsService: EventsService) {
    Logger.debug("Initialized EventsController");
  }

  /**
   *
   * @param createEventDto
   */
  @Post()
  async create(@Body() createEventDto: CreateEventDto) {
    return await this.eventsService.create(createEventDto);
  }

  /**
   *
   * @param url
   * @param createEventDto
   */
  @Post(":url")
  async createFromUrl(
    @Param("url") url: string,
    @Body() createEventDto: CreateEventDto,
  ) {
    return await this.eventsService.createFromUrl(url, createEventDto);
  }

  /**
   *
   */
  @Get()
  async findAll() {
    return await this.eventsService.findAll();
  }

  /**
   *
   * @param id
   */
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.eventsService.findOne(id);
  }

  /**
   *
   * @param id
   * @param updateEventDto
   */
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return await this.eventsService.update(id, updateEventDto);
  }

  /**
   *
   * @param id
   */
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return await this.eventsService.remove(id);
  }
}
