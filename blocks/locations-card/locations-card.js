const BRAND_COLORS = [
  { match: /bridgeport/i, color: '#82d2c4' },
  { match: /greenwich/i, color: '#97c93d' },
  { match: /westerly/i, color: '#94a9e8' },
  { match: /lawrence/i, color: '#d9472b' },
  { match: /yale new haven hospital/i, color: '#003a70' },
  { match: /northeast/i, color: '#f2a900' },
];

function brandColor(name) {
  return BRAND_COLORS.find((b) => b.match.test(name))?.color || '#00a9e0';
}

/**
 * "Expert Care Close to Home" intro + hospital locations card.
 * Authored as a "locations-card" block with two cells:
 *   cell 1 — heading + body paragraph
 *   cell 2 — repeating pairs of h3 hospital name + "View Locations" link.
 * The card overlaps the facility carousel above it; each hospital gets
 * its brand accent bar.
 * @param {Element} block The locations-card block element
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const [introCell, listCell] = cells;

  const inner = document.createElement('div');
  inner.className = 'lc-inner';

  const intro = document.createElement('div');
  intro.className = 'lc-intro';
  if (introCell) {
    const heading = introCell.querySelector('h1, h2, h3');
    if (heading) {
      heading.className = 'lc-heading';
      intro.append(heading);
    }
    [...introCell.querySelectorAll('p')].forEach((p) => {
      p.className = 'lc-text';
      intro.append(p);
    });
  }
  inner.append(intro);

  const card = document.createElement('div');
  card.className = 'lc-card';
  if (listCell) {
    [...listCell.querySelectorAll('h1, h2, h3, h4')].forEach((h) => {
      const name = h.textContent.trim();
      const item = document.createElement('div');
      item.className = 'lc-item';
      item.innerHTML = `<span class="lc-bar" style="background-color: ${brandColor(name)}"></span>`;
      const body = document.createElement('div');
      body.className = 'lc-item-body';
      const title = document.createElement('h3');
      title.className = 'lc-name';
      title.textContent = name;
      body.append(title);
      const linkP = h.nextElementSibling;
      const link = linkP?.querySelector?.('a');
      if (link) {
        link.className = 'lc-view';
        body.append(link);
      }
      item.append(body);
      card.append(item);
    });
  }
  inner.append(card);

  block.replaceChildren(inner);
}
