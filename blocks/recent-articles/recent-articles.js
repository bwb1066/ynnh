/**
 * Recent Articles band.
 * Authored as a "recent-articles" block: heading + "View All" link, then a
 * nested table (label row "article-cards") whose rows are
 * [linked image | category h4 + linked title h4].
 * @param {Element} block The recent-articles block element
 */
export default function decorate(block) {
  const heading = block.querySelector('h1, h2, h3');
  const viewAll = [...block.querySelectorAll('p > a')].find(
    (a) => !a.querySelector('img'),
  );

  const header = document.createElement('div');
  header.className = 'articles-header';
  if (heading) header.append(heading);
  if (viewAll) {
    viewAll.className = 'articles-viewall';
    header.append(viewAll);
  }

  const list = document.createElement('div');
  list.className = 'articles-list';

  const rows = [...block.querySelectorAll('table tr')];
  rows.forEach((row) => {
    const cells = [...row.children];
    // skip the nested-table label row (single cell, e.g. "article-cards")
    if (cells.length < 2) return;
    const [imgCell, bodyCell] = cells;

    const card = document.createElement('article');
    card.className = 'article-card';

    // image (linked); placeholder when the image published broken
    const imgLink = imgCell.querySelector('a') || document.createElement('a');
    const img = imgCell.querySelector('img');
    const media = document.createElement('a');
    media.className = 'article-media';
    media.href = imgLink.href || '#';
    if (img && img.src && !img.src.startsWith('about:')) {
      media.append(img.closest('picture') || img);
    } else {
      media.classList.add('article-media-placeholder');
      if (img?.alt) media.setAttribute('aria-label', img.alt);
    }
    card.append(media);

    const body = document.createElement('div');
    body.className = 'article-body';
    const headings = [...bodyCell.querySelectorAll('h1, h2, h3, h4, h5')];
    const tagEl = headings.find((h) => !h.querySelector('a'));
    const titleEl = headings.find((h) => h.querySelector('a'));
    if (tagEl) {
      const tag = document.createElement('span');
      tag.className = 'article-tag';
      tag.textContent = tagEl.textContent.trim();
      body.append(tag);
    }
    if (titleEl) {
      // h3 keeps the heading order (section h2 -> card h3)
      const title = document.createElement('h3');
      title.className = 'article-title';
      title.append(...titleEl.childNodes);
      body.append(title);
      // the image link needs a name even when the image is a placeholder
      media.setAttribute('aria-label', title.textContent.trim());
    }
    card.append(body);
    list.append(card);
  });

  block.replaceChildren(header, list);
}
