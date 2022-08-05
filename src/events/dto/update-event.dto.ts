import { PartialType } from "@nestjs/swagger";

import { CreateEventDto } from "./create-event.dto";

/**
 * Dto object used when an event is updated.
 */
export class UpdateEventDto extends PartialType(CreateEventDto) {}
