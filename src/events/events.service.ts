import { Injectable, Logger } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private repository: EventRepository) {
    Logger.debug('Initialized EventsService');
  }

  async create(createEventDto: CreateEventDto) {
    return await this.repository.create(createEventDto);
    return 'This action adds a new event';
  }

  async findAll() {
    return `This action returns all events`;
  }

  async findOne(id: string) {
    return `This action returns a #${id} event`;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  async remove(id: string) {
    return `This action removes a #${id} event`;
  }
}
