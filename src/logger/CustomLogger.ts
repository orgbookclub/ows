import { ConsoleLogger, LogLevel, LoggerService } from "@nestjs/common";
import {
  Logger as OtelLogger,
  SeverityNumber,
  logs,
} from "@opentelemetry/api-logs";

const LOGGER_NAME = "ows";
const LOGGER_VERSION = "1.0.0";

/**
 * A Custom Logger extending the base logger provided by NestJS.
 *
 * Console output is preserved via `super.<level>(...)`. Each log call is also
 * forwarded as an OpenTelemetry `LogRecord`; when `useAzureMonitor` has been
 * initialized in `main.ts`, the Azure Monitor exporter routes those records
 * to Application Insights as Trace telemetry.
 */
export class CustomLogger extends ConsoleLogger implements LoggerService {
  private readonly otelLogger: OtelLogger;

  /**
   * Constructor.
   */
  constructor() {
    super();
    this.otelLogger = logs.getLogger(LOGGER_NAME, LOGGER_VERSION);
  }

  /**
   * Write a 'log' level log.
   *
   * @param message The message.
   * @param {...any} optionalParams Optional Parameters.
   */
  log(message: any, ...optionalParams: any[]) {
    super.log(message, ...optionalParams);
    this.emit(SeverityNumber.INFO, "INFO", message, optionalParams);
  }

  /**
   * Write a 'error' level log.
   *
   * @param message The message.
   * @param {...any} optionalParams Optional Parameters.
   */
  error(message: any, ...optionalParams: any[]) {
    super.error(message, ...optionalParams);
    this.emit(SeverityNumber.ERROR, "ERROR", message, optionalParams);
  }

  /**
   * Write a 'warn' level log.
   *
   * @param message The message.
   * @param {...any} optionalParams Optional Parameters.
   */
  warn(message: any, ...optionalParams: any[]) {
    super.warn(message, ...optionalParams);
    this.emit(SeverityNumber.WARN, "WARN", message, optionalParams);
  }

  /**
   * Write a 'debug' level log.
   *
   * @param message The message.
   * @param {...any} optionalParams Optional Parameters.
   */
  debug(message: any, ...optionalParams: any[]) {
    super.debug(message, ...optionalParams);
    this.emit(SeverityNumber.DEBUG, "DEBUG", message, optionalParams);
  }

  /**
   * Write a 'verbose' level log.
   *
   * @param message The message.
   * @param {...any} optionalParams Optional Parameters.
   */
  verbose(message: any, ...optionalParams: any[]) {
    super.verbose(message, ...optionalParams);
    this.emit(SeverityNumber.TRACE, "TRACE", message, optionalParams);
  }

  /**
   * Set log levels.
   *
   * @param levels The Log levels.
   */
  setLogLevels(levels: LogLevel[]) {
    super.setLogLevels(levels);
  }

  /**
   * Emit a single OpenTelemetry log record built from a Nest log call.
   *
   * @param severityNumber The OTel severity number.
   * @param severityText The OTel severity text.
   * @param message The original log message.
   * @param optionalParams Optional parameters passed alongside the message;
   *  the last string element is treated as the Nest "context" tag.
   */
  private emit(
    severityNumber: SeverityNumber,
    severityText: string,
    message: any,
    optionalParams: any[],
  ) {
    const attributes: Record<string, any> = {};
    let context: string | undefined;
    if (optionalParams.length > 0) {
      const last = optionalParams[optionalParams.length - 1];
      if (typeof last === "string") {
        context = last;
      }
      attributes.params = optionalParams;
    }
    if (context) {
      attributes.context = context;
    }
    this.otelLogger.emit({
      severityNumber,
      severityText,
      body: typeof message === "string" ? message : JSON.stringify(message),
      attributes,
    });
  }
}
