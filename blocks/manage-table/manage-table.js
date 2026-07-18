import { getConfig } from '../../scripts/ak.js';

const ICONS = [
  { match: /mychart/i, name: 'mychart' },
  { match: /records/i, name: 'records' },
  { match: /bill|pay/i, name: 'bill' },
];

function iconFor(label) {
  const { codeBase } = getConfig();
  const hit = ICONS.find((f) => f.match.test(label));
  if (!hit) return '';
  return `<svg class="icon icon-${hit.name}" aria-hidden="true">
      <use href="${codeBase}/img/icons/${hit.name}.svg#${hit.name}"></use></svg>`;
}

/**
 * "Manage Your Care" navy quick-links band.
 * Authored as a "manage-table" block: nested table with a label row
 * (lhs | rhs) and a data row of [heading + subtitle | list of
 * icon image + link items].
 * @param {Element} block The manage-table block element
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll('table tr')];
  const dataRow = rows.find((r) => r.querySelector('h1, h2, h3'));
  if (!dataRow) return;
  const [lhs, rhs] = [...dataRow.children];

  const inner = document.createElement('div');
  inner.className = 'mt-inner';

  const intro = document.createElement('div');
  intro.className = 'mt-intro';
  const heading = lhs.querySelector('h1, h2, h3');
  if (heading) {
    heading.className = 'mt-heading';
    intro.append(heading);
  }
  const sub = [...lhs.querySelectorAll('p')].find((p) => p.textContent.trim());
  if (sub) {
    sub.className = 'mt-sub';
    intro.append(sub);
  }
  inner.append(intro);

  const list = document.createElement('ul');
  list.className = 'mt-links';
  [...(rhs?.querySelectorAll('li') || [])].forEach((li) => {
    const link = li.querySelector('a');
    if (!link) return;
    const authored = li.querySelector('img');
    const label = link.textContent.trim();
    const item = document.createElement('li');
    link.className = 'mt-link';
    if (authored && authored.src && !authored.src.startsWith('about:')) {
      authored.className = 'icon';
      link.textContent = '';
      link.append(authored, Object.assign(document.createElement('span'), { textContent: label }));
    } else {
      link.innerHTML = `${iconFor(label)}<span>${label}</span>`;
    }
    item.append(link);
    list.append(item);
  });
  inner.append(list);

  block.replaceChildren(inner);
}
