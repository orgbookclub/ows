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
   * @param {Model<EventDocument>} eventModel The mongoose model.
   */
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
  ) {
    super();
  }

  /**
   * Creates an event document in the database.
   *
   * @param {CreateEventDto} item The dto object.
   * @returns {Promise<EventDocument>} The result document.
   */
  async create(item: CreateEventDto): Promise<EventDocument> {
    return await this.eventModel.create(item);
  }

  /**
   * Gets an event document with the given ID.
   *
   * @param {string} id The object ID.
   * @returns {Promise<EventDocument>} The result document.
   */
  async get(id: string): Promise<EventDocument> {
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
   * @returns {Promise<EventDocument[]>} The result document list.
   */
  async getAll(): Promise<EventDocument[]> {
    return await this.eventModel.find().exec();
  }

  /**
   * Gets all event documents which match the query.
   *
   * @param {any} query The query object.
   * @returns {Promise<EventDocument[]>} The result document list.
   */
  async find(query: any): Promise<EventDocument[]> {
    return await this.eventModel
      .find(query)
      .populate("book")
      .populate("requestedBy.user")
      .populate("readers.user")
      .populate("leaders.user")
      .populate("interested.user");
  }

  /**
   * Updates the event document in the DB.
   *
   * @param {string} id The object ID of the doc to update.
   * @param {UpdateEventDto} updateDto The updated doc.
   * @returns {Promise<EventDocument>} The result document (after update).
   */
  async update(id: string, updateDto: UpdateEventDto): Promise<EventDocument> {
    return await this.eventModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: "after",
    });
  }

  /**
   * Deletes a event document from the DB.
   *
   * @param {string} id The object ID of the doc.
   */
  async delete(id: string) {
    return await this.eventModel.findByIdAndRemove(id);
  }
}
