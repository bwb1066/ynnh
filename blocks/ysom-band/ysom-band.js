import { getConfig } from '../../scripts/ak.js';

/**
 * Yale School of Medicine affiliation band.
 * Authored as a "ysom-band" block: optional logo image + affiliation text
 * (one or two cells). Falls back to the repo YSOM logo when no image is
 * authored or it publishes broken.
 * @param {Element} block The ysom-band block element
 */
export default function decorate(block) {
  const { codeBase } = getConfig();

  const img = block.querySelector('img');
  const text = [...block.querySelectorAll('p')].find(
    (p) => !p.querySelector('img') && p.textContent.trim(),
  );

  const inner = document.createElement('div');
  inner.className = 'ysom-band-inner';

  const logoWrap = document.createElement('div');
  logoWrap.className = 'ysom-band-logo';
  if (img && img.src && !img.src.startsWith('about:')) {
    logoWrap.append(img);
  } else {
    logoWrap.innerHTML = `<img src="${codeBase}/img/logos/ysom-logo.svg" alt="Yale School of Medicine" loading="lazy">`;
  }
  inner.append(logoWrap);

  if (text) {
    const textWrap = document.createElement('div');
    textWrap.className = 'ysom-band-text';
    textWrap.append(text);
    inner.append(textWrap);
  }

  block.replaceChildren(inner);
}
