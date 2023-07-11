import { Body, Controller, Get, Logger, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { EventDto } from "../events/dto/event.dto";

import { MigrationsService } from "./migrations.service";

/**
 * The Migrations controller.
 * Responsible for handling DB migrations from old schema to new one.
 */
@ApiTags("Migrations")
@Controller("api/migrations")
@ApiBearerAuth()
export class MigrationsController {
  /**
   * Initializes an instance of Migrations Controller.
   *
   * @param migrationsService The migrations service.
   */
  constructor(private readonly migrationsService: MigrationsService) {
    Logger.debug("Initialized MigrationsController");
  }

  /**
   * Migrates all events from older schema to newer one.
   *
   */
  @Get("/all")
  async migrateAllEvents() {
    await this.migrationsService.migrateAllEvents();
    return;
  }

  /**
   * Migrates a single event doc from older schema to newer one.
   *
   * @param oldEventDoc The db document representing the event in the old db format.
   */
  @Post()
  async migrateEvent(@Body() oldEventDoc: EventDto) {
    await this.migrationsService.migrateEvent(oldEventDoc);
    return;
  }
}
