import { renderGradeChart } from './chart.js';
import { gradeFor } from './grades.js';

const maximum = document.querySelector('#maximum');
const norm = document.querySelector('#norm');
const rows = document.querySelector('tbody');
const navigation = document.querySelector('nav');
const number = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 5 });
const percent = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 1 });
const grade = new Intl.NumberFormat('nl-NL', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const pageSize = 200;
let page = 0;

function render() {
  const total = maximum.valueAsNumber;
  const threshold = norm.valueAsNumber;
  let invalidField;
  let error = '';
  if (!maximum.validity.valid || !Number.isSafeInteger(total * 1000000)) {
    invalidField = maximum;
    error = 'Gebruik halve of hele punten vanaf 0,5.';
  } else if (!norm.validity.valid) {
    invalidField = norm;
    error = 'Vul 0,01 t/m 99,99% in.';
  }

  for (const field of [maximum, norm]) {
    if (field === invalidField) {
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', 'error');
    } else {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }
  }
  document.querySelector('#error').textContent = error;
  const count = error ? 0 : total * 2 + 1;
  document.querySelector('#count').textContent = count ? number.format(count) + ' scores' : '';
  const normPoints = (total * threshold) / 100;
  const targetLabel = error
    ? ''
    : number.format(normPoints) + (normPoints === 1 ? ' punt' : ' punten');
  document.querySelector('#summary').textContent = targetLabel
    ? 'Een 6,0 bij ' + targetLabel + '.'
    : '';
  renderGradeChart(total, threshold, targetLabel);
  navigation.hidden = count <= pageSize;
  const first = page * pageSize;
  const end = Math.min(first + pageSize, count);
  const fragment = document.createDocumentFragment();
  for (let index = first; index < end; index++) {
    const points = total - index / 2;
    const value = gradeFor(points, total, threshold);
    const row = document.createElement('tr');
    const score = document.createElement('th');
    score.scope = 'row';
    score.textContent = number.format(points);
    row.append(score);
    row.insertCell().textContent = percent.format((points / total) * 100) + '%';
    const result = row.insertCell();
    result.textContent = grade.format(value);
    if (value < 5.5) result.className = 'insufficient';
    fragment.append(row);
  }
  rows.replaceChildren(fragment);
  document.querySelector('#prev').disabled = page === 0;
  document.querySelector('#next').disabled = end >= count;
  document.querySelector('#range').textContent =
    number.format(first + 1) + '–' + number.format(end);
}

for (const input of [maximum, norm]) {
  input.addEventListener('input', () => {
    page = 0;
    render();
  });
}
for (const [id, step] of [
  ['prev', -1],
  ['next', 1],
]) {
  document.getElementById(id).addEventListener('click', () => {
    page += step;
    render();
    document.querySelector('#result-title').focus();
  });
}
render();
