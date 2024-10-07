import { MiddlewareConsumer, Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { envSchema } from "./env";
import { HttpModule } from "./http/http.module";
import { RequestLoggerMiddleware } from "./request-logger.middleware";

@Module({
  imports: [
    HttpModule,
    AuthModule,
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
  ],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes("*");
  }
}
