export function gradeFor(points, maximum, normPercent) {
  const normUnits = Math.round(normPercent * 100);
  const target = maximum * normUnits;
  const earned = points * 10000;
  const tenthsAboveSix = 40 * (earned - target) / (maximum * 10000 - target);
  return Math.max(10, 60 + Math.round(tenthsAboveSix)) / 10;
}
