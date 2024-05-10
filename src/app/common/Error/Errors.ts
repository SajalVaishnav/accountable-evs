export class TooManyEmailRequestsError extends Error {
  constructor(meterId: string) {
    super(`Too many requests for meter ${meterId}`);
    this.name = "TooManyEmailRequestsError";
  }
}

export class AuthenticationError extends Error {
  constructor(meterId: string) {
    super(`Failed to authenticate meter ${meterId}`);
    this.name = "AuthenticationError";
  }
}

export class ParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParsingError";
  }
}
