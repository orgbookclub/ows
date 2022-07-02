import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from '../events/schemas/event.schema';
import { BaseRepository } from './base.repository';

export class EventRepository extends BaseRepository<Event> {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
  ) {
    super();
  }
  async create(item: Event) {
    return await this.eventModel.create(item);
  }
  async get(id: string) {
    return await this.eventModel.findById(id).exec();
  }
  async getAll() {
    return await this.eventModel.find().exec();
  }
  async find(query: any) {
    return await this.eventModel.find(query).exec();
  }
  async update(id: string, updateDto) {
    return await this.eventModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: 'after',
    });
  }
  async delete(id: string) {
    return await this.eventModel.findByIdAndRemove(id);
  }
}
