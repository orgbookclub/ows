import { BaseRepository } from './base.repository';

export class MockRepository<T> extends BaseRepository<T> {
  databaseArray: Array<any>;

  constructor(databaseArray: Array<any>) {
    super();
    this.databaseArray = databaseArray;
  }

  async create(item: T) {
    const mockId = 69;
    const itemDoc = { _id: 'mock random uuid', id: mockId, ...item };
    this.databaseArray.push(itemDoc);
    return itemDoc;
  }

  async get(id: number) {
    return this.databaseArray.find((doc) => doc.id === id);
  }

  async getAll() {
    return this.databaseArray;
  }

  async find(query: any) {
    return this.databaseArray.filter((doc) => {
      let res = true;
      for (const property in query) {
        res = res && doc[property] === query[property];
      }
      return res;
    });
  }

  async update(id: number, updateDto) {
    const index = this.databaseArray.findIndex((doc) => doc.id === id);
    const updatedDoc = this.databaseArray[index];
    for (const property in updateDto) {
      updatedDoc[property] = updateDto[property];
    }
    this.databaseArray[index] = updatedDoc;
    return updatedDoc;
  }

  async delete(id: number) {
    const index = this.databaseArray.findIndex((doc) => doc.id === id);
    this.databaseArray.splice(index, index + 1);
    return;
  }
}
