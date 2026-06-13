import { describe, expect, it } from 'vitest';
import { BDirectusError } from '../../src/errors.js';
import { processPayload } from '../../src/hook/process-payload.js';
import { createConfig, fakeBinary } from '../helpers/config.js';

describe('processPayload', () => {
  it('leaves payload object identity unchanged when no marker is present', async () => {
    const payload = { title: 'No marker' };

    await expect(processPayload({ payload, collection: 'articles', config: createConfig() })).resolves.toBe(payload);
  });

  it('leaves non-object payloads unchanged', async () => {
    await expect(processPayload({ payload: null, collection: 'articles', config: createConfig() })).resolves.toBeNull();
  });

  it('adds a directive bundle when a marker is present', async () => {
    const result = await processPayload({ payload: { title: 'With marker', body: '[[bsuite]]' }, collection: 'articles', config: createConfig() });

    expect(result).toMatchObject({
      bsuite_directive: {
        schema: 'bdirectus.directive-bundle.v1',
        collection: 'articles',
        results: [{ binary: 'bground', status: 'directive' }]
      }
    });
  });

  it('uses the configured directive field and marker style', async () => {
    const result = await processPayload({
      payload: { body: { _bsuite: { mode: 'review' } } },
      collection: 'articles',
      config: createConfig({ directiveField: 'custom_directive', markerStyle: 'json-tail' })
    });

    expect(result).toMatchObject({
      custom_directive: {
        schema: 'bdirectus.directive-bundle.v1',
        markerStyle: 'json-tail'
      }
    });
  });

  it('rejects collections outside the allowlist', async () => {
    await expect(processPayload({ payload: { body: '[[bsuite]]' }, collection: 'pages', config: createConfig() })).rejects.toThrow(BDirectusError);
  });

  it('rejects unsupported directive field collisions', async () => {
    await expect(processPayload({
      payload: { body: '[[bsuite]]', bsuite_directive: 'foreign value' },
      collection: 'articles',
      config: createConfig()
    })).rejects.toThrow(BDirectusError);
  });

  it('replaces an existing owned directive bundle on subsequent marker runs', async () => {
    const result = await processPayload({
      payload: {
        body: '[[bsuite]]',
        bsuite_directive: { schema: 'bdirectus.directive-bundle.v1', results: [] }
      },
      collection: 'articles',
      config: createConfig({ binaryPaths: { bground: fakeBinary('success.mjs') } })
    });

    expect(result).toMatchObject({
      bsuite_directive: {
        schema: 'bdirectus.directive-bundle.v1',
        results: [{ status: 'directive' }]
      }
    });
  });

  it('stores failed binary results in the directive bundle', async () => {
    const result = await processPayload({
      payload: { body: '[[bsuite]]' },
      collection: 'articles',
      config: createConfig({ binaryPaths: { bground: fakeBinary('empty.mjs') } })
    });

    expect(result).toMatchObject({
      bsuite_directive: {
        results: [{ status: 'failed', errorCode: 'binary-malformed-output' }]
      }
    });
  });
});
