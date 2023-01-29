import { Module } from "@nestjs/common";

import { BooksModule } from "../books/books.module";
import { EventsModule } from "../events/events.module";
import { UsersModule } from "../users/users.module";

import { MigrationsController } from "./migrations.controller";
import { MigrationsService } from "./migrations.service";

/**
 * The Migrations Module.
 * This module is responsible for handling DB migrations from old schema to newer one.
 */
@Module({
  imports: [BooksModule, UsersModule, EventsModule],
  controllers: [MigrationsController],
  providers: [MigrationsService],
})
export class MigrationsModule {}
