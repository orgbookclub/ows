export abstract class BaseRepository<T> {
  abstract create(item: T);
  abstract get(id);
  abstract getAll();
  abstract find(query);
  abstract update(id, updateDto);
  abstract delete(id);
}
