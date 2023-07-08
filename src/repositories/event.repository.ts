import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CreateEventDto } from "../events/dto/create-event.dto";
import { UpdateEventDto } from "../events/dto/update-event.dto";
import { Event, EventDocument } from "../events/schemas/event.schema";

import { BaseRepository } from "./base.repository";

/**
 * Repository for handling all DB operations related to @see Event objects.
 */
export class EventRepository extends BaseRepository<EventDocument> {
  /**
   * Initializes an instance of EventRepository.
   *
   * @param eventModel The mongoose model.
   */
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
  ) {
    super();
  }

  /**
   * Creates an event document in the database.
   *
   * @param item The dto object.
   * @returns The result document.
   */
  async create(item: CreateEventDto) {
    return await this.eventModel.create(item);
  }

  /**
   * Gets an event document with the given ID.
   *
   * @param id The object ID.
   * @returns The result document.
   */
  async get(id: string) {
    return await this.eventModel
      .findById(id)
      .populate("book")
      .populate("requestedBy.user")
      .populate("readers.user")
      .populate("leaders.user")
      .populate("interested.user");
  }

  /**
   * Gets all event documents from the DB.
   *
   * @returns The result document list.
   */
  async getAll() {
    return await this.eventModel.find().exec();
  }

  /**
   * Gets all event documents which match the query.
   *
   * @param query The query object.
   * @returns The result document list.
   */
  async find(query: any) {
    return await this.eventModel
      .find(query)
      .sort({ "dates.startDate": -1, "dates.endDate": -1 })
      .populate("book")
      .populate("requestedBy.user")
      .populate("readers.user")
      .populate("leaders.user")
      .populate("interested.user");
  }

  /**
   * Updates the event document in the DB.
   *
   * @param id The object ID of the doc to update.
   * @param updateDto The updated doc.
   * @returns The result document (after update).
   */
  async update(id: string, updateDto: UpdateEventDto) {
    return await this.eventModel
      .findByIdAndUpdate(id, updateDto, {
        returnDocument: "after",
      })
      .populate("book")
      .populate("requestedBy.user")
      .populate("readers.user")
      .populate("leaders.user")
      .populate("interested.user");
  }

  /**
   * Deletes a event document from the DB.
   *
   * @param id The object ID of the doc.
   */
  async delete(id: string) {
    return await this.eventModel.findByIdAndRemove(id);
  }
}
