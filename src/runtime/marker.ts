import { BDirectusError } from '../errors.js';

export interface MarkerMatch {
  present: boolean;
  style: 'sentinel' | 'json-tail';
  paths: string[];
}

const SENTINEL_PATTERN = /\[\[\s*bsuite(?::[^\]]+)?\s*\]\]/i;
const JSON_TAIL_KEY = '_bsuite';
const DIRECTIVE_KEY = 'bsuite_directive';

export function detectMarker(payload: unknown, style: 'sentinel' | 'json-tail', directiveField = DIRECTIVE_KEY): MarkerMatch {
  const paths = style === 'sentinel' ? findSentinelPaths(payload, directiveField) : findJsonTailPaths(payload, directiveField);

  return {
    present: paths.length > 0,
    style,
    paths
  };
}

function findSentinelPaths(value: unknown, directiveField: string, path = '$'): string[] {
  if (typeof value === 'string') {
    return SENTINEL_PATTERN.test(value) ? [path] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => findSentinelPaths(entry, directiveField, `${path}[${index}]`));
  }

  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, entry]) => key === directiveField ? [] : findSentinelPaths(entry, directiveField, `${path}.${key}`));
  }

  return [];
}

function findJsonTailPaths(value: unknown, directiveField: string, path = '$'): string[] {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const splitIndex = trimmed.lastIndexOf('\n---bsuite---\n');

    if (splitIndex === -1) {
      return [];
    }

    const tail = trimmed.slice(splitIndex + '\n---bsuite---\n'.length);

    try {
      const parsed = JSON.parse(tail) as unknown;
      return isRecord(parsed) && JSON_TAIL_KEY in parsed ? [path] : [];
    } catch (cause) {
      throw new BDirectusError('binary-malformed-output', 'JSON-tail marker is not valid JSON.', { cause });
    }
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => findJsonTailPaths(entry, directiveField, `${path}[${index}]`));
  }

  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, entry]) => {
      if (key === directiveField) {
        return [];
      }

      if (key === JSON_TAIL_KEY) {
        return [path];
      }

      return findJsonTailPaths(entry, directiveField, `${path}.${key}`);
    });
  }

  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
