#!/usr/bin/env node
process.stdin.resume();
process.stdin.on('end', () => {
  process.stdout.write('GROUNDED: fake directive');
});
