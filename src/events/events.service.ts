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
  }

  async findAll() {
    return await this.repository.getAll();
  }

  async findOne(id: string) {
    return await this.repository.find({ id: id });
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    return await this.repository.update(id, updateEventDto);
  }

  async remove(id: string) {
    await this.repository.delete(id);
    return true;
  }
}
