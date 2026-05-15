import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Logger,
  NotFoundException,
  Param,
  Query,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";

import { Scopes } from "../auth/scopes.decorator";
import { ParseObjectIdPipe } from "../common/pipes/parse-object-id.pipe";

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
@ApiBearerAuth()
export class EventsController {
  /**
   * Initializes an instance of Events Controller.
   *
   * @param eventsService The events service.
   */
  constructor(private readonly eventsService: EventsService) {
    Logger.debug("Initialized EventsController");
  }

  /**
   * Creates an event from the Dto object.
   *
   * @param createEventDto The Dto object.
   * @returns An event document.
   */
  @Post()
  @Scopes("events:write")
  @ApiOkResponse({ type: EventDocument })
  async create(@Body() createEventDto: CreateEventDto) {
    return await this.eventsService.create(createEventDto);
  }

  /**
   * Creates an event from the book URL and Dto object.
   *
   * @param url A valid GR or SG URL.
   * @param createEventDto The Dto object.
   * @returns An event document.
   */
  @Post("createFromUrl")
  @Scopes("events:write")
  @ApiOkResponse({ type: EventDocument })
  async createFromUrl(
    @Query("url") url: string,
    @Body() createEventDto: CreateEventDto,
  ) {
    return await this.eventsService.createFromUrl(url, createEventDto);
  }

  /**
   * Gets the event document with the given ID from the database.
   *
   * @param id The object ID of the document.
   * @returns An event document.
   */
  @Get(":id")
  @Scopes("events:read")
  @ApiOkResponse({ type: EventDocument })
  @ApiBadRequestResponse({ description: "Invalid event id." })
  @ApiNotFoundResponse({ description: "Event not found." })
  async findOne(@Param("id", ParseObjectIdPipe) id: string) {
    const event = await this.eventsService.findOne(id);
    if (!event) {
      throw new NotFoundException(`Event with id "${id}" not found`);
    }
    return event;
  }

  /**
   * Updates the event with the given ID and Dto in the database.
   *
   * @param id The object ID.
   * @param updateEventDto The dto object.
   * @returns The updated event document.
   */
  @Patch(":id")
  @Scopes("events:write")
  @ApiOkResponse({ type: EventDocument })
  @ApiBadRequestResponse({ description: "Invalid event id." })
  async update(
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return await this.eventsService.update(id, updateEventDto);
  }

  /**
   * Deletes the event document from the DB.
   *
   * @param id The object ID of the event document to remove.
   * @returns Boolean indicating if doc is deleted.
   */
  @Delete(":id")
  @Scopes("events:write")
  @ApiOkResponse({ type: Boolean })
  @ApiBadRequestResponse({ description: "Invalid event id." })
  async remove(@Param("id", ParseObjectIdPipe) id: string) {
    return await this.eventsService.remove(id);
  }
}
