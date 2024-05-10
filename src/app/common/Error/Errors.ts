export class TooManyEmailRequestsError extends Error {
  constructor(meterId: string) {
    super(`TooManyEmailRequestsError`);
  }
}

export class AuthenticationError extends Error {
  constructor(meterId: string) {
    super(`AuthError: Failed to authenticate meter ${meterId}`);
  }
}

export class ParsingError extends Error {
  constructor(message: string) {
    super(`ParsingError: ${message}`);
  }
}
