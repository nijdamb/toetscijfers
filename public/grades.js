const pointsFormat = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 7 });

export function formatPoints(points) {
  return pointsFormat.format(points) + (points === 1 ? ' punt' : ' punten');
}

export function gradeFor(points, maximum, normPercent) {
  const normUnits = Math.round(normPercent * 100);
  const target = maximum * normUnits;
  const earned = points * 10000;
  const tenthsAboveSix = (40 * (earned - target)) / (maximum * 10000 - target);
  return Math.max(10, 60 + Math.round(tenthsAboveSix)) / 10;
}
