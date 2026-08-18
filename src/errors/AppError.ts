export class AppError extends Error {
  public readonly code: number;
  public readonly status: string;
  public readonly isOperational: boolean;

  constructor(message: string, code: number) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.status = `${code}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
