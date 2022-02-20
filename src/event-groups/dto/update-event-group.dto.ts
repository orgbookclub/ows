import { PartialType } from '@nestjs/swagger';
import { CreateEventGroupDto } from './create-event-group.dto';

export class UpdateEventGroupDto extends PartialType(CreateEventGroupDto) {}
