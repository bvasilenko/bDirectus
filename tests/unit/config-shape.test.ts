import { describe, expect, it } from 'vitest';
import { BINARY_NAMES, loadBDirectusConfig } from '../../src/config.js';
import { BDirectusError } from '../../src/errors.js';

const baseEnv = {
  BDIRECTUS_COLLECTIONS: 'articles,pages'
};

describe('loadBDirectusConfig', () => {
  it('loads defaults for required collection configuration', () => {
    const config = loadBDirectusConfig(baseEnv);

    expect(config.collections).toEqual(['articles', 'pages']);
    expect(config.directiveField).toBe('bsuite_directive');
    expect(config.markerStyle).toBe('sentinel');
    expect(config.binaryTimeoutMs).toBe(5000);
    expect(BINARY_NAMES.every((binary) => config.binaries[binary])).toBe(true);
  });

  it('deduplicates comma-separated collections while preserving order', () => {
    const config = loadBDirectusConfig({ BDIRECTUS_COLLECTIONS: 'articles, pages, articles' });

    expect(config.collections).toEqual(['articles', 'pages']);
  });

  it('honors explicit binary selection and per-binary paths', () => {
    const config = loadBDirectusConfig({
      ...baseEnv,
      BDIRECTUS_BINARIES: 'bground,bspector',
      BDIRECTUS_BINARY_PATH_BGROUND: '/opt/bin/bground',
      BDIRECTUS_DIRECTIVE_FIELD: 'custom_directive',
      BDIRECTUS_MARKER_STYLE: 'json-tail',
      BDIRECTUS_BINARY_TIMEOUT_MS: '250'
    });

    expect(config.binaries).toMatchObject({ bground: true, banchor: false, bspector: true });
    expect(config.binaryPaths.bground).toBe('/opt/bin/bground');
    expect(config.directiveField).toBe('custom_directive');
    expect(config.markerStyle).toBe('json-tail');
    expect(config.binaryTimeoutMs).toBe(250);
  });

  it('rejects missing collections', () => {
    expect(() => loadBDirectusConfig({})).toThrow(BDirectusError);
  });

  it('rejects unknown binary names', () => {
    expect(() => loadBDirectusConfig({ ...baseEnv, BDIRECTUS_BINARIES: 'bground,unknown' })).toThrow(BDirectusError);
  });

  it('rejects empty explicit binary selection', () => {
    expect(() => loadBDirectusConfig({ ...baseEnv, BDIRECTUS_BINARIES: ' ' })).toThrow(BDirectusError);
  });

  it('rejects non-positive timeouts', () => {
    expect(() => loadBDirectusConfig({ ...baseEnv, BDIRECTUS_BINARY_TIMEOUT_MS: '0' })).toThrow(BDirectusError);
  });

  it('rejects unsupported marker styles', () => {
    expect(() => loadBDirectusConfig({ ...baseEnv, BDIRECTUS_MARKER_STYLE: 'xml' })).toThrow(BDirectusError);
  });
});
