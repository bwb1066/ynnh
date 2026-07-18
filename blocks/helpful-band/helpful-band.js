import { getConfig } from '../../scripts/ak.js';

/**
 * "Was this page helpful?" feedback band.
 * Authored as a "helpful-band" block: optional thumbs-up image,
 * heading, a paragraph with the two button labels (e.g. "Yes No"),
 * and a disclaimer paragraph.
 * @param {Element} block The helpful-band block element
 */
export default function decorate(block) {
  const { codeBase } = getConfig();

  const img = block.querySelector('img');
  const heading = block.querySelector('h1, h2, h3, h4');
  const paras = [...block.querySelectorAll('p')].filter(
    (p) => !p.querySelector('img') && p.textContent.trim(),
  );
  const [labelsP, disclaimer] = paras;

  const inner = document.createElement('div');
  inner.className = 'helpful-band-inner';

  // divider with the thumbs-up icon in the middle
  const divider = document.createElement('div');
  divider.className = 'helpful-divider';
  const icon = document.createElement('span');
  icon.className = 'helpful-icon';
  if (img && img.src && !img.src.startsWith('about:')) {
    icon.append(img);
  } else {
    icon.innerHTML = `<svg class="icon icon-thumbs-up" aria-hidden="true">
        <use href="${codeBase}/img/icons/thumbs-up.svg#thumbs-up"></use></svg>`;
  }
  divider.innerHTML = '<span class="helpful-line"></span>';
  divider.append(icon);
  divider.insertAdjacentHTML('beforeend', '<span class="helpful-line"></span>');
  inner.append(divider);

  // question + yes/no buttons
  const row = document.createElement('div');
  row.className = 'helpful-question';
  if (heading) row.append(heading);
  if (labelsP) {
    const labels = labelsP.textContent.trim().split(/\s+/);
    labels.forEach((label, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = idx === 0 ? 'helpful-btn helpful-btn-yes' : 'helpful-btn helpful-btn-no';
      btn.textContent = label;
      btn.addEventListener('click', () => {
        const thanks = document.createElement('p');
        thanks.className = 'helpful-thanks';
        thanks.textContent = 'Thank you for your feedback.';
        row.replaceWith(thanks);
      });
      row.append(btn);
    });
  }
  inner.append(row);

  if (disclaimer) {
    disclaimer.className = 'helpful-disclaimer';
    inner.append(disclaimer);
  }

  block.replaceChildren(inner);
}
