import assert from 'node:assert/strict';
import test from 'node:test';
import { gradeFor } from '../public/grades.js';

test('maps zero, the selected threshold and full marks to their grades', () => {
  for (const norm of [60, 65, 70]) {
    assert.equal(gradeFor(0, 50, norm), 1);
    assert.equal(gradeFor(50 * norm / 100, 50, norm), 6);
    assert.equal(gradeFor(50, 50, norm), 10);
  }
});

test('interpolates each side of the threshold before rounding', () => {
  assert.equal(gradeFor(31, 50, 70), 5.4);
  assert.equal(gradeFor(31.5, 50, 70), 5.5);
  assert.equal(gradeFor(49.5, 50, 70), 9.9);
  assert.equal(gradeFor(20.5, 31.5, 65), 6);
  assert.equal(gradeFor(4.5, 8, 50), 6.5);
});

test('rounds an exact half tenth upwards', () => {
  assert.equal(gradeFor(0.5, 80, 62.5), 1.1);
});
