/**
 * Alternating feature cards.
 * Authored as a "feature-cards" block: each row is [image | text] or
 * [text | image] — the authored cell order sets which side the image is on.
 * Body: heading, optional bold subtitle, body copy (inline links allowed),
 * and a trailing CTA link rendered as an outlined button.
 * @param {Element} block The feature-cards block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.className = 'feature-card';
    const cells = [...row.children];
    const mediaCell = cells.find((c) => c.querySelector('img'));
    const bodyCell = cells.find((c) => !c.querySelector('img'));
    if (!mediaCell || !bodyCell) return;

    row.classList.add(cells.indexOf(mediaCell) === 0 ? 'media-left' : 'media-right');

    mediaCell.className = 'feature-media';
    const img = mediaCell.querySelector('img');
    if (!img.src || img.src.startsWith('about:')) {
      mediaCell.classList.add('feature-media-placeholder');
      if (img.alt) mediaCell.setAttribute('aria-label', img.alt);
      img.remove();
    }

    bodyCell.className = 'feature-body';
    const inner = document.createElement('div');
    inner.className = 'feature-body-inner';

    const heading = bodyCell.querySelector('h1, h2, h3');
    if (heading) {
      heading.className = 'feature-heading';
      inner.append(heading);
    }
    [...bodyCell.querySelectorAll('p')].forEach((p) => {
      const link = p.querySelector('a');
      const onlyLink = link && link.textContent.trim() === p.textContent.trim();
      if (onlyLink) {
        link.className = 'feature-cta';
        inner.append(link);
      } else if (p.querySelector('strong') && p.textContent.trim().length < 40) {
        p.className = 'feature-subtitle';
        inner.append(p);
      } else if (p.textContent.trim()) {
        p.className = 'feature-text';
        inner.append(p);
      }
    });
    bodyCell.replaceChildren(inner);
  });
}
