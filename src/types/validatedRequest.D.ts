import type { Request } from 'express';

export interface ValidatedRequest<
  TBody = unknown,
  TParams = unknown,
  TQuery = unknown,
> extends Request {
  validated: {
    body: TBody;
    params: TParams;
    query: TQuery;
  };
}
