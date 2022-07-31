import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CreateEventDto } from "../events/dto/create-event.dto";
import { Event, EventDocument } from "../events/schemas/event.schema";

import { BaseRepository } from "./base.repository";

/**
 *
 */
export class EventRepository extends BaseRepository<Event> {
  /**
   *
   * @param eventModel
   */
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
  ) {
    super();
  }
  /**
   *
   * @param item
   */
  async create(item: CreateEventDto) {
    return await this.eventModel.create(item);
  }
  /**
   *
   * @param id
   */
  async get(id: string) {
    return await this.eventModel.findById(id);
  }
  /**
   *
   */
  async getAll() {
    return await this.eventModel.find().exec();
  }
  /**
   *
   * @param query
   */
  async find(query: any) {
    return await this.eventModel.find(query).exec();
  }
  /**
   *
   * @param id
   * @param updateDto
   */
  async update(id: string, updateDto) {
    return await this.eventModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: "after",
    });
  }
  /**
   *
   * @param id
   */
  async delete(id: string) {
    return await this.eventModel.findByIdAndRemove(id);
  }
}
