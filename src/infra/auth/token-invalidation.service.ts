import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class TokenInvalidationService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async invalidateUserTokens(userId: string): Promise<void> {
    const key = `invalidated:${userId}`;
    const expirationTime = 5 * 60 * 60 * 1000;
    const tokenCreatedAt = Math.floor(Date.now() / 1000) * 1000;
    await this.cacheManager.set(key, tokenCreatedAt, expirationTime);
  }

  async isTokenInvalidated(userId: string, iat: number): Promise<boolean> {
    const invalidatedAt = await this.cacheManager.get(`invalidated:${userId}`);
    if (invalidatedAt && Number(invalidatedAt) > iat * 1000) return true;
    else return false;
  }
}
