if (process.env['NH_EDITION'] === 'original') {
  void import('./classic-main.ts');
} else {
  void import('./revised-main.ts');
}
