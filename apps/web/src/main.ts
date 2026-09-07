// Original saves and the previous presentation remain playable in their own edition.
if (new URLSearchParams(window.location.search).get('edition') === 'original') {
  void import('./classic-main.ts');
} else {
  void import('./revised-main.ts');
}
