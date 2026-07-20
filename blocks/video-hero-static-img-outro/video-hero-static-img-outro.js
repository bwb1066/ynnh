import { getConfig } from '../../scripts/ak.js';

const LINK_ICONS = [
  { match: /doctor/i, name: 'stethoscope' },
  { match: /location/i, name: 'pin' },
  { match: /appointment/i, name: 'calendar' },
  { match: /urgent/i, name: 'care-hands' },
  { match: /virtual/i, name: 'camera' },
];

function iconFor(label) {
  const { codeBase } = getConfig();
  const hit = LINK_ICONS.find((f) => f.match.test(label));
  if (!hit) return '';
  return `<svg class="icon icon-${hit.name}" aria-hidden="true">
      <use href="${codeBase}/img/icons/${hit.name}.svg#${hit.name}"></use></svg>`;
}

/**
 * Homepage hero: video plays once, then the static outro image remains.
 * Authored as a "video-hero-static-img-outro" block with two cells:
 *   cell 1 — static outro image (+ optional video: a link to an .mp4)
 *   cell 2 — h1, subtitle paragraph, and the quick-links list
 *            (icon image + link per item)
 * The quick-links bar hangs 45px over the following section.
 * @param {Element} block The video-hero block element
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const [mediaCell, contentCell] = cells;

  // media: static image + optional video source
  const media = document.createElement('div');
  media.className = 'vh-media';
  const poster = mediaCell?.querySelector('picture');
  if (poster) {
    // the poster is the LCP element — fetch it eagerly
    const posterImg = poster.querySelector('img');
    if (posterImg) {
      posterImg.removeAttribute('loading');
      posterImg.fetchPriority = 'high';
    }
    media.append(poster);
  } else {
    // no working outro image authored — hold the video's last frame instead
    media.classList.add('no-poster');
  }

  // any link authored in the media cell is the video source
  // (extension-agnostic: .mp4, DA media_* assets, .ashx handlers, ...)
  const videoLink = mediaCell?.querySelector('a');
  let video = null;
  let playBtn = null;
  if (videoLink) {
    video = document.createElement('video');
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    // defer the (heavy) video fetch so it can't compete with LCP
    video.preload = 'none';
    video.className = 'vh-video';
    media.append(video);

    playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'vh-play';
    playBtn.setAttribute('aria-label', 'Play video');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ensureSrc = () => {
      if (!video.src) video.src = videoLink.href;
    };
    const outro = () => {
      media.classList.remove('is-playing');
      playBtn.setAttribute('aria-label', 'Play video');
    };
    video.addEventListener('ended', outro);
    playBtn.addEventListener('click', () => {
      if (video.paused) {
        ensureSrc();
        media.classList.add('is-playing');
        video.play();
        playBtn.setAttribute('aria-label', 'Pause video');
      } else {
        video.pause();
        outro();
      }
    });
    if (!reduced) {
      // start only after the page has finished loading (LCP protected)
      const start = () => {
        ensureSrc();
        media.classList.add('is-playing');
        video.play().catch(() => outro());
      };
      if (document.readyState === 'complete') {
        setTimeout(start, 250);
      } else {
        window.addEventListener('load', () => setTimeout(start, 250), { once: true });
      }
    }
  }

  const overlay = document.createElement('div');
  overlay.className = 'vh-overlay';
  const heading = contentCell?.querySelector('h1, h2');
  if (heading) {
    heading.className = 'vh-heading';
    overlay.append(heading);
  }
  const sub = [...(contentCell?.querySelectorAll(':scope > p') || [])]
    .find((p) => p.textContent.trim());
  if (sub) {
    sub.className = 'vh-sub';
    overlay.append(sub);
  }
  media.append(overlay);
  if (playBtn) media.append(playBtn);

  // quick links bar
  const bar = document.createElement('ul');
  bar.className = 'vh-links';
  [...(contentCell?.querySelectorAll('ul li') || [])].forEach((li) => {
    const link = li.querySelector('a');
    if (!link) return;
    const authored = li.querySelector('img');
    const label = link.textContent.trim();
    const item = document.createElement('li');
    link.className = 'vh-link';
    if (authored && authored.src && !authored.src.startsWith('about:')) {
      authored.className = 'icon';
      link.textContent = '';
      link.append(authored, Object.assign(document.createElement('span'), { textContent: label }));
    } else {
      link.innerHTML = `${iconFor(label)}<span>${label}</span>`;
    }
    item.append(link);
    bar.append(item);
  });

  block.replaceChildren(media, bar);
}
