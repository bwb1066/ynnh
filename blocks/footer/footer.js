import { getConfig, getMetadata } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';

const FOOTER_PATH = '/fragments/nav/footer';
const STICKY_DISMISS_KEY = 'ynhh-sticky-footer-dismissed';

function socialName(href) {
  const { hostname } = new URL(href);
  if (hostname.includes('facebook')) return 'facebook';
  if (hostname.includes('twitter') || hostname === 'x.com') return 'twitter';
  if (hostname.includes('youtube')) return 'youtube';
  if (hostname.includes('linkedin')) return 'linkedin';
  if (hostname.includes('instagram')) return 'instagram';
  return null;
}

/**
 * The stacked footer brand: authored logo image, or a wordmark fallback.
 */
function buildFooterBrand(logoImg) {
  const brand = document.createElement('a');
  brand.className = 'footer-brand';
  brand.href = '/';

  const validLogo = logoImg && logoImg.src && !logoImg.src.startsWith('about:');
  if (validLogo) {
    // image-only link needs a label; wordmark text names itself
    brand.setAttribute('aria-label', 'Yale New Haven Health home');
    brand.append(logoImg);
  } else {
    brand.insertAdjacentHTML('beforeend', `
      <span class="footer-wordmark">
        <span>Yale</span><span>NewHaven</span><em>Health</em>
      </span>`);
  }
  return brand;
}

/**
 * Main footer section:
 *   group 1 — hospital list (left rail, with the brand); its embedded
 *             h2 becomes the tagline over the link columns
 *   groups 2+ — link columns; social links render as an icon row
 */
function buildMain(section, logoImg) {
  const { codeBase } = getConfig();
  const main = document.createElement('div');
  main.className = 'footer-main';

  const groups = [...section.querySelectorAll(':scope .default-content > ul > li')];
  const [hospitalGroup, ...columnGroups] = groups;

  // left rail
  const rail = document.createElement('div');
  rail.className = 'footer-rail';
  rail.append(buildFooterBrand(logoImg));
  const hospitalList = hospitalGroup?.querySelector(':scope > ul');
  if (hospitalList) {
    hospitalList.className = 'footer-hospitals';
    rail.append(hospitalList);
  }
  main.append(rail);

  // right area: tagline + columns
  const body = document.createElement('div');
  body.className = 'footer-body';

  const tagline = hospitalGroup?.querySelector('h2');
  if (tagline) {
    tagline.className = 'footer-tagline';
    body.append(tagline);
  }

  const columns = document.createElement('div');
  columns.className = 'footer-columns';
  columnGroups.forEach((groupLi) => {
    const col = document.createElement('div');
    col.className = 'footer-column';
    const title = groupLi.querySelector(':scope > p');
    if (title) {
      title.className = 'footer-column-title';
      col.append(title);
    }
    // extra paragraphs after the title (e.g. the Contact Us address)
    [...groupLi.querySelectorAll(':scope > p')].slice(1).forEach((p) => {
      p.className = 'footer-column-text';
      col.append(p);
    });
    const list = groupLi.querySelector(':scope > ul');
    if (!list) return;

    // split social links into an icon row
    const socials = document.createElement('div');
    socials.className = 'footer-socials';
    [...list.children].forEach((li) => {
      const a = li.querySelector('a');
      const name = a && socialName(a.href);
      if (!name) return;
      a.className = 'footer-social-link';
      a.setAttribute('aria-label', a.textContent.trim());
      a.innerHTML = `<svg class="icon icon-${name}" aria-hidden="true">
          <use href="${codeBase}/img/icons/${name}.svg#${name}"></use>
        </svg>`;
      socials.append(a);
      li.remove();
    });

    if (socials.children.length) col.append(socials);
    if (list.children.length) {
      list.className = 'footer-column-list';
      col.append(list);
    }
    columns.append(col);
  });
  body.append(columns);
  main.append(body);

  return main;
}

/** Bottom row: copyright left, legal links right. */
function buildBottom(section) {
  const bottom = document.createElement('div');
  bottom.className = 'footer-bottom';
  const copyright = section.querySelector('p');
  if (copyright) copyright.className = 'footer-copyright';
  const legal = section.querySelector('ul');
  if (legal) legal.className = 'footer-legal';
  if (copyright) bottom.append(copyright);
  if (legal) bottom.append(legal);
  return bottom;
}

/**
 * Sticky bar: fixed to the viewport bottom, shown when scrolling up
 * (past the fold), hidden on scroll down; Dismiss hides it for the session.
 */
function buildStickyBar(section) {
  if (sessionStorage.getItem(STICKY_DISMISS_KEY)) return null;

  const bar = document.createElement('div');
  bar.className = 'footer-sticky';

  const inner = document.createElement('div');
  inner.className = 'footer-sticky-inner';

  const label = section.querySelector('p');
  if (label) {
    label.className = 'footer-sticky-label';
    inner.append(label);
  }

  const list = section.querySelector('ul');
  if (list) {
    list.className = 'footer-sticky-links';
    let dismissBtn = null;
    [...list.children].forEach((li) => {
      // the link-less item is the dismiss control
      if (li.querySelector('a')) return;
      dismissBtn = document.createElement('button');
      dismissBtn.type = 'button';
      dismissBtn.className = 'footer-sticky-dismiss';
      dismissBtn.textContent = li.textContent.trim();
      dismissBtn.addEventListener('click', () => {
        sessionStorage.setItem(STICKY_DISMISS_KEY, 'true');
        bar.remove();
      });
      li.remove();
    });
    inner.append(list);
    if (dismissBtn) inner.append(dismissBtn);
  }

  bar.append(inner);

  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const goingUp = y < lastY;
    lastY = y;
    if (goingUp && y > 300) bar.classList.add('is-visible');
    else bar.classList.remove('is-visible');
  }, { passive: true });

  return bar;
}

/**
 * loads and decorates the footer
 * Fragment contract (authored in DA at /fragments/nav/footer):
 *   section 1 — logo img + groups ul (hospitals w/ embedded tagline h2,
 *               then link columns; social links become icons)
 *   section 2 — copyright p + legal links ul
 *   section 3 — sticky bar: label p + links ul with a link-less Dismiss item
 * @param {Element} el The footer element
 */
export default async function init(el) {
  const { locale } = getConfig();
  const footerMeta = getMetadata('footer');
  const path = footerMeta || FOOTER_PATH;
  const fragment = await loadFragment(`${locale.prefix}${path}`);

  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const [mainSection, bottomSection, stickySection] = sections;

  const content = document.createElement('div');
  content.className = 'footer-content';

  const logoImg = mainSection?.querySelector('img');
  if (mainSection) content.append(buildMain(mainSection, logoImg));
  if (bottomSection) content.append(buildBottom(bottomSection));
  if (stickySection) {
    const sticky = buildStickyBar(stickySection);
    if (sticky) content.append(sticky);
  }

  el.append(content);
}
