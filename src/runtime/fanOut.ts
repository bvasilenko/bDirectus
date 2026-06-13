import type { ResolvedBDirectusConfig } from '../config.js';
import { BINARY_NAMES } from '../config.js';
import { BDirectusError } from '../errors.js';
import type { DirectiveBundle } from '../types/directive.js';
import { spawnBinary } from './spawn-binary.js';

export interface FanOutOptions {
  payload: unknown;
  collection: string;
  config: ResolvedBDirectusConfig;
}

export async function fanOut(options: FanOutOptions): Promise<DirectiveBundle> {
  const enabled = BINARY_NAMES.filter((binary) => options.config.binaries[binary]);

  if (enabled.length === 0) {
    throw new BDirectusError('fanout-budget-exceeded', 'No enabled b-* binaries are available for fan-out.');
  }

  const stdin = JSON.stringify({ collection: options.collection, payload: options.payload });
  const results = await Promise.all(
    enabled.map((binary) => spawnBinary({
      binary,
      command: options.config.binaryPaths[binary],
      stdin,
      timeoutMs: options.config.binaryTimeoutMs
    }))
  );

  return {
    schema: 'bdirectus.directive-bundle.v1',
    generatedAt: new Date().toISOString(),
    markerStyle: options.config.markerStyle,
    collection: options.collection,
    results
  };
}
