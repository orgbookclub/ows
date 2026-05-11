import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Logger,
  Param,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { CreateEventDto } from "./dto/create-event.dto";
import { EventFilter } from "./dto/event-filter.dto";
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
  @ApiOkResponse({ type: EventDocument })
  async createFromUrl(
    @Query("url") url: string,
    @Body() createEventDto: CreateEventDto,
  ) {
    return await this.eventsService.createFromUrl(url, createEventDto);
  }

  /**
   * Gets all event documents from the database which satisfy the filter conditions.
   *
   * @deprecated Use `GET /api/v2/events` instead. Sunset target: when consumers have migrated.
   * @param filter Filter.
   * @returns A list of event documents.
   */
  @Get()
  @ApiOperation({
    deprecated: true,
    description:
      "Deprecated. Use GET /api/v2/events for filter, sort, projection, and pagination support.",
  })
  @ApiOkResponse({ type: [EventDocument] })
  async find(@Query() filter: EventFilter) {
    return await this.eventsService.findMany(filter);
  }

  /**
   * Gets the event document with the given ID from the database.
   *
   * @param id The object ID of the document.
   * @returns An event document.
   */
  @Get(":id")
  @ApiOkResponse({ type: EventDocument })
  async findOne(@Param("id") id: string) {
    return await this.eventsService.findOne(id);
  }

  /**
   * Updates the event with the given ID and Dto in the database.
   *
   * @param id The object ID.
   * @param updateEventDto The dto object.
   * @returns The updated event document.
   */
  @Patch(":id")
  @ApiOkResponse({ type: EventDocument })
  async update(
    @Param("id") id: string,
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
  @ApiOkResponse({ type: Boolean })
  async remove(@Param("id") id: string) {
    return await this.eventsService.remove(id);
  }
}
