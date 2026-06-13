import { resolve } from 'node:path';
import type { ResolvedBDirectusConfig } from '../../src/config.js';
import type { BinaryName } from '../../src/types/directive.js';

export const fakeBinaryDir = resolve('tests/fixtures/fake-binaries');

export type ConfigOverrides = Omit<Partial<ResolvedBDirectusConfig>, 'binaries' | 'binaryPaths'> & {
  binaries?: Partial<Record<BinaryName, boolean>>;
  binaryPaths?: Partial<Record<BinaryName, string>>;
};

export function fakeBinary(name: string): string {
  return resolve(fakeBinaryDir, name);
}

export function createConfig(overrides: ConfigOverrides = {}): ResolvedBDirectusConfig {
  const binaryPaths: Record<BinaryName, string> = {
    bground: fakeBinary('success.mjs'),
    banchor: fakeBinary('success.mjs'),
    bsmell: fakeBinary('success.mjs'),
    bratch: fakeBinary('success.mjs'),
    bwatch: fakeBinary('success.mjs'),
    bspector: fakeBinary('success.mjs')
  };

  const binaries: Record<BinaryName, boolean> = {
    bground: true,
    banchor: false,
    bsmell: false,
    bratch: false,
    bwatch: false,
    bspector: false
  };

  return {
    collections: ['articles'],
    directiveField: 'bsuite_directive',
    markerStyle: 'sentinel',
    binaryTimeoutMs: 500,
    ...overrides,
    binaryPaths: { ...binaryPaths, ...overrides.binaryPaths },
    binaries: { ...binaries, ...overrides.binaries }
  };
}
