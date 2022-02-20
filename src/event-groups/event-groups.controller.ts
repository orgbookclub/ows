import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventGroupsService } from './event-groups.service';
import { CreateEventGroupDto } from './dto/create-event-group.dto';
import { UpdateEventGroupDto } from './dto/update-event-group.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Event Groups')
@Controller('event-groups')
export class EventGroupsController {
  constructor(private readonly eventGroupsService: EventGroupsService) {}

  @Post()
  create(@Body() createEventGroupDto: CreateEventGroupDto) {
    return this.eventGroupsService.create(createEventGroupDto);
  }

  @Get()
  findAll() {
    return this.eventGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventGroupsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventGroupDto: UpdateEventGroupDto) {
    return this.eventGroupsService.update(+id, updateEventGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventGroupsService.remove(+id);
  }
}
