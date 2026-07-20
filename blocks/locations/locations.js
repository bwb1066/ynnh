import { getConfig } from '../../scripts/ak.js';

const SUBHEAD_ICONS = [
  { match: /emergency/i, name: 'ambulance' },
  { match: /urgent/i, name: 'care-hands' },
];

function subheadIcon(text) {
  const { codeBase } = getConfig();
  const hit = SUBHEAD_ICONS.find((f) => f.match.test(text));
  if (!hit) return '';
  return `<svg class="icon icon-${hit.name}" aria-hidden="true">
      <use href="${codeBase}/img/icons/${hit.name}.svg#${hit.name}"></use></svg>`;
}

function buildIntro(cell) {
  const intro = document.createElement('div');
  intro.className = 'wt-intro';
  const [title, ...subheads] = [...cell.querySelectorAll('h1, h2, h3')];

  // capture sibling relationships BEFORE moving any nodes
  const introStart = title ? title.nextElementSibling : cell.firstElementChild;
  const subMeta = subheads.map((h) => {
    let list = h.nextElementSibling;
    while (list && list.tagName !== 'UL') list = list.nextElementSibling;
    return { h, icon: h.previousElementSibling?.querySelector?.('img'), list };
  });

  if (title) {
    title.className = 'wt-heading';
    intro.append(title);
  }

  // paragraphs between the title and the first subhead
  let node = introStart;
  while (node && !/^H[1-6]$/.test(node.tagName)) {
    const next = node.nextElementSibling;
    if (node.tagName === 'P' && node.textContent.trim() && !node.querySelector('img')) {
      const link = node.querySelector('a');
      const onlyLink = link && link.textContent.trim() === node.textContent.trim();
      if (!onlyLink) {
        node.className = 'wt-text';
        intro.append(node);
      }
    }
    node = next;
  }

  const cols = document.createElement('div');
  cols.className = 'wt-cols';
  subMeta.forEach(({ h, icon, list }) => {
    const col = document.createElement('div');
    col.className = 'wt-col';
    const label = h.textContent.trim();

    h.className = 'wt-subhead';
    if (icon && icon.src && !icon.src.startsWith('about:')) {
      h.textContent = '';
      icon.className = 'icon';
      h.append(icon, Object.assign(document.createElement('span'), { textContent: label }));
    } else {
      h.innerHTML = `${subheadIcon(label)}<span>${label}</span>`;
    }

    col.append(h);
    if (list) {
      list.className = 'wt-list';
      col.append(list);
    }
    cols.append(col);
  });
  intro.append(cols);

  // remaining: CTA (link-only p) and the disclaimer (long text p)
  const leftover = [...cell.querySelectorAll('p')];
  const ctaP = leftover.find((p) => {
    const a = p.querySelector('a');
    return a && a.textContent.trim() === p.textContent.trim();
  });
  if (ctaP) {
    const cta = ctaP.querySelector('a');
    cta.className = 'wt-cta';
    intro.append(cta);
  }
  const disclaimer = leftover.find(
    (p) => !p.querySelector('a') && p.textContent.trim().length > 80,
  );

  return { intro, disclaimer };
}

function parseLocations(td) {
  const items = [];
  let current = null;
  [...td.querySelectorAll('p')].forEach((p) => {
    const link = p.querySelector('a');
    if (link) {
      if (current) {
        current.link = link;
        items.push(current);
        current = null;
      }
    } else if (current) {
      current.name = p.textContent.trim();
    } else {
      current = { time: p.textContent.trim(), name: '', link: null };
    }
  });
  return items;
}

function buildList(items) {
  const list = document.createElement('div');
  list.className = 'wt-locations';
  items.forEach(({ time, name, link }) => {
    const row = document.createElement('div');
    row.className = 'wt-location';
    row.innerHTML = `<span class="wt-status" aria-hidden="true"></span>
      <span class="wt-time">${time}</span>
      <span class="wt-name">${name}</span>`;
    if (link) {
      link.className = 'wt-view';
      row.append(link);
    }
    list.append(row);
  });
  return list;
}

function buildPanel(tabCells) {
  const panel = document.createElement('div');
  panel.className = 'wt-panel';

  // sort toggle (visual only — authored data is wait-time ordered)
  const bar = document.createElement('div');
  bar.className = 'wt-selector';
  bar.innerHTML = `<span>By Wait Time</span>
    <button type="button" class="wt-switch" role="switch" aria-checked="false"
      aria-label="Sort by distance"><span class="wt-knob"></span></button>
    <span>By Distance</span>`;
  const sw = bar.querySelector('.wt-switch');
  sw.addEventListener('click', () => {
    sw.setAttribute('aria-checked', String(sw.getAttribute('aria-checked') !== 'true'));
  });
  panel.append(bar);

  const tabBar = document.createElement('div');
  tabBar.className = 'wt-tabs';
  const bodies = document.createElement('div');
  bodies.className = 'wt-tab-bodies';

  // pager: 5 rows at a time, page up/down with the circle chevrons
  const PAGE = 5;
  const pager = document.createElement('div');
  pager.className = 'wt-pager';
  const down = document.createElement('button');
  down.type = 'button';
  down.className = 'wt-page-btn wt-page-down';
  down.setAttribute('aria-label', 'Show next locations');
  const up = document.createElement('button');
  up.type = 'button';
  up.className = 'wt-page-btn wt-page-up';
  up.setAttribute('aria-label', 'Show previous locations');
  pager.append(down, up);

  const activeBody = () => [...bodies.children].find((b) => !b.hidden);
  const isPaged = () => window.matchMedia('(width >= 900px)').matches;

  const render = () => {
    const body = activeBody();
    if (!body) return;
    const rows = [...body.children];
    if (!isPaged()) {
      // mobile: no chevron paging, show the full list
      rows.forEach((row) => { row.hidden = false; });
      return;
    }
    const offset = Number(body.dataset.offset || 0);
    rows.forEach((row, i) => {
      row.hidden = i < offset || i >= offset + PAGE;
    });
    up.hidden = offset <= 0;
    down.hidden = offset + PAGE >= rows.length;
  };

  const page = (dir) => {
    const body = activeBody();
    if (!body) return;
    const max = Math.max(0, body.children.length - PAGE);
    const next = Math.min(max, Math.max(0, Number(body.dataset.offset || 0) + dir * PAGE));
    body.dataset.offset = next;
    render();
  };
  down.addEventListener('click', () => page(1));
  up.addEventListener('click', () => page(-1));

  tabCells.forEach((cell, idx) => {
    const labelEl = cell.querySelector('h1, h2, h3, h4, h5');
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'wt-tab';
    tab.textContent = labelEl ? labelEl.textContent.trim() : `Tab ${idx + 1}`;
    const body = buildList(parseLocations(cell));
    body.dataset.offset = 0;
    if (idx === 0) {
      tab.classList.add('is-active');
    } else {
      body.hidden = true;
    }
    tab.addEventListener('click', () => {
      tabBar.querySelectorAll('.wt-tab').forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      [...bodies.children].forEach((b) => { b.hidden = true; });
      body.hidden = false;
      render();
    });
    tabBar.append(tab);
    bodies.append(body);
  });
  panel.append(tabBar, bodies, pager);
  render();
  window.matchMedia('(width >= 900px)').addEventListener('change', render);

  return panel;
}

/**
 * Emergency and Urgent Care Wait Times ("locations") section.
 * Authored as a "locations" block: one nested table with a label row
 * (lhs | urgent-care | emergency-rooms) and a data row of three cells:
 *   cell 1 — heading, intro copy, icon+subhead+bullets pairs, CTA link,
 *            disclaimer paragraph
 *   cells 2+ — tab label heading followed by time/name/link triplets
 * @param {Element} block The locations block element
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll('table tr')];
  const dataRow = rows.find((r) => r.querySelector('h1, h2, h3'));
  if (!dataRow) return;
  const [lhsCell, ...tabCells] = [...dataRow.children];

  const inner = document.createElement('div');
  inner.className = 'wt-inner';

  const left = document.createElement('div');
  left.className = 'wt-left';
  const { intro, disclaimer } = buildIntro(lhsCell);
  left.append(intro);
  if (disclaimer) {
    disclaimer.className = 'wt-disclaimer';
    left.append(disclaimer);
  }
  inner.append(left);

  if (tabCells.length) inner.append(buildPanel(tabCells));

  block.replaceChildren(inner);
}
