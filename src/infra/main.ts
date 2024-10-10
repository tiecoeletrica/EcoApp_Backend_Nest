import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { Env } from "./env";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as compression from 'compression'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: false,
    cors: true,
  });

  const config = new DocumentBuilder()
    .setTitle("EcoApp")
    .setDescription("API for EcoApp site project")
    .setVersion("0.9")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);
  app.use(compression())

  const configService: ConfigService<Env, true> = app.get(ConfigService);
  const port = configService.get("PORT", { infer: true });

  // app.enableCors();
  await app.listen(port);
}
bootstrap();
