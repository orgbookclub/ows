import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Logger,
  Param,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Events')
@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {
    Logger.debug('Initialized EventsController');
  }

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Post(':url')
  createFromUrl(
    @Param('url') url: string,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventsService.createFromUrl(url, createEventDto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<boolean> {
    return this.eventsService.remove(id);
  }
}
