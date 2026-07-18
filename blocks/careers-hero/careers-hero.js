import { getConfig } from '../../scripts/ak.js';

const ICON_FALLBACKS = [
  { match: /beaker|flask/i, name: 'beaker' },
  { match: /stethoscope|nurs/i, name: 'stethoscope' },
  { match: /chart|clipboard|physician/i, name: 'chart' },
];

function fallbackIcon(alt) {
  const { codeBase } = getConfig();
  const hit = ICON_FALLBACKS.find((f) => f.match.test(alt || ''));
  if (!hit) return null;
  const span = document.createElement('span');
  span.innerHTML = `<svg class="icon icon-${hit.name}" aria-hidden="true">
      <use href="${codeBase}/img/icons/${hit.name}.svg#${hit.name}"></use></svg>`;
  return span.firstElementChild;
}

/**
 * Careers hero.
 * Authored as a "careers-hero" block: nested table (label row
 * "hero-image") with a full-bleed background image row, then a row of
 * [heading + body + CTA link | list of icon + link career categories].
 * @param {Element} block The careers-hero block element
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll('table tr')];

  // background image: the row holding a working picture
  const bgPic = rows
    .map((row) => row.querySelector('picture'))
    .find((pic) => {
      const img = pic?.querySelector('img');
      return img && img.src && !img.src.startsWith('about:');
    });

  // content: the row with two cells
  const contentRow = rows.find((row) => row.children.length === 2);

  const inner = document.createElement('div');
  inner.className = 'careers-inner';

  if (contentRow) {
    const [introCell, listCell] = contentRow.children;

    const intro = document.createElement('div');
    intro.className = 'careers-intro';
    const heading = introCell.querySelector('h1, h2, h3');
    if (heading) {
      heading.className = 'careers-heading';
      intro.append(heading);
    }
    [...introCell.querySelectorAll('p')].forEach((p) => {
      const link = p.querySelector('a');
      if (link && link.textContent.trim() === p.textContent.trim()) {
        link.className = 'careers-cta';
        intro.append(link);
      } else if (p.textContent.trim()) {
        p.className = 'careers-text';
        intro.append(p);
      }
    });
    inner.append(intro);

    const list = listCell.querySelector('ul');
    if (list) {
      list.className = 'careers-list';
      [...list.children].forEach((li) => {
        const img = li.querySelector('img');
        const link = li.querySelector('a');
        li.textContent = '';
        const iconWrap = document.createElement('span');
        iconWrap.className = 'careers-item-icon';
        if (img && img.src && !img.src.startsWith('about:')) {
          iconWrap.append(img);
        } else {
          const icon = fallbackIcon(img?.alt);
          if (icon) iconWrap.append(icon);
        }
        li.append(iconWrap);
        if (link) {
          link.className = 'careers-item-link';
          li.append(link);
        }
      });
      inner.append(list);
    }
  }

  block.textContent = '';
  if (bgPic) {
    const bg = document.createElement('div');
    bg.className = 'careers-bg';
    bg.append(bgPic);
    block.append(bg);
  }
  block.append(inner);
}
