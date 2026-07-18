import { getConfig } from '../../scripts/ak.js';

/**
 * Research & Clinical Trials navy band.
 * Authored as a "research-trials-band" block: optional icon image,
 * heading, body paragraph, CTA link. Falls back to the repo microscope
 * icon when the image is missing/broken.
 * @param {Element} block The research-trials-band block element
 */
export default function decorate(block) {
  const { codeBase } = getConfig();

  const img = block.querySelector('img');
  const heading = block.querySelector('h1, h2, h3');
  const paras = [...block.querySelectorAll('p')].filter(
    (p) => !p.querySelector('img') && p.textContent.trim(),
  );
  const cta = paras.map((p) => p.querySelector('a')).find(Boolean);
  const body = paras.find((p) => !p.querySelector('a'));

  const inner = document.createElement('div');
  inner.className = 'trials-inner';

  const circle = document.createElement('div');
  circle.className = 'trials-icon';
  if (img && img.src && !img.src.startsWith('about:')) {
    circle.append(img.closest('picture') || img);
  } else {
    circle.innerHTML = `<svg class="icon icon-microscope" aria-hidden="true">
        <use href="${codeBase}/img/icons/microscope.svg#microscope"></use></svg>`;
  }
  inner.append(circle);

  const content = document.createElement('div');
  content.className = 'trials-content';
  if (heading) {
    heading.className = 'trials-heading';
    content.append(heading);
  }
  if (body) {
    body.className = 'trials-text';
    content.append(body);
  }
  if (cta) {
    cta.className = 'trials-cta';
    content.append(cta);
  }
  inner.append(content);

  block.replaceChildren(inner);
}
