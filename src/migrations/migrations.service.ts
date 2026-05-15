import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongoClient } from "mongodb";

import { GoodreadsService } from "../book-info/goodreads.service";
import { StorygraphService } from "../book-info/storygraph.service";
import { BooksService } from "../books/books.service";
import { BookDto } from "../books/dto/book.dto";
import { EventStatus } from "../events/dto/event-status";
import { EventType } from "../events/dto/event-type";
import { ParticipantDto } from "../events/dto/participant.dto";
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
   * @param configService Service for interacting with env variables.
   * @param booksService Service for interacting with @see Book documents in DB.
   * @param usersService Service for interacting with @see User documents in DB.
   * @param eventsService Service for interacting with @see Event documents in DB.
   * @param goodreadsService Service for Goodreads.
   * @param storygraphService Service for Storygraph.
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly booksService: BooksService,
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
    private readonly goodreadsService: GoodreadsService,
    private readonly storygraphService: StorygraphService,
  ) {
    Logger.debug("Initialized MigrationsService");
    this.client = new MongoClient(
      this.configService.get<string>("MONGODB_URI"),
    );
    this.client.connect();
  }

  /**
   * Update books.
   */
  async updateBooks() {
    const allBooks = await this.booksService.getAllBooks();
    for await (const bookDoc of allBooks) {
      try {
        const url = bookDoc.url;
        let book: BookDto;
        if (this.goodreadsService.GR_BASE_URLS.some((x) => url.startsWith(x))) {
          book = await this.goodreadsService.getBook(url);
        } else if (url.startsWith(this.storygraphService.SG_BASE_URL)) {
          book = await this.storygraphService.getBook(url);
        }
        Logger.log(`Updating docu ${bookDoc._id}`);
        bookDoc.numPages = book.numPages;
        await this.booksService.updateBook(bookDoc._id, bookDoc);
      } catch {
        Logger.log(`Error updating docu ${bookDoc._id}`);
      }
    }
  }

  /**
   * Migrates all events from old db to new db.
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
   * Migrates a single event from old format to new db.
   *
   * @param doc The document representing an event in the old format.
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
   * Returns the eventType for an event.
   *
   * Defaults to Buddy Read for most cases, unless specified.
   *
   * @param doc The old document.
   * @returns The event type.
   */
  private getEventType(doc: any) {
    let eventType = EventType.BuddyRead;
    if (doc.type === "MR") eventType = EventType.MonthlyRead;
    return eventType;
  }

  /**
   * Returns the event status based on the dates and participants.
   *
   * @param startDate The start date of the event.
   * @param endDate The end date of the event.
   * @param readers The list of readers for the event.
   * @param interested The list of interested users for the event.
   * @returns The event status.
   */
  private getEventStatus(
    startDate: Date,
    endDate: Date,
    readers: ParticipantDto[],
    interested: ParticipantDto[],
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
   * Returns a list of  participant dto objects from the user Ids and their score.
   *
   * @param userIds A list or set of user ids.
   * @param score The score for the user for the event.
   * @returns A list of participant dto objects.
   */
  private async getParticipants(
    userIds: string[] | Set<string>,
    score: number,
  ) {
    const participants: ParticipantDto[] = [];
    for (const userId of userIds) {
      const userDoc = await this.getUserDoc(userId);
      participants.push({
        user: userDoc._id,
        points: score,
      });
    }
    return participants;
  }

  /**
   * Returns a user document with the given userId.
   *
   * @param userId The user id of the user.
   * @returns The user document.
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
   * Returns a book document with the given url.
   *
   * @param url The URL of the book.
   * @returns The book document.
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
