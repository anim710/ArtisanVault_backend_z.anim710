export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
  }
}

export function asyncHandler(
  fn: (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<unknown>
) {
  return (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
