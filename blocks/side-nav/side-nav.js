import { getConfig } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';

const SIDE_NAV_PATH = '/fragments/nav/side-nav';
const CONTRAST_KEY = 'ynhh-contrast';

function closeAllFlyouts(nav) {
  nav.querySelectorAll('.side-nav-item.is-open').forEach((item) => {
    item.classList.remove('is-open');
    item.querySelector('button[aria-expanded]')?.setAttribute('aria-expanded', 'false');
  });
}

function toggleFlyout(nav, item, btn) {
  const isOpen = item.classList.contains('is-open');
  closeAllFlyouts(nav);
  if (!isOpen) {
    item.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

/**
 * Parse the fragment: a run of (icon picture p, label p) pairs from the
 * top of the doc; "Contrast" is followed by Off / tooltip / On paragraphs.
 * Parsing stops at the first heading — anything below is not side-nav.
 */
function parseItems(content) {
  const items = [];
  let pendingIcon = null;
  for (const el of [...content.children]) {
    if (/^H[1-6]$/.test(el.tagName)) break;
    if (el.tagName === 'P') {
      const img = el.querySelector('img');
      const labelEl = el.querySelector('strong, a');
      if (img) {
        pendingIcon = img;
      } else if (labelEl) {
        const link = el.querySelector('a');
        items.push({
          icon: pendingIcon,
          label: (link || labelEl).textContent.trim(),
          href: link ? link.href : null,
          extras: [],
        });
        pendingIcon = null;
      } else if (items.length) {
        // plain paragraphs (Off / tooltip / On) belong to the previous item
        items[items.length - 1].extras.push(el.textContent.trim());
      }
    }
  }
  return items;
}

function tile(item, tag = 'a') {
  const el = document.createElement(tag);
  el.className = 'side-nav-tile';
  if (tag === 'a' && item.href) el.href = item.href;
  if (tag === 'button') el.type = 'button';
  if (item.icon) {
    item.icon.className = 'side-nav-icon';
    el.append(item.icon);
  }
  const label = document.createElement('span');
  label.className = 'side-nav-label';
  label.textContent = item.label;
  el.append(label);
  return el;
}

function buildContrast(nav, item) {
  const wrapper = document.createElement('div');
  wrapper.className = 'side-nav-item side-nav-contrast';

  // drawer opens on hover/focus (CSS); the tile itself is not a toggle
  const btn = tile(item, 'button');

  const [offLabel = 'Off', tooltip = 'Toggle high contrast mode', onLabel = 'On'] = item.extras;
  const flyout = document.createElement('div');
  flyout.className = 'side-nav-flyout';
  flyout.innerHTML = `
    <span class="contrast-state">${offLabel}</span>
    <button type="button" class="contrast-switch" role="switch" aria-checked="false"
      aria-label="${tooltip}"><span class="contrast-knob"></span></button>
    <span class="contrast-state">${onLabel}</span>`;

  const sw = flyout.querySelector('.contrast-switch');
  const apply = (on) => {
    document.body.classList.toggle('contrast-mode', on);
    sw.setAttribute('aria-checked', String(on));
    localStorage.setItem(CONTRAST_KEY, on ? 'on' : 'off');
  };
  sw.addEventListener('click', () => apply(!document.body.classList.contains('contrast-mode')));
  if (localStorage.getItem(CONTRAST_KEY) === 'on') apply(true);

  wrapper.append(flyout, btn);
  return wrapper;
}

/**
 * Mobile-only "Help" tile: stays visible on its own (fixed bottom-right)
 * and toggles the rest of the tiles open/closed. Desktop hides it and
 * always shows every tile in the rail. Synthesized in code (with a
 * thumbs-up icon) when not authored, since it's a UI affordance, not
 * content.
 */
function buildHelp(nav, item = {}) {
  const { codeBase } = getConfig();
  const wrapper = document.createElement('div');
  wrapper.className = 'side-nav-item side-nav-help';

  const label = item.label || 'Help';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'side-nav-tile';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', `${label} menu`);

  if (item.icon) {
    item.icon.className = 'side-nav-icon';
    btn.append(item.icon);
  } else {
    btn.insertAdjacentHTML('beforeend', `<svg class="side-nav-icon" aria-hidden="true">
      <use href="${codeBase}/img/icons/thumbs-up.svg#thumbs-up"></use></svg>`);
  }
  const span = document.createElement('span');
  span.className = 'side-nav-label';
  span.textContent = label;
  btn.append(span);

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-mobile-open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  wrapper.append(btn);
  return wrapper;
}

function sharePopup(url) {
  return (e) => {
    e.preventDefault();
    window.open(url, 'share', 'width=520,height=350,menubar=no,toolbar=no');
  };
}

function buildShare(nav, item) {
  const { codeBase } = getConfig();
  const wrapper = document.createElement('div');
  wrapper.className = 'side-nav-item side-nav-share';

  const btn = tile(item, 'button');
  btn.setAttribute('aria-expanded', 'false');
  btn.addEventListener('click', () => toggleFlyout(nav, wrapper, btn));

  const pageUrl = encodeURIComponent(window.location.href);
  const subject = encodeURIComponent(`Check out this page ${document.title}`);
  const body = encodeURIComponent(`Hi,\r\nTake a look at this website: ${window.location.href}`);

  const flyout = document.createElement('div');
  flyout.className = 'side-nav-flyout';
  const icon = (name) => `<svg class="icon icon-${name}" aria-hidden="true">
      <use href="${codeBase}/img/icons/${name}.svg#${name}"></use></svg>`;
  flyout.innerHTML = `
    <a class="share-link" href="mailto:?subject=${subject}&body=${body}"
      aria-label="Share by email">${icon('mail')}</a>
    <a class="share-link" href="https://www.facebook.com/sharer/sharer.php?u=${pageUrl}"
      aria-label="Share on Facebook">${icon('facebook')}</a>
    <a class="share-link" href="https://twitter.com/intent/tweet?url=${pageUrl}"
      aria-label="Share on Twitter">${icon('twitter')}</a>`;

  flyout.querySelectorAll('a[href^="https"]').forEach((a) => {
    a.addEventListener('click', sharePopup(a.href));
  });

  wrapper.append(flyout, btn);
  return wrapper;
}

/**
 * Right-hand side nav rail.
 * Fragment contract (authored in DA at /fragments/nav/side-nav):
 * pairs of icon image + bold label from the top of the doc — "Contrast"
 * (followed by Off/tooltip/On paragraphs) and "Share" become flyout
 * buttons; labels with links become tiles. Content after the first
 * heading is ignored.
 * @param {Element} el The side-nav element
 */
export default async function init(el) {
  const { locale } = getConfig();
  const fragment = await loadFragment(`${locale.prefix}${SIDE_NAV_PATH}`);
  const content = fragment.querySelector('.default-content');
  if (!content) return;

  const items = parseItems(content);
  for (const item of items) {
    const kind = item.label.toLowerCase();
    if (kind === 'contrast') el.append(buildContrast(el, item));
    else if (kind === 'share') el.append(buildShare(el, item));
    else if (kind === 'help') el.append(buildHelp(el, item));
    else if (item.href) {
      const wrapper = document.createElement('div');
      wrapper.className = 'side-nav-item';
      wrapper.append(tile(item));
      el.append(wrapper);
    }
  }

  // the Help tile is the mobile toggle for the rail — always present
  // (appended last so it sits at the bottom of the stack), even when the
  // DA fragment doesn't author one
  if (!el.querySelector('.side-nav-help')) el.append(buildHelp(el));

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.side-nav')) {
      closeAllFlyouts(el);
      el.classList.remove('is-mobile-open');
      el.querySelector('.side-nav-help button')?.setAttribute('aria-expanded', 'false');
    }
  });
}
