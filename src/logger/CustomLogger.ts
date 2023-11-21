import { ConsoleLogger, LogLevel, LoggerService } from "@nestjs/common";
import { TelemetryClient, setup, start } from "applicationinsights";
import { SeverityLevel } from "applicationinsights/out/Declarations/Contracts";

/**
 * A Custom Logger extending the base logger provided by NestJS.
 */
export class CustomLogger extends ConsoleLogger implements LoggerService {
  private appInsightsClient: TelemetryClient;

  /**
   * Constructor.
   */
  constructor() {
    super();
    setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING);
    start();
    this.appInsightsClient = new TelemetryClient(
      process.env.APPLICATIONINSIGHTS_CONNECTION_STRING ?? "N/A",
    );
  }

  /**
   * Write a 'log' level log.
   *
   * @param message The message.
   * @param {...any} optionalParams Optional Parameters.
   */
  log(message: any, ...optionalParams: any[]) {
    super.log(message, ...optionalParams);
    this.appInsightsClient.trackTrace({
      message,
      severity: SeverityLevel.Information,
    });
  }

  /**
   * Write a 'error' level log.
   *
   * @param message The message.
   * @param {...any} optionalParams Optional Parameters.
   */
  error(message: any, ...optionalParams: any[]) {
    super.error(message, ...optionalParams);
    this.appInsightsClient.trackException({
      exception: message,
      severity: SeverityLevel.Error,
      properties: optionalParams,
    });
  }

  /**
   * Write a 'warn' level log.
   *
   * @param message The message.
   * @param {...any} optionalParams Optional Parameters.
   */
  warn(message: any, ...optionalParams: any[]) {
    super.warn(message, ...optionalParams);
    this.appInsightsClient.trackTrace({
      message: message,
      severity: SeverityLevel.Warning,
      properties: optionalParams,
    });
  }

  /**
   * Write a 'debug' level log.
   *
   * @param message The message.
   * @param {...any} optionalParams Optional Parameters.
   */
  debug(message: any, ...optionalParams: any[]) {
    super.debug(message, ...optionalParams);
    this.appInsightsClient.trackTrace({
      message: message,
      severity: SeverityLevel.Verbose,
      properties: optionalParams,
    });
  }

  /**
   * Write a 'verbose' level log.
   *
   * @param message The message.
   * @param {...any} optionalParams Optional Parameters.
   */
  verbose(message: any, ...optionalParams: any[]) {
    super.verbose(message, ...optionalParams);
  }

  /**
   * Set log levels.
   *
   * @param levels The Log levels.
   */
  setLogLevels(levels: LogLevel[]) {
    super.setLogLevels(levels);
  }
}
