import { PartialType } from "@nestjs/swagger";

import { EventDto } from "./event.dto";

/**
 * Dto object used when an event is created.
 */
export class CreateEventDto extends PartialType(EventDto) {}
