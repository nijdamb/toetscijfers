import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../www/index.js';

test('redirects www requests to the HTTPS apex with their path and query intact', () => {
  for (const suffix of [
    '/',
    '/toetscijfers-deelkaart.jpg?bron=bericht',
    '//voorbeeld.nl/a%2Fb?q=1&q=2',
  ]) {
    const response = worker.fetch(new Request('http://www.toetscijfers.nl' + suffix));
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('Location'), 'https://toetscijfers.nl' + suffix);
  }
});
