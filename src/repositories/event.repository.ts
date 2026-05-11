import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder } from "mongoose";

import { CreateEventDto } from "../events/dto/create-event.dto";
import { UpdateEventDto } from "../events/dto/update-event.dto";
import { Event, EventDocument } from "../events/schemas/event.schema";

import { BaseRepository } from "./base.repository";

/**
 * The default Mongoose sort spec used when no sort key is supplied.
 */
const DEFAULT_SORT: { [key: string]: SortOrder } = {
  "dates.startDate": -1,
  "dates.endDate": -1,
};

/**
 * Resolves a sort-key string to a Mongoose sort spec.
 *
 * @param sortOrder The sort key.
 * @returns The Mongoose sort spec.
 */
function resolveSortSpec(sortOrder?: string): { [key: string]: SortOrder } {
  if (sortOrder === "startDateAsc") {
    return { "dates.startDate": 1, "dates.endDate": 1 };
  }
  if (sortOrder === "startDateDesc") {
    return { "dates.startDate": -1, "dates.endDate": -1 };
  }
  if (sortOrder === "endDateAsc") {
    return { "dates.endDate": 1, "dates.startDate": 1 };
  }
  if (sortOrder === "endDateDesc") {
    return { "dates.endDate": -1, "dates.startDate": -1 };
  }
  return DEFAULT_SORT;
}

/**
 * The set of populate paths that the events repository understands,
 * along with the top-level event field they correspond to.
 */
const POPULATE_PATHS: ReadonlyArray<{ path: string; topLevel: string }> = [
  { path: "book", topLevel: "book" },
  { path: "requestedBy.user", topLevel: "requestedBy" },
  { path: "readers.user", topLevel: "readers" },
  { path: "leaders.user", topLevel: "leaders" },
  { path: "interested.user", topLevel: "interested" },
];

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
   * @param sortOrder The order in which the results should be sorted.
   * @returns The result document list.
   */
  async find(query: any, sortOrder?: string) {
    return await this.eventModel
      .find(query)
      .sort(resolveSortSpec(sortOrder))
      .populate("book")
      .populate("requestedBy.user")
      .populate("readers.user")
      .populate("leaders.user")
      .populate("interested.user");
  }

  /**
   * Gets a paginated slice of event documents which match the query, with optional projection.
   *
   * @param query The Mongoose filter query.
   * @param sortOrder The order in which the results should be sorted.
   * @param selectString A space-separated string for `.select()`, or undefined for all fields.
   * @param populatePaths The populate paths to apply (caller may omit some for perf).
   * @param page The 1-based page number.
   * @param pageSize The page size.
   * @returns The page of result documents and the total count across all pages.
   */
  async findPaginated(
    query: any,
    sortOrder: string | undefined,
    selectString: string | undefined,
    populatePaths: ReadonlyArray<string>,
    page: number,
    pageSize: number,
  ): Promise<{ items: EventDocument[]; total: number }> {
    let cursor = this.eventModel
      .find(query)
      .sort(resolveSortSpec(sortOrder))
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    if (selectString) cursor = cursor.select(selectString);
    for (const path of populatePaths) cursor = cursor.populate(path);
    const [items, total] = await Promise.all([
      cursor.exec(),
      this.eventModel.countDocuments(query).exec(),
    ]);
    return { items, total };
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
    await this.eventModel.findByIdAndDelete(id);
  }
}

/**
 * Returns the populate paths to apply for an events query, given a projection plan.
 * Inclusion mode keeps only paths whose top-level field is requested.
 * Exclusion mode keeps every path whose top-level field is not excluded.
 * Absence of projection keeps every populate path.
 *
 * @param mode The projection mode.
 * @param topLevelFields The set of top-level fields referenced by the projection.
 * @returns The populate path strings to apply.
 */
export function planEventPopulates(
  mode: "include" | "exclude" | "none",
  topLevelFields: Set<string>,
): string[] {
  if (mode === "none") return POPULATE_PATHS.map((p) => p.path);
  if (mode === "include") {
    return POPULATE_PATHS.filter((p) => topLevelFields.has(p.topLevel)).map(
      (p) => p.path,
    );
  }
  return POPULATE_PATHS.filter((p) => !topLevelFields.has(p.topLevel)).map(
    (p) => p.path,
  );
}
