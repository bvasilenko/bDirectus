import { describe, expect, it } from 'vitest';
import { BDirectusError } from '../../src/errors.js';
import { fanOut } from '../../src/runtime/fanOut.js';
import { spawnBinary } from '../../src/runtime/spawn-binary.js';
import { createConfig, fakeBinary } from '../helpers/config.js';

describe('spawnBinary', () => {
  it('captures stdout as the directive', async () => {
    const result = await spawnBinary({
      binary: 'bground',
      command: fakeBinary('success.mjs'),
      stdin: '{}',
      timeoutMs: 500
    });

    expect(result.status).toBe('directive');
    expect(result.stdout).toBe('GROUNDED: fake directive');
  });

  it('preserves directive stdout for non-zero domain verdict exits', async () => {
    const result = await spawnBinary({
      binary: 'bspector',
      command: fakeBinary('exit-one.mjs'),
      stdin: '{}',
      timeoutMs: 500
    });

    expect(result.status).toBe('directive');
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe('UNSAFE: fake directive');
  });

  it('captures stderr without treating it as the directive', async () => {
    const result = await spawnBinary({
      binary: 'bground',
      command: fakeBinary('stderr.mjs'),
      stdin: '{}',
      timeoutMs: 500
    });

    expect(result.status).toBe('directive');
    expect(result.stdout).toBe('GROUNDED: fake directive');
    expect(result.stderr).toBe('diagnostic detail');
  });

  it('maps missing binaries to spawn failure results', async () => {
    const result = await spawnBinary({
      binary: 'bground',
      command: fakeBinary('missing.mjs'),
      stdin: '{}',
      timeoutMs: 500
    });

    expect(result.status).toBe('failed');
    expect(result.errorCode).toBe('binary-spawn-failed');
  });

  it('maps empty stdout to malformed output', async () => {
    const result = await spawnBinary({
      binary: 'bground',
      command: fakeBinary('empty.mjs'),
      stdin: '{}',
      timeoutMs: 500
    });

    expect(result.status).toBe('failed');
    expect(result.errorCode).toBe('binary-malformed-output');
  });

  it('kills binaries that exceed the timeout', async () => {
    const result = await spawnBinary({
      binary: 'bground',
      command: fakeBinary('slow.mjs'),
      stdin: '{}',
      timeoutMs: 50
    });

    expect(result.status).toBe('failed');
    expect(result.timedOut).toBe(true);
    expect(result.errorCode).toBe('binary-timeout');
  });

  it('caps captured output and marks truncation', async () => {
    const result = await spawnBinary({
      binary: 'bground',
      command: fakeBinary('large.mjs'),
      stdin: '{}',
      timeoutMs: 500,
      maxOutputBytes: 16
    });

    expect(result.stdout).toHaveLength(16);
    expect(result.truncated).toBe(true);
  });
});

describe('fanOut', () => {
  it('runs every enabled binary and returns a directive bundle', async () => {
    const config = createConfig({
      binaries: { bground: true, banchor: true },
      binaryPaths: { bground: fakeBinary('success.mjs'), banchor: fakeBinary('success.mjs') }
    });

    const bundle = await fanOut({ payload: { body: '[[bsuite]]' }, collection: 'articles', config });

    expect(bundle.results).toHaveLength(2);
    expect(bundle.results.every((result) => result.status === 'directive')).toBe(true);
  });

  it('records per-binary failures without hiding successful sibling results', async () => {
    const config = createConfig({
      binaries: { bground: true, banchor: true },
      binaryPaths: { bground: fakeBinary('success.mjs'), banchor: fakeBinary('empty.mjs') }
    });

    const bundle = await fanOut({ payload: { body: '[[bsuite]]' }, collection: 'articles', config });

    expect(bundle.results.map((result) => result.status)).toEqual(['directive', 'failed']);
  });

  it('rejects fan-out with no enabled binaries', async () => {
    const config = createConfig({
      binaries: { bground: false, banchor: false, bsmell: false, bratch: false, bwatch: false, bspector: false }
    });

    await expect(fanOut({ payload: {}, collection: 'articles', config })).rejects.toThrow(BDirectusError);
  });
});
