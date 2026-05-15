import { ConsoleLogger, LogLevel, LoggerService } from "@nestjs/common";
import {
  Logger as OtelLogger,
  SeverityNumber,
  logs,
} from "@opentelemetry/api-logs";

const LOGGER_NAME = "ows";
const LOGGER_VERSION = "1.0.0";

/**
 * Format a log message body for OTel emission.
 *
 * Strings pass through unchanged; `Error` instances yield their stack
 * (falling back to `name: message`); everything else is run through
 * `safeStringify`.
 *
 * @param message The original log message.
 * @returns The body string for the OTel `LogRecord`.
 */
function formatBody(message: any): string {
  if (typeof message === "string") return message;
  if (message instanceof Error) {
    return message.stack ?? `${message.name}: ${message.message}`;
  }
  return safeStringify(message);
}

/**
 * JSON-serialize any value with two safety nets: `Error` instances are
 * captured as `{name, message, stack}` (the default toJSON would yield
 * `{}`), and circular references collapse to `"[Circular]"`. Returns
 * `"[unserializable: …]"` if the JSON.stringify call itself throws.
 *
 * @param value The value to serialize.
 * @returns A JSON string suitable for an OTel attribute value.
 */
function safeStringify(value: any): string {
  try {
    const seen = new WeakSet<object>();
    return JSON.stringify(value, (_key, val) => {
      if (val instanceof Error) {
        return { name: val.name, message: val.message, stack: val.stack };
      }
      if (typeof val === "object" && val !== null) {
        if (seen.has(val)) return "[Circular]";
        seen.add(val);
      }
      return val;
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return `[unserializable: ${msg}]`;
  }
}

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
    const attributes: Record<string, string | number | boolean> = {};
    let params = optionalParams;
    if (params.length > 0 && typeof params[params.length - 1] === "string") {
      attributes.context = params[params.length - 1] as string;
      params = params.slice(0, -1);
    }
    if (params.length > 0) {
      attributes.params = safeStringify(params);
    }
    this.otelLogger.emit({
      severityNumber,
      severityText,
      body: formatBody(message),
      attributes,
    });
  }
}
