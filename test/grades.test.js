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

test('uses the same slope below and above an 80 percent threshold', () => {
  for (let points = 0; points <= 55; points += 0.5) {
    assert.equal(gradeFor(points, 100, 80), 1);
  }
  for (const [points, expected] of [[55.5, 1.1], [60, 2], [70, 4], [80, 6], [90, 8], [100, 10]]) {
    assert.equal(gradeFor(points, 100, 80), expected);
  }
});

test('calculates half-point scores before rounding', () => {
  assert.equal(gradeFor(77, 100, 80), 5.4);
  assert.equal(gradeFor(77.5, 100, 80), 5.5);
  assert.equal(gradeFor(49.5, 50, 70), 9.9);
  assert.equal(gradeFor(20.5, 31.5, 65), 6);
  assert.equal(gradeFor(4.5, 8, 50), 6.5);
});

test('rounds an exact half tenth upwards', () => {
  assert.equal(gradeFor(120.5, 160, 75), 6.1);
});

test('extends a low threshold to zero points with the same slope', () => {
  assert.equal(gradeFor(0, 100, 50), 2);
  assert.equal(gradeFor(25, 100, 50), 4);
});
