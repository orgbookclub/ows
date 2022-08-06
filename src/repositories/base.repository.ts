/**
 * The Base Repository class for interacting with the database.
 */
export abstract class BaseRepository<T> {
  abstract create(item): Promise<T>;
  abstract get(id: string): Promise<T>;
  abstract getAll(): Promise<T[]>;
  abstract find(query): Promise<T[]>;
  abstract update(id: string, updateDto): Promise<T>;
  abstract delete(id: string);
}
