export function gradeFor(points, maximum, normPercent) {
  const normUnits = Math.round(normPercent * 100);
  const target = maximum * normUnits;
  const earned = points * 10000;
  const tenths = earned <= target
    ? 10 + Math.round(50 * earned / target)
    : 60 + Math.round(40 * (earned - target) / (maximum * 10000 - target));
  return tenths / 10;
}
