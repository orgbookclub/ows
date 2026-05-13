import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from "@nestjs/common";
import { isValidObjectId } from "mongoose";

/**
 * Validates that a route parameter is a syntactically valid Mongo `ObjectId`.
 *
 * Applied as `@Param("id", ParseObjectIdPipe) id: string`, it short-circuits
 * the request with an HTTP 400 before the value ever reaches Mongoose, which
 * means controllers and services never see a malformed id and a downstream
 * Mongoose `CastError` becomes structurally impossible.
 */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  /**
   * Validates the incoming value and returns it unchanged when valid.
   *
   * @param value The raw route parameter value.
   * @param metadata The Nest argument metadata, used to surface the parameter
   * name in the error message.
   * @returns The validated value, returned as-is so downstream consumers keep
   * working with the original string representation of the id.
   */
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!isValidObjectId(value)) {
      const param = metadata.data ?? "id";
      throw new BadRequestException(
        `Invalid value "${String(value)}" for parameter "${param}".`,
      );
    }
    return value;
  }
}
