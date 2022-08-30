export class DebugLogger {
  constructor() {}

  log(value: string): void {
    console.log(value);
  }
}

export class NullLogger {
  constructor() {}

  log(value: string): void {
    // noop
  }
}

export interface Logger {
  log(value: string): void;
}
