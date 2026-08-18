import type { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.ip} ${new Date().toISOString()} ${req.method} ${req.hostname} ${req.url}`);
  next();
};
