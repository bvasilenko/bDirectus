import { spawn } from 'node:child_process';
import { BDirectusError } from '../errors.js';
import type { BinaryDirectiveResult, BinaryName } from '../types/directive.js';

export interface SpawnBinaryOptions {
  binary: BinaryName;
  command: string;
  stdin: string;
  timeoutMs: number;
  maxOutputBytes?: number;
}

const DEFAULT_MAX_OUTPUT_BYTES = 64 * 1024;

export function spawnBinary(options: SpawnBinaryOptions): Promise<BinaryDirectiveResult> {
  const startedAt = Date.now();
  const maxOutputBytes = options.maxOutputBytes ?? DEFAULT_MAX_OUTPUT_BYTES;

  return new Promise((resolve) => {
    const child = spawn(options.command, [], { stdio: ['pipe', 'pipe', 'pipe'], shell: false });
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let settled = false;
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, options.timeoutMs);

    child.stdout.on('data', (chunk: Buffer) => appendBounded(stdoutChunks, chunk, maxOutputBytes));
    child.stderr.on('data', (chunk: Buffer) => appendBounded(stderrChunks, chunk, maxOutputBytes));

    child.on('error', (cause) => {
      clearTimeout(timer);
      if (settled) {
        return;
      }
      settled = true;
      resolve(failedResult(options.binary, startedAt, 'binary-spawn-failed', cause.message, null, false));
    });

    child.on('close', (exitCode) => {
      clearTimeout(timer);
      if (settled) {
        return;
      }
      settled = true;

      const stdout = Buffer.concat(stdoutChunks).toString('utf8').trim();
      const stderr = Buffer.concat(stderrChunks).toString('utf8').trim();
      const truncated = Buffer.concat(stdoutChunks).byteLength >= maxOutputBytes || Buffer.concat(stderrChunks).byteLength >= maxOutputBytes;

      if (timedOut) {
        resolve(failedResult(options.binary, startedAt, 'binary-timeout', stderr || 'Binary execution timed out.', exitCode, true));
        return;
      }

      if (stdout.length === 0) {
        resolve(failedResult(options.binary, startedAt, 'binary-malformed-output', stderr || 'Binary stdout was empty.', exitCode, false));
        return;
      }

      resolve({
        binary: options.binary,
        status: 'directive',
        stdout,
        exitCode,
        stderr: stderr.length > 0 ? stderr : undefined,
        durationMs: Date.now() - startedAt,
        timedOut: false,
        truncated
      });
    });

    child.stdin.end(options.stdin);
  });
}

function appendBounded(chunks: Buffer[], chunk: Buffer, maxBytes: number): void {
  const current = chunks.reduce((sum, entry) => sum + entry.byteLength, 0);
  const remaining = maxBytes - current;

  if (remaining <= 0) {
    return;
  }

  chunks.push(chunk.byteLength <= remaining ? chunk : chunk.subarray(0, remaining));
}

function failedResult(
  binary: BinaryName,
  startedAt: number,
  errorCode: BDirectusError['code'],
  message: string,
  exitCode: number | null,
  timedOut: boolean
): BinaryDirectiveResult {
  return {
    binary,
    status: 'failed',
    stdout: message,
    exitCode,
    errorCode,
    durationMs: Date.now() - startedAt,
    timedOut,
    truncated: false
  };
}
