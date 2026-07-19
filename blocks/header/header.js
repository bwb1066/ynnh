import { getConfig, getMetadata, loadBlock } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';

const { locale } = getConfig();

const HEADER_PATH = '/fragments/nav/header';

function closeAllMenus() {
  const openMenus = document.body.querySelectorAll('header .is-open');
  for (const openMenu of openMenus) {
    openMenu.classList.remove('is-open');
    const toggler = openMenu.querySelector('[aria-expanded]');
    if (toggler) toggler.setAttribute('aria-expanded', 'false');
  }
}

function docClose(e) {
  if (e.target.closest('header')) return;
  closeAllMenus();
}

function toggleMenu(menu, btn) {
  const isOpen = menu.classList.contains('is-open');
  closeAllMenus();
  if (isOpen) {
    document.removeEventListener('click', docClose);
    return;
  }
  document.addEventListener('click', docClose);
  menu.classList.add('is-open');
  if (btn) btn.setAttribute('aria-expanded', 'true');
}

/**
 * Utility bar: first li (with nested ul) becomes the "Explore Our Health
 * System" dropdown; remaining lis are right-aligned utility links.
 */
function buildUtilityBar(utilityList) {
  const bar = document.createElement('nav');
  bar.className = 'utility-bar';
  bar.setAttribute('aria-label', 'Utility');

  const inner = document.createElement('div');
  inner.className = 'utility-bar-inner';
  bar.append(inner);

  const items = [...utilityList.children];
  const systemItem = items.find((li) => li.querySelector(':scope > ul'));
  if (systemItem) {
    const menuList = systemItem.querySelector(':scope > ul');
    const label = systemItem.querySelector(':scope > p');
    const wrapper = document.createElement('div');
    wrapper.className = 'system-menu';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'system-menu-toggle';
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = label ? label.textContent.trim() : 'Explore Our Health System';
    btn.addEventListener('click', () => toggleMenu(wrapper, btn));

    const dropdown = document.createElement('div');
    dropdown.className = 'system-menu-dropdown';
    dropdown.append(menuList);

    wrapper.append(btn, dropdown);
    inner.append(wrapper);
  }

  const links = document.createElement('ul');
  links.className = 'utility-links';
  items.filter((li) => li !== systemItem).forEach((li) => {
    const a = li.querySelector('a');
    if (!a) return;
    const item = document.createElement('li');
    item.append(a);
    links.append(item);
  });
  inner.append(links);

  return bar;
}

/**
 * The brand: the logo image authored in the fragment, or a text wordmark
 * fallback when the image is missing/broken.
 */
function buildBrand(logoImg) {
  const brand = document.createElement('a');
  brand.className = 'brand';
  brand.href = locale.prefix || '/';

  const validLogo = logoImg && logoImg.src && !logoImg.src.startsWith('about:');
  if (validLogo) {
    // image-only link needs a label; wordmark text names itself
    brand.setAttribute('aria-label', 'Yale New Haven Hospital home');
    brand.append(logoImg);
  } else {
    brand.insertAdjacentHTML('beforeend', `
      <span class="brand-wordmark">YaleNewHaven<em>Health</em></span>
      <span class="brand-subtitle">Yale New Haven Hospital</span>`);
  }
  return brand;
}

/**
 * A primary nav submenu, matching the source site's click mega menus:
 * two-tone panel — first group in the gray left zone (with a "View All"
 * card), remaining groups in the white right zone. Long lists split
 * into two columns.
 */
function buildMegaMenu(subList) {
  const mega = document.createElement('div');
  mega.className = 'mega-menu';

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'mega-close';
  close.setAttribute('aria-label', 'Close menu');
  close.innerHTML = '<span></span><span></span>';
  close.addEventListener('click', closeAllMenus);
  mega.append(close);

  const menuInner = document.createElement('div');
  menuInner.className = 'mega-menu-inner';
  mega.append(menuInner);

  const groups = [...subList.children].map((groupLi) => {
    const groupList = groupLi.querySelector(':scope > ul');
    const title = groupLi.querySelector(':scope > p');
    const group = document.createElement('div');
    group.className = 'mega-group';
    if (title && groupList) {
      title.className = 'mega-group-title';
      group.append(title, groupList);
    } else {
      group.append(...groupLi.childNodes);
    }
    return group;
  });

  // the "View All ..." link becomes the left-zone card; fall back to
  // the last link of the first group (e.g. "Find a Location")
  const links = groups.flatMap((g) => [...g.querySelectorAll('ul a')]);
  let viewAll = links.find((a) => /^view all/i.test(a.textContent.trim()));
  if (!viewAll) {
    const firstLinks = groups[0]?.querySelectorAll('ul a');
    viewAll = firstLinks?.[firstLinks.length - 1];
  }
  if (viewAll) {
    viewAll.closest('li')?.remove();
    viewAll.className = 'mega-viewall-link';
  }

  // two columns for long lists
  groups.forEach((g) => {
    const list = g.querySelector('ul');
    if (list && list.children.length > 7) list.classList.add('cols-2');
  });

  const left = document.createElement('div');
  left.className = 'mega-zone mega-zone-left';
  if (groups[0]) left.append(groups[0]);
  if (viewAll) {
    const card = document.createElement('div');
    card.className = 'mega-viewall';
    card.append(viewAll);
    left.append(card);
  }

  const right = document.createElement('div');
  right.className = 'mega-zone mega-zone-right';
  right.append(...groups.slice(1));

  menuInner.append(left, right);
  return mega;
}

/**
 * Primary nav: first li is the CTA button; lis with nested uls get
 * mega menus (open on hover/focus on desktop).
 */
function buildPrimaryNav(primaryList) {
  const nav = document.createElement('nav');
  nav.className = 'primary-nav';
  nav.setAttribute('aria-label', 'Main');
  primaryList.className = 'primary-list';

  // pull the action items (MyChart link, search icon) out of the list
  const actionEls = { mychart: null, search: null };
  [...primaryList.children].forEach((li) => {
    const link = li.querySelector(':scope a');
    const icon = li.querySelector('.icon-search');
    const hasSub = li.querySelector(':scope > ul');
    if (icon) {
      actionEls.search = icon;
      li.remove();
    } else if (!hasSub && link && /mychart\./.test(new URL(link.href).hostname)
      && link.textContent.trim().toLowerCase() === 'mychart') {
      actionEls.mychart = link;
      li.remove();
    }
  });
  nav.actionEls = actionEls;

  [...primaryList.children].forEach((li, idx) => {
    li.classList.add('primary-item');
    const link = li.querySelector(':scope > p > a');
    if (link) link.className = idx === 0 ? 'nav-cta' : 'primary-link';

    const subList = li.querySelector(':scope > ul');
    if (subList) {
      li.classList.add('has-mega');
      li.append(buildMegaMenu(subList));
      // source site: mega menus open on click, the label never navigates
      if (link) {
        link.setAttribute('aria-expanded', 'false');
        link.addEventListener('click', (e) => {
          e.preventDefault();
          toggleMenu(li);
          link.setAttribute('aria-expanded', String(li.classList.contains('is-open')));
        });
      }
    }
  });

  nav.append(primaryList);
  return nav;
}

/**
 * MyChart link + search toggle, right of the primary nav.
 * Content-driven: authored as trailing items in the primary list —
 * a "MyChart" link and a :search: icon.
 * TODO: wire the search button to a search panel once search is built.
 */
function buildActions(mychartLink, searchIcon) {
  const { codeBase } = getConfig();
  const actions = document.createElement('div');
  actions.className = 'nav-actions';

  if (searchIcon) {
    const search = document.createElement('button');
    search.type = 'button';
    search.className = 'search-toggle';
    search.setAttribute('aria-label', 'Search');
    search.append(searchIcon);
    actions.append(search);
  }

  if (mychartLink) {
    const label = mychartLink.textContent.trim();
    mychartLink.className = 'mychart-link';
    // label span is hidden on mobile — aria-label keeps the name
    mychartLink.setAttribute('aria-label', label);
    mychartLink.innerHTML = `<svg class="icon icon-mychart" aria-hidden="true">
        <use href="${codeBase}/img/icons/mychart.svg#mychart"></use>
      </svg><span class="mychart-label">${label}</span>`;
    actions.append(mychartLink);
  }

  return actions.children.length ? actions : null;
}

function buildMobileToggle() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'mobile-toggle';
  btn.setAttribute('aria-label', 'Menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span></span><span></span><span></span>';
  btn.addEventListener('click', () => {
    const header = document.body.querySelector('header');
    const isOpen = header.classList.toggle('is-mobile-open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });
  return btn;
}

function closeMobile() {
  const header = document.body.querySelector('header');
  header.classList.remove('is-mobile-open', 'is-drilled');
  const toggle = header.querySelector('.mobile-toggle');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
}

function buildCloseButton() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'mobile-close';
  btn.setAttribute('aria-label', 'Close menu');
  btn.innerHTML = '<span></span><span></span>';
  btn.addEventListener('click', closeMobile);
  return btn;
}

/**
 * Full-screen mobile menu (tablet + phone):
 *   panel 1 — logo/close, CTA pair, drill-in rows, gray system section
 *   panel 2 — back/title/close + the drilled mega-menu content
 */
function buildMobileMenu({ brand, utilityBar, primaryList }) {
  const menu = document.createElement('div');
  menu.className = 'mobile-menu';

  // panel 2 (submenu) — populated on drill
  const submenu = document.createElement('div');
  submenu.className = 'mobile-submenu';
  const subBar = document.createElement('div');
  subBar.className = 'mobile-submenu-bar';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'mobile-back';
  back.setAttribute('aria-label', 'Back');
  const subTitle = document.createElement('span');
  subTitle.className = 'mobile-submenu-title';
  subBar.append(back, subTitle, buildCloseButton());
  const subBody = document.createElement('div');
  subBody.className = 'mobile-submenu-body';
  submenu.append(subBar, subBody);
  back.addEventListener('click', () => {
    document.body.querySelector('header').classList.remove('is-drilled');
  });

  // panel 1
  const bar = document.createElement('div');
  bar.className = 'mobile-menu-bar';
  bar.append(brand.cloneNode(true), buildCloseButton());

  const body = document.createElement('div');
  body.className = 'mobile-menu-body';

  // CTA pair: first two primary items
  const ctaRow = document.createElement('div');
  ctaRow.className = 'mobile-cta-row';
  [...primaryList.children].slice(0, 2).forEach((li, idx) => {
    const a = li.querySelector('a');
    if (!a) return;
    const clone = a.cloneNode(true);
    clone.className = idx === 0 ? 'mobile-cta' : 'mobile-cta mobile-cta-outline';
    ctaRow.append(clone);
  });
  body.append(ctaRow);

  // drill-in rows for items with mega menus
  const rows = document.createElement('ul');
  rows.className = 'mobile-nav-rows';
  [...primaryList.children].forEach((li) => {
    if (!li.classList.contains('has-mega')) return;
    const label = li.querySelector(':scope > p > a')?.textContent.trim();
    const mega = li.querySelector('.mega-menu-inner');
    if (!label || !mega) return;
    const row = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mobile-nav-row';
    btn.innerHTML = `<span>${label}</span>`;
    btn.addEventListener('click', () => {
      subTitle.textContent = label;
      subBody.replaceChildren(mega.cloneNode(true));
      document.body.querySelector('header').classList.add('is-drilled');
      submenu.scrollTop = 0;
    });
    row.append(btn);
    rows.append(row);
  });
  body.append(rows);

  // gray section: system switcher accordion + utility links
  const gray = document.createElement('div');
  gray.className = 'mobile-gray';

  const systemDropdown = utilityBar.querySelector('.system-menu-dropdown ul');
  const systemLabel = utilityBar.querySelector('.system-menu-toggle')?.textContent.trim();
  if (systemDropdown && systemLabel) {
    const sysWrap = document.createElement('div');
    sysWrap.className = 'mobile-system';
    const sysBtn = document.createElement('button');
    sysBtn.type = 'button';
    sysBtn.className = 'mobile-system-toggle';
    sysBtn.setAttribute('aria-expanded', 'false');
    sysBtn.innerHTML = `<span>${systemLabel}</span>`;
    const sysList = systemDropdown.cloneNode(true);
    sysList.className = 'mobile-system-list';
    sysBtn.addEventListener('click', () => {
      const isOpen = sysWrap.classList.toggle('is-open');
      sysBtn.setAttribute('aria-expanded', String(isOpen));
    });
    sysWrap.append(sysBtn, sysList);
    gray.append(sysWrap);
  }

  const utilityLinks = utilityBar.querySelector('.utility-links');
  if (utilityLinks) {
    const utilClone = utilityLinks.cloneNode(true);
    utilClone.className = 'mobile-utility';
    gray.append(utilClone);
  }
  body.append(gray);

  menu.append(bar, body);

  const wrapper = document.createElement('div');
  wrapper.className = 'mobile-panels';
  wrapper.append(menu, submenu);
  return wrapper;
}

/**
 * loads and decorates the header
 * Fragment contract (authored in DA at /fragments/nav/header):
 *   UL 1 — utility nav: li with nested ul = system switcher; rest = links;
 *          the brand logo img may be authored anywhere in the list
 *   UL 2 — primary nav: li 1 = CTA; lis with nested uls = mega menus;
 *          trailing "MyChart" link and :search: icon become nav actions
 * @param {Element} el The header element
 */
export default async function init(el) {
  const headerMeta = getMetadata('header');
  const path = headerMeta || HEADER_PATH;
  const fragment = await loadFragment(`${locale.prefix}${path}`);

  const lists = fragment.querySelectorAll(':scope .default-content > ul');
  const [utilityList, primaryList] = lists;
  if (!primaryList) throw Error('header fragment must contain utility + primary lists');

  // the logo may be authored anywhere in the utility list
  const logoImg = utilityList.querySelector('img');
  utilityList.querySelectorAll('hr').forEach((hr) => hr.remove());

  const content = document.createElement('div');
  content.className = 'header-content';

  const utilityBar = buildUtilityBar(utilityList);
  content.append(utilityBar);

  const mainBar = document.createElement('div');
  mainBar.className = 'main-bar';
  const mainInner = document.createElement('div');
  mainInner.className = 'main-bar-inner';
  const brand = buildBrand(logoImg);
  const primaryNav = buildPrimaryNav(primaryList);
  mainInner.append(brand, primaryNav);
  const actions = buildActions(primaryNav.actionEls.mychart, primaryNav.actionEls.search);
  if (actions) mainInner.append(actions);
  mainInner.append(buildMobileToggle());
  mainBar.append(mainInner);
  content.append(mainBar);

  content.append(buildMobileMenu({ brand, utilityBar, primaryList }));

  el.append(content);

  // right-hand side-nav rail (its own block, chrome like the header)
  if (!document.body.querySelector('.side-nav')) {
    const sideNav = document.createElement('aside');
    sideNav.className = 'side-nav';
    document.body.append(sideNav);
    loadBlock(sideNav);
  }
}
