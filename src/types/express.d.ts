import type { ValidatedRequest } from './validatedRequest';

declare global {
  namespace Express {
    interface Request {
      validated: ValidatedRequest['validated'];
    }
  }
}

export {};
