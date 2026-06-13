import type { ResolvedBDirectusConfig } from '../config.js';
import { BDirectusError } from '../errors.js';
import { fanOut } from '../runtime/fanOut.js';
import { detectMarker } from '../runtime/marker.js';

export interface ProcessPayloadOptions {
  payload: unknown;
  collection: string;
  config: ResolvedBDirectusConfig;
}

export async function processPayload(options: ProcessPayloadOptions): Promise<unknown> {
  if (!options.config.collections.includes(options.collection)) {
    throw new BDirectusError('collection-not-allowlisted', `Collection is not allowlisted: ${options.collection}.`);
  }

  if (!isRecord(options.payload)) {
    return options.payload;
  }

  const marker = detectMarker(options.payload, options.config.markerStyle, options.config.directiveField);

  if (!marker.present) {
    return options.payload;
  }

  if (hasForeignDirective(options.payload[options.config.directiveField])) {
    throw new BDirectusError('marker-collision', `Directive field already contains an unsupported value: ${options.config.directiveField}.`);
  }

  const bundle = await fanOut({ payload: options.payload, collection: options.collection, config: options.config });

  return {
    ...options.payload,
    [options.config.directiveField]: bundle
  };
}

function hasForeignDirective(value: unknown): boolean {
  if (value === undefined || value === null) {
    return false;
  }

  return !(isRecord(value) && value.schema === 'bdirectus.directive-bundle.v1');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
