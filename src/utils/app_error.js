export class AppError extends Error {

  constructor(
    statusCode = 500,
    message = "Something went wrong",
    stack = null
  ) {

    super(message);

    this.status = false;

    this.statusCode = statusCode;

    this.message = message;

    this.stackTrace = stack || this.stack;
  }
}