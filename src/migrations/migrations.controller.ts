import { Body, Controller, Get, Logger, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { EventDto } from "../events/dto/event.dto";

import { MigrationsService } from "./migrations.service";

/**
 * The Migrations controller.
 * Responsible for handling DB migrations from old schema to new one.
 */
@ApiTags("Migrations")
@Controller("api/migrations")
export class MigrationsController {
  /**
   * Initializes an instance of Migrations Controller.
   *
   * @param {MigrationsService} migrationsService The migrations service.
   */
  constructor(private readonly migrationsService: MigrationsService) {
    Logger.debug("Initialized MigrationsController");
  }

  /**
   * Migrates all events from older schema to newer one.
   */
  @Get("/all")
  async migrateAllEvents() {
    return await this.migrationsService.migrateAllEvents();
  }

  /**
   * Migrates a single event doc from older schema to newer one.
   *
   * @param {object} oldEventDoc
   */
  @Post()
  async migrateEvent(@Body() oldEventDoc: EventDto) {
    return await this.migrationsService.migrateEvent(oldEventDoc);
  }
}
