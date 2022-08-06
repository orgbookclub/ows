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
 * The Events controller.
 * Responsible for interacting with @see Event documents in the database.
 */
@ApiTags("Events")
@Controller("api/events")
export class EventsController {
  /**
   * Initializes an instance of Events Controller.
   *
   * @param {EventsService} eventsService The events service.
   */
  constructor(private readonly eventsService: EventsService) {
    Logger.debug("Initialized EventsController");
  }

  /**
   * Creates an event from the Dto object.
   *
   * @param {CreateEventDto} createEventDto The Dto object.
   */
  @Post()
  async create(@Body() createEventDto: CreateEventDto) {
    return await this.eventsService.create(createEventDto);
  }

  /**
   * Creates an event from the book URL and Dto object.
   *
   * @param {string} url A valid GR or SG URL.
   * @param {CreateEventDto} createEventDto The Dto object.
   */
  @Post(":url")
  async createFromUrl(
    @Param("url") url: string,
    @Body() createEventDto: CreateEventDto,
  ) {
    return await this.eventsService.createFromUrl(url, createEventDto);
  }

  /**
   * Gets all event documents from the database.
   */
  @Get()
  async findAll() {
    return await this.eventsService.findAll();
  }

  /**
   * Gets the event document with the given ID from the database.
   *
   * @param {string} id The object ID of the document.
   */
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.eventsService.findOne(id);
  }

  /**
   * Updates the event with the given ID and Dto in the database.
   *
   * @param {string} id The object ID.
   * @param {UpdateEventDto} updateEventDto The dto object.
   */
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return await this.eventsService.update(id, updateEventDto);
  }

  /**
   * Deletes the event document from the DB.
   *
   * @param {string} id The object ID of the event document to remove.
   */
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return await this.eventsService.remove(id);
  }
}
