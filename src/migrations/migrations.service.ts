import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongoClient } from "mongodb";

import { BooksService } from "../books/books.service";
import { EventStatus } from "../events/dto/event-status";
import { EventType } from "../events/dto/event-type";
import { Participant } from "../events/dto/participant";
import { EventsService } from "../events/events.service";
import { EventDocument } from "../events/schemas/event.schema";
import { UsersService } from "../users/users.service";

/**
 * The Migrations Service.
 */
@Injectable()
export class MigrationsService {
  private readonly client: MongoClient;
  private OLD_DATABASE = "production";
  private OLD_EVENTS_COLL = "events";

  /**
   * Initializes an instance of MigrationsService.
   *
   * @param {ConfigService} configService Service for interacting with env variables.
   * @param {BooksService} booksService Service for interacting with @see Book documents in DB.
   * @param {UsersService} usersService Service for interacting with @see User documents in DB.
   * @param {EventsService} eventsService Service for interacting with @see Event documents in DB.
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly booksService: BooksService,
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
  ) {
    Logger.debug("Initialized MigrationsService");
    this.client = new MongoClient(
      this.configService.get<string>("MONGODB_URI"),
    );
    this.client.connect();
  }

  /**
   *
   */
  async migrateAllEvents() {
    const oldDb = this.client.db(this.OLD_DATABASE);
    const eventsOld = oldDb.collection(this.OLD_EVENTS_COLL);
    const cursor = eventsOld.find();
    for await (const doc of cursor) {
      await this.migrateEvent(doc);
    }
  }

  /**
   *
   * @param doc
   */
  async migrateEvent(doc: any) {
    try {
      const url = doc.book.book_url;
      const bookDoc = await this.getBookDoc(url);
      const readers = await this.getParticipants(
        doc.read_by,
        doc.reader_points,
      );
      const leaders = await this.getParticipants(
        doc.requested_by,
        doc.leader_points,
      );

      const interestedIds = new Set([
        ...(doc.request_reactors ?? []),
        ...(doc.announce_reactors ?? []),
      ]);
      const interested = await this.getParticipants(interestedIds, 0);

      const startDate = new Date(doc.start_date * 1000);
      const endDate = new Date(doc.end_date * 1000);

      const eventType = this.getEventType(doc);
      const eventStatus = this.getEventStatus(
        startDate,
        endDate,
        readers,
        interested,
      );

      const event = {
        _id: doc._id,
        name: bookDoc.title,
        book: bookDoc._id,
        threads: [doc.channel_id],
        dates: {
          startDate: startDate,
          endDate: endDate,
        },
        type: eventType,
        status: eventStatus,
        requestedBy: leaders[0],
        interested: interested,
        readers: readers,
        leaders: leaders,
        description: "",
      };
      let eventDoc: EventDocument;
      if (await this.eventsService.findOne(doc._id)) {
        eventDoc = await this.eventsService.update(doc._id, event);
        Logger.debug(`Updated event: ${JSON.stringify(eventDoc._id)}`);
      } else {
        eventDoc = await this.eventsService.create(event);
        Logger.debug(`Created event: ${JSON.stringify(eventDoc)}`);
      }
    } catch (error) {
      Logger.error(`Error migrating event ${doc._id}: ${error}`);
    }
  }

  /**
   *
   * @param doc
   */
  private getEventType(doc: any) {
    let eventType = EventType.BuddyRead;
    if (doc.type === "MR") eventType = EventType.MonthlyRead;
    return eventType;
  }

  /**
   *
   * @param startDate
   * @param endDate
   * @param readers
   * @param interested
   */
  private getEventStatus(
    startDate: Date,
    endDate: Date,
    readers: Participant[],
    interested: Participant[],
  ) {
    let eventStatus = EventStatus.Completed;
    const now = new Date();

    if (now > endDate) {
      if (readers.length === 0) eventStatus = EventStatus.Rejected;
      else if (readers.length > 0) eventStatus = EventStatus.Completed;
    } else if (now < endDate && now > startDate) {
      if (interested.length > 10) eventStatus = EventStatus.Ongoing;
      else if (interested.length === 0) eventStatus = EventStatus.Rejected;
    } else if (now < startDate) {
      if (interested.length > 10) eventStatus = EventStatus.Announced;
      else eventStatus = EventStatus.Requested;
    }
    return eventStatus;
  }

  /**
   *
   * @param userIds
   * @param score
   */
  private async getParticipants(userIds: any, score: number) {
    const participants: Participant[] = [];
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const userDoc = await this.getUserDoc(userId);
      participants.push({
        user: userDoc._id,
        points: score,
      });
    }
    return participants;
  }

  /**
   *
   * @param userId
   * @returns
   */
  private async getUserDoc(userId: string) {
    const userDto = {
      userId: userId,
      name: "",
      joinDate: new Date(),
      profile: { bio: "" },
    };
    let user = await this.usersService.findOneByUserId(userDto.userId);
    if (user === null) {
      Logger.debug(`Creating user with ID: ${userId}`);
      user = await this.usersService.create(userDto);
    }
    return user;
  }

  /**
   *
   * @param url
   */
  private async getBookDoc(url: string) {
    let book = await this.booksService.findBookByUrl(url);
    if (book === null) {
      Logger.debug(`Creating book with URL: ${url}`);
      book = await this.booksService.createBookFromUrl(url);
    }
    return book;
  }
}
