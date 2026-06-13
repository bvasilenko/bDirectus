#!/usr/bin/env node
process.stdin.resume();
process.stdin.on('end', () => {
  process.stdout.write('UNSAFE: fake directive');
  process.exitCode = 1;
});
