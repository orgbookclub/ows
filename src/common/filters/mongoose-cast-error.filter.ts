import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  Logger,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { Error as MongooseError } from "mongoose";

/**
 * Maps a Mongoose `CastError` to an HTTP 400 `BadRequestException`.
 *
 * A `CastError` is thrown by Mongoose when a value cannot be coerced to the
 * schema-declared type, most commonly when a route receives a malformed
 * `ObjectId`. Without this filter, the error would surface as a generic
 * HTTP 500, which misleads clients into thinking the server is at fault.
 */
@Catch(MongooseError.CastError)
export class MongooseCastErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongooseCastErrorFilter.name);

  /**
   * Initializes a new instance of `MongooseCastErrorFilter`.
   *
   * @param httpAdapterHost The Nest HTTP adapter host used to write the
   * response in a transport-agnostic way.
   */
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {
    this.logger.debug("Initialized MongooseCastErrorFilter");
  }

  /**
   * Maps the caught Mongoose `CastError` to a 400 response.
   *
   * @param exception The caught Mongoose CastError instance.
   * @param host The Nest arguments host providing access to the underlying
   * request and response objects.
   */
  catch(exception: MongooseError.CastError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const message =
      `Invalid value "${String(exception.value)}" for parameter ` +
      `"${exception.path}".`;
    this.logger.debug(`Mongoose CastError mapped to 400: ${message}`);
    const badRequest = new BadRequestException(message);
    httpAdapter.reply(
      ctx.getResponse(),
      badRequest.getResponse(),
      badRequest.getStatus(),
    );
  }
}
