/**
 * Facility photo carousel.
 * Authored as a "facility-carousel" block: each row is
 * [facility photo | h3 with the location link]. Slides right-to-left
 * every 5s; arrow buttons navigate; the white bottom-left tab shows the
 * active location name and links to it.
 * @param {Element} block The facility-carousel block element
 */
export default function decorate(block) {
  const slides = [...block.children].map((row) => {
    const picture = row.querySelector('picture');
    const link = row.querySelector('a');
    return { picture, link };
  }).filter((s) => s.picture);

  const track = document.createElement('div');
  track.className = 'fc-track';
  slides.forEach(({ picture }) => {
    const slide = document.createElement('div');
    slide.className = 'fc-slide';
    slide.append(picture);
    track.append(slide);
  });

  const tab = document.createElement('a');
  tab.className = 'fc-tab';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'fc-arrow fc-prev';
  prev.setAttribute('aria-label', 'Previous facility');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'fc-arrow fc-next';
  next.setAttribute('aria-label', 'Next facility');

  let index = 0;
  const show = (i) => {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    const { link } = slides[index];
    tab.textContent = link ? link.textContent.trim() : '';
    tab.href = link ? link.href : '#';
  };

  // auto-advance right-to-left every 5s; manual nav resets the clock
  let timer = null;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = () => {
    if (reduced || slides.length < 2) return;
    clearInterval(timer);
    timer = setInterval(() => show(index + 1), 5000);
  };
  const stop = () => clearInterval(timer);

  prev.addEventListener('click', () => {
    show(index - 1);
    start();
  });
  next.addEventListener('click', () => {
    show(index + 1);
    start();
  });
  block.addEventListener('mouseenter', stop);
  block.addEventListener('mouseleave', start);

  block.replaceChildren(track, prev, next, tab);
  show(0);
  start();
}
