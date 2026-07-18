# DA Library Setup — aem-* Blocks

Paste-ready material to add the 15 ported blocks to the DA Blocks panel for
`bwb1066/ynnh`, plus nav/footer content templates.

## What's here

| File | Purpose |
|---|---|
| `aem-*.html` (15 files) | One sample doc per block. Open in a browser, select from the H1 down, copy, paste into a DA doc. |
| `blocks-sheet.csv` | The `name,path` rows to add to the library blocks sheet. |
| `nav-template.html` | Header nav content pre-filled with the real ynhh.org top nav (for the `aem-header` chrome, or raw material for the Author Kit header fragment). |
| `footer-template.html` | Footer content pre-filled with the real ynhh.org footer nav. |

## Steps

1. **Create the sample docs.** In da.live (org `bwb1066`, site `ynnh`), create the
   folder path `docs/library/blocks`. For each `aem-*.html` file here: create a doc with
   that exact name (e.g. `aem-cards`), open the HTML file in a browser, select
   everything below the marker line, copy, and paste into the doc. The tables become
   block tables on paste.

2. **Find the existing blocks sheet.** Open the site config (gear icon in da.live).
   Look at the `library` tab — the Author Kit starter already has a `Blocks` row
   pointing at a sheet (that's where hero/card/columns/etc. come from). Open that
   sheet.

3. **Add the rows.** Append the 15 rows from `blocks-sheet.csv` to the sheet
   (`name` and `path` columns). The paths assume the docs live at
   `docs/library/blocks/aem-<name>` — adjust if your existing sheet uses a different
   folder, and put the sample docs in that folder instead so everything stays
   together.

4. **Reload the DA editor.** The aem-* blocks appear in the Blocks panel.

## Caveats

- **aem-form**: sample links to `/forms/sample-form.json` which doesn't exist yet —
  the block needs a form-definition spreadsheet published as JSON.
- **aem-widget**: needs `widgets/sample/sample.html` (+ css/js) in the code repo.
- **aem-modal**: not a table block — links to `/modals/...` pages auto-open as
  modals (wired via `linkBlocks` in `scripts/scripts.js`). Sample doc explains this
  to authors.
- **aem-search**: needs a published query index (`helix-query.yaml` is already in
  the repo; index builds as pages are published).
- **aem-header / aem-footer**: page chrome, not picker blocks — intentionally not in
  the sheet. Activate per page via `aem-header` / `aem-footer` metadata with the
  `nav` / `footer` docs from the templates. The Author Kit's own header/footer
  (from `/fragments/nav/header`) remain the default chrome.
- Sample images reference the Author Kit demo image on your preview host; swap for
  real assets as you author.
