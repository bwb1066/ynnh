/**
 * "For Medical Professionals" resources hero.
 * Authored as a "resources-hero" block with two cells:
 *   cell 1 — heading + intro paragraph
 *   cell 2 — nested table (label row "aem-cards-no-images") whose rows are
 *            cards: h3 title + body paragraph + CTA link.
 * The last card renders as the featured navy card with a button CTA.
 * @param {Element} block The resources-hero block element
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const introCell = cells[0];

  const inner = document.createElement('div');
  inner.className = 'resources-inner';

  // left: intro
  const intro = document.createElement('div');
  intro.className = 'resources-intro';
  if (introCell) {
    const heading = introCell.querySelector('h1, h2, h3');
    if (heading) {
      heading.className = 'resources-heading';
      intro.append(heading);
    }
    [...introCell.querySelectorAll('p')].forEach((p) => {
      p.className = 'resources-text';
      intro.append(p);
    });
  }
  inner.append(intro);

  // right: card grid
  const grid = document.createElement('div');
  grid.className = 'resources-grid';

  const rows = [...block.querySelectorAll('table tr')]
    .filter((row) => row.querySelector('h1, h2, h3, h4, h5'));
  rows.forEach((row, idx) => {
    const card = document.createElement('div');
    card.className = 'resources-card';
    if (idx === rows.length - 1) card.classList.add('card-featured');

    const title = row.querySelector('h1, h2, h3, h4, h5');
    if (title) {
      title.className = 'card-title';
      card.append(title);
    }

    const paras = [...row.querySelectorAll('p')];
    const ctaP = paras[paras.length - 1];
    paras.slice(0, -1).forEach((p) => {
      p.className = 'card-text';
      card.append(p);
    });

    if (ctaP) {
      const link = ctaP.querySelector('a');
      if (link) {
        link.className = 'card-cta';
        card.append(link);
      } else {
        // authored without a link — style the label, no navigation
        const span = document.createElement('span');
        span.className = 'card-cta';
        span.textContent = ctaP.textContent.trim();
        card.append(span);
      }
    }
    grid.append(card);
  });
  inner.append(grid);

  block.replaceChildren(inner);
}
