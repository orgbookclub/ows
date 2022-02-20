export abstract class BaseRepository<T> {
  abstract create(item: T): Promise<T>;
  abstract get(id: string): Promise<T>;
  abstract find(query): Promise<T[]>;
  abstract update(id: string, item: T): Promise<T>;
  abstract delete(id: string);
}
