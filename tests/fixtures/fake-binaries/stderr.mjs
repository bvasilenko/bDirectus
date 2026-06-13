#!/usr/bin/env node
process.stdin.resume();
process.stdin.on('end', () => {
  process.stderr.write('diagnostic detail');
  process.stdout.write('GROUNDED: fake directive');
});
