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
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { EventsService } from "./events.service";
import { EventDocument } from "./schemas/event.schema";

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
   * @returns {Promise<EventDocument>} An event document.
   */
  @Post()
  async create(@Body() createEventDto: CreateEventDto): Promise<EventDocument> {
    return await this.eventsService.create(createEventDto);
  }

  /**
   * Creates an event from the book URL and Dto object.
   *
   * @param {string} url A valid GR or SG URL.
   * @param {CreateEventDto} createEventDto The Dto object.
   * @returns {Promise<EventDocument>} An event document.
   */
  @Post(":url")
  async createFromUrl(
    @Param("url") url: string,
    @Body() createEventDto: CreateEventDto,
  ): Promise<EventDocument> {
    return await this.eventsService.createFromUrl(url, createEventDto);
  }

  /**
   * Gets all event documents from the database.
   * @returns {Promise<EventDocument[]>} A list of event documents.
   */
  @Get()
  async findAll(): Promise<EventDocument[]> {
    return await this.eventsService.findAll();
  }

  /**
   * Gets the event document with the given ID from the database.
   *
   * @param {string} id The object ID of the document.
   * @returns {Promise<EventDocument>} An event document.
   */
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<EventDocument> {
    return await this.eventsService.findOne(id);
  }

  /**
   * Updates the event with the given ID and Dto in the database.
   *
   * @param {string} id The object ID.
   * @param {UpdateEventDto} updateEventDto The dto object.
   * @returns {Promise<EventDocument>} The updated event document.
   */
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<EventDocument> {
    return await this.eventsService.update(id, updateEventDto);
  }

  /**
   * Deletes the event document from the DB.
   *
   * @param {string} id The object ID of the event document to remove.
   * @returns {Promise<boolean>} Boolean indicating if doc is deleted.
   */
  @Delete(":id")
  @ApiOkResponse({ type: Boolean })
  async remove(@Param("id") id: string): Promise<boolean> {
    return await this.eventsService.remove(id);
  }
}
