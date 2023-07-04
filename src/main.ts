import { writeFileSync } from "fs";
import path from "path";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle("OWS")
    .setDescription("API description for the Organized Web Server")
    .setVersion(process.env.npm_package_version)
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
