#!/usr/bin/env node
process.stdin.resume();
setTimeout(() => {
  process.stdout.write('late directive');
}, 1000);
