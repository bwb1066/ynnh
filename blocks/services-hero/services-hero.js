/**
 * "Our Featured Services" section.
 * Authored as a "services-hero" block with two cells:
 *   cell 1 — centered heading + subtitle
 *   cell 2 — nested table (label row "services-cards"): six service card
 *            rows (h3 + text + Learn More) and a final "All Services" row
 *            rendered as the navy banner over the cyan wedge.
 * @param {Element} block The services-hero block element
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const headCell = cells[0];

  const head = document.createElement('div');
  head.className = 'services-head';
  if (headCell) {
    const heading = headCell.querySelector('h1, h2, h3');
    if (heading) {
      heading.className = 'services-heading';
      head.append(heading);
    }
    [...headCell.querySelectorAll('p')].forEach((p) => {
      p.className = 'services-subtitle';
      head.append(p);
    });
  }

  const rows = [...block.querySelectorAll('table tr')]
    .filter((row) => row.querySelector('h1, h2, h3, h4, h5'));
  const bannerRow = rows.pop();

  const grid = document.createElement('div');
  grid.className = 'services-grid';
  rows.forEach((row) => {
    const card = document.createElement('div');
    card.className = 'services-card';
    const title = row.querySelector('h1, h2, h3, h4, h5');
    if (title) {
      title.className = 'card-title';
      card.append(title);
    }
    [...row.querySelectorAll('p')].forEach((p) => {
      const link = p.querySelector('a');
      if (link && link.textContent.trim() === p.textContent.trim()) {
        link.className = 'card-cta';
        card.append(link);
      } else if (p.textContent.trim()) {
        p.className = 'card-text';
        card.append(p);
      }
    });
    grid.append(card);
  });

  let banner = null;
  if (bannerRow) {
    banner = document.createElement('div');
    banner.className = 'services-banner';
    const title = bannerRow.querySelector('h1, h2, h3, h4, h5');
    if (title) {
      title.className = 'banner-title';
      banner.append(title);
    }
    [...bannerRow.querySelectorAll('p')].forEach((p) => {
      const link = p.querySelector('a');
      if (link && link.textContent.trim() === p.textContent.trim()) {
        link.className = 'banner-cta';
        banner.append(link);
      } else if (p.textContent.trim()) {
        p.className = 'banner-text';
        banner.append(p);
      }
    });
  }

  const inner = document.createElement('div');
  inner.className = 'services-inner';
  inner.append(head, grid);
  if (banner) inner.append(banner);
  block.replaceChildren(inner);
}
