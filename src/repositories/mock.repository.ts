import { BaseRepository } from "./base.repository";

/**
 * Repository for mocking all DB operations for testing .
 */
export class MockRepository<T> extends BaseRepository<T> {
  databaseArray: Array<any>;

  /**
   * Initializes an instance of MockRepository.
   *
   * @param databaseArray The array that will mock the database.
   */
  constructor(databaseArray: Array<T>) {
    super();
    this.databaseArray = databaseArray;
  }

  /**
   * Appends a book document in the database array.
   *
   * @param item The dto object.
   * @returns The result document.
   */
  async create(item: any) {
    const itemDoc = { _id: "mock random uuid", ...item };
    this.databaseArray.push(itemDoc);
    return itemDoc;
  }

  /**
   * Gets a document with the given ID.
   *
   * @param id The object ID.
   * @returns The result document.
   */
  async get(id: string) {
    return this.databaseArray.find((doc) => doc._id === id);
  }

  /**
   * Gets all documents from the Database array.
   *
   * @returns The result document list.
   */
  async getAll() {
    return this.databaseArray;
  }

  /**
   * Gets all documents which match the query.
   *
   * @param query The query object.
   * @returns The result document list.
   */
  async find(query: any) {
    return this.databaseArray.filter((doc) => {
      let res = true;
      for (const property in query) {
        res = res && doc[property] === query[property];
      }
      return res;
    });
  }

  /**
   * Updates the document in the DB.
   *
   * @param id The object ID of the doc to update.
   * @param updateDto The updated doc.
   * @returns The result document (after update).
   */
  async update(id: string, updateDto: any) {
    const index = this.databaseArray.findIndex((doc) => doc._id === id);
    const updatedDoc = this.databaseArray[index];
    for (const property in updateDto) {
      updatedDoc[property] = updateDto[property];
    }
    this.databaseArray[index] = updatedDoc;
    return updatedDoc;
  }

  /**
   * Deletes a document from the database array.
   *
   * @param id The object ID of the doc.
   */
  async delete(id: string) {
    const index = this.databaseArray.findIndex((doc) => doc._id === id);
    if (index === -1) {
      return;
    }
    this.databaseArray.splice(index, 1);
    return;
  }

  /**
   * Returns a paginated slice of documents which match the query.
   * The mock ignores projection and populate planning and returns the matching
   * subset paged with skip/limit semantics matching the real repository.
   *
   * @param query The query object.
   * @param _sortOrder The sort key (ignored in the mock).
   * @param _selectString The projection string (ignored in the mock).
   * @param _populatePaths The populate plan (ignored in the mock).
   * @param page The 1-based page number.
   * @param pageSize The page size.
   * @returns The page of documents and the total count across all pages.
   */
  async findPaginated(
    query: any,
    _sortOrder: string | undefined,
    _selectString: string | undefined,
    _populatePaths: ReadonlyArray<string>,
    page: number,
    pageSize: number,
  ): Promise<{ items: T[]; total: number }> {
    const matched = await this.find(query);
    const start = (page - 1) * pageSize;
    return {
      items: matched.slice(start, start + pageSize),
      total: matched.length,
    };
  }
}
