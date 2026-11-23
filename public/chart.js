import { formatPoints, gradeFor } from './grades.js';

const chart = document.querySelector('#grade-chart');
const number = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 2 });

new ResizeObserver(([panel]) => {
  const scale = Math.min(1, chart.viewBox.baseVal.width / panel.contentRect.width);
  chart.style.setProperty('--chart-text-scale', scale);
}).observe(chart.parentElement);

const toggle = document.querySelector('.chart-toggle');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'false';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? 'Verberg grafiek' : 'Toon grafiek';
});

const x = (percent) => 30 + 2.5 * percent;
const y = (grade) => 300 - 27 * grade;

function renderMarker(group, percent, grade, text, above) {
  const markerX = x(percent);
  const marker = group.querySelector('circle');
  marker.setAttribute('cx', markerX);
  marker.setAttribute('cy', y(grade));
  const label = group.querySelector('text');
  label.setAttribute('x', markerX);
  label.setAttribute('y', y(grade) + (above ? -9 : 18));
  label.style.transform =
    percent > 50
      ? `translateX(max(-100%, ${x(0) - markerX}px))`
      : `translateX(min(0px, calc(${x(100) - markerX}px - 100%)))`;
  label.textContent = text;
}

export function renderGradeChart(maximum, norm, targetLabel) {
  chart.setAttribute('aria-hidden', String(!targetLabel));
  if (!targetLabel) return;

  const percentPerGrade = (100 - norm) / 4;
  const floorPercent = Math.max(0, norm - 5 * percentPerGrade);
  const startGrade = Math.max(1, 6 - norm / percentPerGrade);
  const points = [[x(0), y(startGrade)]];
  if (floorPercent > 0) points.push([x(floorPercent), y(1)]);
  points.push([x(100), y(10)]);
  chart
    .querySelector('polyline')
    .setAttribute('points', points.map((point) => point.join(',')).join(' '));

  const floorPoints = (maximum * Math.round(floorPercent * 10000)) / 1000000;
  const floorLabel = formatPoints(floorPoints);
  renderMarker(
    chart.querySelector('#chart-minimum'),
    floorPercent,
    startGrade,
    floorLabel,
    norm <= 50,
  );
  renderMarker(
    chart.querySelector('#chart-norm'),
    norm,
    6,
    targetLabel + ' · ' + number.format(norm) + '%',
    norm > 50,
  );
  chart.querySelector('title').textContent =
    'Cijfer per behaald percentage bij ' +
    number.format(maximum) +
    ' punten. Een 6,0 bij ' +
    targetLabel +
    ', oftewel ' +
    number.format(norm) +
    '%. Laagste cijfer: ' +
    gradeFor(0, maximum, norm).toLocaleString('nl-NL', { minimumFractionDigits: 1 }) +
    ' bij ' +
    floorLabel +
    '. Alle scores staan in de cijfertabel.';
}
