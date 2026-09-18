# Before You Send

![Pixel Shield](extension/icons/icon128.png)

A browser-based review tool for spotting possible passwords, API keys and personal information before sharing text or documents.

Created by **VimalanRamakrishnan**.

## Features

- On-device rule-based scanning with strict and balanced profiles.
- Text/code imports including Arduino .ino, text-based PDF and DOCX.
- Line-level findings, masked previews, custom literal rules and explicit Redact/Keep decisions.
- Sharing preview, differences, undo, copy and plain-text download.
- 100 fictional examples, guided practice and a synthetic evaluation report.
- Pixel Shield branding and centred power-up animation, respecting reduced motion.

## Website and extension

`docs/` is the ready-to-publish static website. No server, API key, database, or build step is required to host it.

`extension/` is the separate Chrome extension. Load this folder unpacked at chrome://extensions with Developer mode enabled to try the extension. The website cannot read selected text from other browser tabs; users paste or import content themselves.

See [PUBLISH.md](PUBLISH.md) to publish the website on GitHub Pages. The intended address after deployment is https://vimalanramakrishnan.github.io/before-you-send/ — it is not live merely because this package was created.

## Local preview

From the repository directory, run:

```sh
python -m http.server 8000
```

On Windows, `py -m http.server 8000` also works if Python is installed. Open http://localhost:8000/docs/ in a current Chrome or Edge browser. Do not double-click index.html: browser workers and modules need HTTP/HTTPS.

## Development

The source is HTML, CSS and JavaScript, with browser workers. PDF.js and Mammoth are bundled locally. No CDN is needed.

After editing extension workspace files, rebuild the website:

```sh
node scripts/build-site.cjs
```

For tests, install development dependencies and run:

```sh
npm install
npm test
```

Commit both source changes and rebuilt docs/. Hosting uses docs/, not extension/.

## Privacy and limits

The app does not upload pasted or imported content. Hosting still involves ordinary web requests. See [Privacy and limitations](docs/privacy.html).

Detection is advisory. Pattern matching can miss secrets and produce false positives; no findings does not mean safe. Exports are plain-text copies, not sanitized original PDF or Word documents. Scanned PDFs need OCR elsewhere; .doc must be converted to .docx. See IMPORT_SUPPORT.md for limits.

The included evaluation is synthetic and must not be presented as a real-world accuracy guarantee.

## Attribution

See THIRD_PARTY.md and bundled vendor licenses. No new license grant for the project's own code is implied by this package; choose a project license before inviting reuse.
