import { describe, expect, it } from 'vitest';
import { BDirectusError } from '../../src/errors.js';
import { detectMarker } from '../../src/runtime/marker.js';

describe('detectMarker', () => {
  it('detects sentinel markers in nested payload strings', () => {
    const result = detectMarker({ title: 'Ready', body: { text: '[[bsuite:review]]' } }, 'sentinel');

    expect(result.present).toBe(true);
    expect(result.paths).toEqual(['$.body.text']);
  });

  it('detects sentinel markers across arrays without stopping at the first match', () => {
    const result = detectMarker({ blocks: ['plain', '[[bsuite]]', { body: '[[bsuite:check]]' }] }, 'sentinel');

    expect(result.paths).toEqual(['$.blocks[1]', '$.blocks[2].body']);
  });

  it('ignores sentinel markers inside the configured directive field', () => {
    const result = detectMarker({ custom_directive: '[[bsuite]]', body: 'plain' }, 'sentinel', 'custom_directive');

    expect(result.present).toBe(false);
  });

  it('returns an absent marker result for primitive payloads', () => {
    expect(detectMarker(null, 'sentinel').present).toBe(false);
    expect(detectMarker(42, 'json-tail').present).toBe(false);
  });

  it('detects object json-tail markers', () => {
    const result = detectMarker({ body: { _bsuite: { mode: 'review' } } }, 'json-tail');

    expect(result.present).toBe(true);
    expect(result.paths).toEqual(['$.body']);
  });

  it('detects string json-tail markers at the tail boundary', () => {
    const result = detectMarker({ body: 'copy\n---bsuite---\n{"_bsuite":{"mode":"review"}}' }, 'json-tail');

    expect(result.present).toBe(true);
    expect(result.paths).toEqual(['$.body']);
  });

  it('ignores json-tail keys inside the configured directive field', () => {
    const result = detectMarker({ custom_directive: { _bsuite: true } }, 'json-tail', 'custom_directive');

    expect(result.present).toBe(false);
  });

  it('rejects malformed string json-tail markers', () => {
    expect(() => detectMarker({ body: 'text\n---bsuite---\n{' }, 'json-tail')).toThrow(BDirectusError);
  });
});
