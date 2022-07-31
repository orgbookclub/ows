import { BaseRepository } from "./base.repository";

/**
 *
 */
export class MockRepository<T> extends BaseRepository<T> {
  databaseArray: Array<any>;

  /**
   *
   * @param databaseArray
   */
  constructor(databaseArray: Array<any>) {
    super();
    this.databaseArray = databaseArray;
  }

  /**
   *
   * @param item
   */
  async create(item: T) {
    const itemDoc = { _id: "mock random uuid", ...item };
    this.databaseArray.push(itemDoc);
    return itemDoc;
  }

  /**
   *
   * @param id
   */
  async get(id: string) {
    return this.databaseArray.find((doc) => doc._id === id);
  }

  /**
   *
   */
  async getAll() {
    return this.databaseArray;
  }

  /**
   *
   * @param query
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
   *
   * @param id
   * @param updateDto
   */
  async update(id: string, updateDto) {
    const index = this.databaseArray.findIndex((doc) => doc._id === id);
    const updatedDoc = this.databaseArray[index];
    for (const property in updateDto) {
      updatedDoc[property] = updateDto[property];
    }
    this.databaseArray[index] = updatedDoc;
    return updatedDoc;
  }

  /**
   *
   * @param id
   */
  async delete(id: string) {
    const index = this.databaseArray.findIndex((doc) => doc._id === id);
    this.databaseArray.splice(index, index + 1);
    return;
  }
}
