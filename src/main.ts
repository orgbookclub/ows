import { writeFileSync } from "fs";
import path from "path";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { useAzureMonitor } from "applicationinsights";

import { AppModule } from "./app.module";
import { CustomLogger } from "./logger/CustomLogger";
import { VERSION } from "./version";

/**
 * Initialize Azure Monitor (OpenTelemetry) before any other module loads.
 *
 * `useAzureMonitor` registers OpenTelemetry auto-instrumentation hooks on the
 * global provider registry. The hooks must be installed BEFORE Nest starts
 * importing HTTP/Mongo modules; otherwise those modules are loaded without
 * instrumentation and their spans never reach Application Insights. The call
 * is gated on `APPLICATIONINSIGHTS_CONNECTION_STRING` so local development
 * (where the env var is unset) still boots cleanly.
 */
function initializeAzureMonitor() {
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  if (!connectionString) {
    return;
  }
  useAzureMonitor({
    azureMonitorExporterOptions: {
      connectionString,
    },
  });
}

initializeAzureMonitor();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(CustomLogger));

  const config = new DocumentBuilder()
    .setTitle("OWS")
    .setDescription("API description for the Organized Web Server")
    .setVersion(VERSION)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  const outputPath = path.resolve(process.cwd(), "docs/openapi.json");
  writeFileSync(outputPath, JSON.stringify(document), { encoding: "utf8" });
  Logger.debug("Updated openapi.json");
  SwaggerModule.setup("api", app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
