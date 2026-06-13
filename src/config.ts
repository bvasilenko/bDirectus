import { BDirectusError } from './errors.js';
import type { BinaryName } from './types/directive.js';

export const BINARY_NAMES: readonly BinaryName[] = ['bground', 'banchor', 'bsmell', 'bratch', 'bwatch', 'bspector'] as const;

export interface BDirectusConfig {
  collections: string[];
  binaries: Partial<Record<BinaryName, boolean>>;
  directiveField?: string;
  markerStyle?: 'sentinel' | 'json-tail';
  binaryPaths?: Partial<Record<BinaryName, string>>;
  binaryTimeoutMs?: number;
}

export interface ResolvedBDirectusConfig {
  collections: string[];
  binaries: Record<BinaryName, boolean>;
  directiveField: string;
  markerStyle: 'sentinel' | 'json-tail';
  binaryPaths: Record<BinaryName, string>;
  binaryTimeoutMs: number;
}

export function loadBDirectusConfig(env: NodeJS.ProcessEnv = process.env): ResolvedBDirectusConfig {
  const collections = parseList(env.BDIRECTUS_COLLECTIONS);
  const enabledBinaryNames = env.BDIRECTUS_BINARIES === undefined ? [...BINARY_NAMES] : parseList(env.BDIRECTUS_BINARIES);
  const markerStyle = parseMarkerStyle(env.BDIRECTUS_MARKER_STYLE ?? 'sentinel');
  const binaryTimeoutMs = parseTimeout(env.BDIRECTUS_BINARY_TIMEOUT_MS ?? '5000');
  const binaries = Object.fromEntries(BINARY_NAMES.map((binary) => [binary, enabledBinaryNames.includes(binary)])) as Record<BinaryName, boolean>;
  const binaryPaths = Object.fromEntries(
    BINARY_NAMES.map((binary) => [binary, env[`BDIRECTUS_BINARY_PATH_${binary.toUpperCase()}`] ?? binary])
  ) as Record<BinaryName, string>;

  validateBinaryNames(enabledBinaryNames);

  if (collections.length === 0) {
    throw new BDirectusError('config-malformed', 'BDIRECTUS_COLLECTIONS must include at least one collection.');
  }

  if (!Object.values(binaries).some(Boolean)) {
    throw new BDirectusError('config-malformed', 'At least one b-* binary must be enabled.');
  }

  return {
    collections,
    binaries,
    directiveField: env.BDIRECTUS_DIRECTIVE_FIELD?.trim() || 'bsuite_directive',
    markerStyle,
    binaryPaths,
    binaryTimeoutMs
  };
}

function parseList(value: string | undefined): string[] {
  return [...new Set((value ?? '').split(',').map((entry) => entry.trim()).filter(Boolean))];
}

function parseMarkerStyle(value: string): 'sentinel' | 'json-tail' {
  if (value === 'sentinel' || value === 'json-tail') {
    return value;
  }

  throw new BDirectusError('config-malformed', 'BDIRECTUS_MARKER_STYLE must be sentinel or json-tail.');
}

function parseTimeout(value: string): number {
  const timeout = Number(value);

  if (!Number.isSafeInteger(timeout) || timeout <= 0) {
    throw new BDirectusError('config-malformed', 'BDIRECTUS_BINARY_TIMEOUT_MS must be a positive integer.');
  }

  return timeout;
}

function validateBinaryNames(names: string[]): void {
  const unknown = names.filter((name) => !BINARY_NAMES.includes(name as BinaryName));

  if (unknown.length > 0) {
    throw new BDirectusError('config-malformed', `Unknown b-* binary name: ${unknown.join(', ')}.`);
  }
}
