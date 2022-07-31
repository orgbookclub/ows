import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { GoodreadsController } from "./goodreads.controller";
import { GoodreadsService } from "./goodreads.service";
import { StorygraphController } from "./storygraph.controller";
import { StorygraphService } from "./storygraph.service";

/**
 * Module for fetching Book information from external sources like Goodreads & Storygraph.
 */
@Module({
  imports: [HttpModule],
  controllers: [GoodreadsController, StorygraphController],
  providers: [GoodreadsService, StorygraphService],
  exports: [GoodreadsService, StorygraphService],
})
export class BookInfoModule {}
