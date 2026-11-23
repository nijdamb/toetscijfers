import { formatPoints, gradeFor } from './grades.js';

const chart = document.querySelector('#grade-chart');
const number = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 1 });

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

export function renderGradeChart(maximum, norm, scores, summary) {
  chart.setAttribute('aria-hidden', String(!scores));
  if (!scores) return;

  const percentPerGrade = (100 - norm) / 4;
  const floorPercent = Math.max(0, norm - 5 * percentPerGrade);
  const startGrade = Math.max(1, 6 - norm / percentPerGrade);
  const points = [[x(0), y(startGrade)]];
  if (floorPercent > 0) points.push([x(floorPercent), y(1)]);
  points.push([x(100), y(10)]);
  chart
    .querySelector('polyline')
    .setAttribute('points', points.map((point) => point.join(',')).join(' '));

  const floorLabel = formatPoints(scores.lastMinimum);
  const minimum = gradeFor(0, maximum, norm);
  renderMarker(
    chart.querySelector('#chart-minimum'),
    (scores.lastMinimum * 100) / maximum,
    minimum,
    floorLabel,
    norm <= 50,
  );
  const normPercent = (scores.firstSix * 100) / maximum;
  const normGrade = gradeFor(scores.firstSix, maximum, norm);
  renderMarker(
    chart.querySelector('#chart-norm'),
    normPercent,
    normGrade,
    formatPoints(scores.firstSix) + ' · ' + number.format(normPercent) + '%',
    norm > 50 && normGrade < 9.5,
  );
  chart.querySelector('title').textContent =
    'Cijfer per behaald percentage bij ' +
    formatPoints(maximum) +
    '. ' +
    summary +
    ' Laagste cijfer: ' +
    minimum.toLocaleString('nl-NL', { minimumFractionDigits: 1 }) +
    ' bij ' +
    floorLabel +
    '. Alle scores staan in de cijfertabel.';
}
