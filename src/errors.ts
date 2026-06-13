export type BDirectusErrorCode =
  | 'binary-spawn-failed'
  | 'binary-timeout'
  | 'binary-malformed-output'
  | 'marker-collision'
  | 'directus-version-mismatch'
  | 'directive-injection-failed'
  | 'config-malformed'
  | 'collection-not-allowlisted'
  | 'interface-mount-failed'
  | 'fanout-budget-exceeded'
  | 'sandbox-bypass-required';

export class BDirectusError extends Error {
  readonly code: BDirectusErrorCode;

  constructor(code: BDirectusErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'BDirectusError';
    this.code = code;
  }
}
