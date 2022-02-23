export abstract class BaseRepository<T> {
  abstract create(item: T);
  abstract get(id: string);
  abstract getAll();
  abstract find(query);
  abstract update(id: string, updateDto);
  abstract delete(id: string);
}
