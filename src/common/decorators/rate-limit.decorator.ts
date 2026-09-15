import { SetMetadata } from '@nestjs/common';
import { RATE_LIMIT_KEY } from '../guards/rate-limiter.guard';

export const RateLimit = (windowMs: number, max: number) =>
  SetMetadata(RATE_LIMIT_KEY, { windowMs, max });
