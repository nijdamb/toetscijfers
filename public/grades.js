const pointsFormat = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 1 });

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

export function chartScores(maximum, norm) {
  function firstScoreMatching(matches) {
    let low = 0;
    let high = maximum * 2;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (matches(gradeFor(middle / 2, maximum, norm))) high = middle;
      else low = middle + 1;
    }
    return low / 2;
  }

  const minimum = gradeFor(0, maximum, norm);
  return {
    lastMinimum: firstScoreMatching((grade) => grade > minimum) - 0.5,
    firstSix: firstScoreMatching((grade) => grade >= 6),
  };
}
