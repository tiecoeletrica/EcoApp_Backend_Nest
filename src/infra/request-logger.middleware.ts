// src/request-logger.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { jwtDecode } from "jwt-decode";
import { UserPayload } from "./auth/jwt-strategy.guard";

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let userId = "Unknown";

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwtDecode<UserPayload>(token);
        if (decoded && decoded.sub) {
          userId = decoded.sub;
        }
      } catch (error) {
        console.error("Error decoding JWT:", error);
      }
    }

    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}
      User ID: ${userId}`
      // Body: ${JSON.stringify(req.body, null, 2)}`
    );

    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${
          res.statusCode
        } ${duration}ms`
      );
    });

    next();
  }
}
