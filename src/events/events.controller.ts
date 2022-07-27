import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Logger,
  Query,
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

  @Post('create')
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get('findAll')
  findAll() {
    return this.eventsService.findAll();
  }

  @Get('findOne')
  findOne(@Query('id') id: number) {
    return this.eventsService.findOne(id);
  }

  @Patch('update')
  update(@Query('id') id: number, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete('remove')
  remove(@Query('id') id: number) {
    return this.eventsService.remove(id);
  }
}
