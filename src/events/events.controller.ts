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
  async create(@Body() createEventDto: CreateEventDto) {
    return await this.eventsService.create(createEventDto);
  }

  @Post(':url')
  async createFromUrl(
    @Param('url') url: string,
    @Body() createEventDto: CreateEventDto,
  ) {
    return await this.eventsService.createFromUrl(url, createEventDto);
  }

  @Get()
  async findAll() {
    return await this.eventsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.eventsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return await this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.eventsService.remove(id);
  }
}
