import { gradeFor } from './grades.js';

const chart = document.querySelector('#grade-chart');
const number = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 2 });

const toggle = document.querySelector('.chart-toggle');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'false';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? 'Verberg grafiek' : 'Toon grafiek';
});

export function renderGradeChart(maximum, norm) {
  const last = maximum * 2;
  const points = [];
  for (let start = 0; start <= last;) {
    const grade = gradeFor(start / 2, maximum, norm);
    // Equal consecutive grades form a horizontal segment, even across table pages.
    let end = start;
    let high = last;
    while (end < high) {
      const middle = Math.ceil((end + high) / 2);
      if (gradeFor(middle / 2, maximum, norm) === grade) end = middle;
      else high = middle - 1;
    }
    points.push([start / last, grade]);
    if (end > start) points.push([end / last, grade]);
    start = end + 1;
  }
  // The exact 6.0 threshold can fall between attainable half-point scores.
  points.push([norm / 100, 6]);
  points.sort(([a], [b]) => a - b);
  const x = (fraction) => 30 + 250 * fraction;
  const y = (grade) => 158 - 14 * (grade - 1);
  chart
    .querySelector('polyline')
    .setAttribute(
      'points',
      points.map(([fraction, grade]) => x(fraction) + ',' + y(grade)).join(' '),
    );

  const normX = x(norm / 100);
  chart.querySelector('circle').setAttribute('cx', normX);
  const label = chart.querySelector('.chart-label');
  label.setAttribute('x', normX + (norm > 50 ? -6 : 6));
  label.setAttribute('text-anchor', norm > 50 ? 'end' : 'start');
  label.textContent = number.format(norm) + '%';
  chart.querySelector('title').textContent =
    'Cijfer per behaald percentage bij ' +
    number.format(maximum) +
    ' punten. De norm voor een 6,0 is ' +
    number.format(norm) +
    '%. Alle scores staan in de cijfertabel.';
}
