/**
 * "Moving Healthcare Forward" / "Patient and Visitor Resources" split band.
 * Authored as a "patient-resources-table" block: nested table with a label
 * row (lhs | rhs) and a data row of two cells, each holding a heading,
 * body paragraph, and optional CTA link.
 * @param {Element} block The patient-resources-table block element
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll('table tr')];
  const dataRow = rows.find((r) => r.querySelector('h1, h2, h3'));
  if (!dataRow) return;

  const inner = document.createElement('div');
  inner.className = 'prt-inner';

  [...dataRow.children].forEach((cell, idx) => {
    const pane = document.createElement('div');
    pane.className = `prt-pane ${idx === 0 ? 'prt-lhs' : 'prt-rhs'}`;

    const heading = cell.querySelector('h1, h2, h3');
    if (heading) {
      heading.className = 'prt-heading';
      pane.append(heading);
    }
    [...cell.querySelectorAll('p')].forEach((p) => {
      const link = p.querySelector('a');
      if (link && link.textContent.trim() === p.textContent.trim()) {
        link.className = 'prt-cta';
        pane.append(link);
      } else if (p.textContent.trim()) {
        p.className = 'prt-text';
        pane.append(p);
      }
    });
    inner.append(pane);
  });

  block.replaceChildren(inner);
}
