const chart = document.querySelector('#grade-chart');
const number = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 2 });

const toggle = document.querySelector('.chart-toggle');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'false';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? 'Verberg grafiek' : 'Toon grafiek';
});

export function renderGradeChart(maximum, norm, targetLabel) {
  chart.setAttribute('aria-hidden', String(!targetLabel));
  if (!targetLabel) return;

  const x = (percent) => 30 + 2.5 * percent;
  const y = (grade) => 300 - 27 * grade;
  const percentPerGrade = (100 - norm) / 4;
  const floorPercent = norm - 5 * percentPerGrade;
  const startGrade = Math.max(1, 6 - norm / percentPerGrade);
  const points = [[x(0), y(startGrade)]];
  if (floorPercent > 0) points.push([x(floorPercent), y(1)]);
  points.push([x(100), y(10)]);
  chart
    .querySelector('polyline')
    .setAttribute('points', points.map((point) => point.join(',')).join(' '));

  const normX = x(norm);
  const marker = chart.querySelector('circle');
  marker.setAttribute('cx', normX);
  marker.setAttribute('cy', y(6));
  const label = chart.querySelector('.chart-label');
  label.setAttribute('x', normX);
  label.setAttribute('y', y(6) + (norm > 50 ? -9 : 18));
  label.style.transform =
    norm > 50
      ? `translateX(max(-100%, ${x(0) - normX}px))`
      : `translateX(min(0px, calc(${x(100) - normX}px - 100%)))`;
  label.textContent = targetLabel + ' · ' + number.format(norm) + '%';
  chart.querySelector('title').textContent =
    'Cijfer per behaald percentage bij ' +
    number.format(maximum) +
    ' punten. Een 6,0 bij ' +
    targetLabel +
    ', oftewel ' +
    number.format(norm) +
    '%. Alle scores staan in de cijfertabel.';
}
