# Import support — v0.6.0

Use Import code or document in the full-page workspace, or Import file in the popup. Then press Check text. The original file is never changed.

| Format | Supported behavior | File limit |
|---|---|---|
| Arduino .ino / .pde | Plain source text | 200 KB |
| Existing text/code formats; added .s, .asm, .bat, .r, .kt, .swift, .vue, .svelte | UTF-8 or BOM-marked UTF-16 | 200 KB |
| .pdf | Extract readable text; page markers in the text | 5 MB, 100 pages |
| Word .docx | Extract body text, including ordinary paragraphs and tables | 5 MB, 20 MB expanded ZIP limit |
| Older Word .doc | Convert using Word/LibreOffice Save As .docx first | Not parsed directly |
| Scanned PDF / image | Run OCR first, verify the recognized text, then import | No built-in OCR |
| ZIP/RAR, spreadsheets, presentations, executables | Not imported as documents | Export desired text first |

All extracted content must fit within 50,000 UTF-16 text units. Over-limit files are rejected, never silently truncated. Document extraction has a 20-second processing timeout. Word archives are checked before extraction for bounded directory size and declared expansion size. This is a resource limit, not a universal guarantee against malformed documents.

Password-protected PDFs require an unlocked copy. Corrupt documents produce an error. A PDF with any page yielding no readable text is rejected entirely; this includes genuinely blank pages. Remove blank pages or run OCR before importing. A page containing both text and images may still be imported, but the images are not inspected.

## What is reviewed

Only the extracted text shown in the editor is scanned. Document layout, reading order, spacing, images, signatures, attachments, hidden data, comments, headers/footers and other unextracted content are not comprehensively covered. Compare the extracted text with the original. PDF extraction may change reading order or split text, affecting detection. A successful import is not evidence that the entire document is safe.

The comparison view and line numbers refer to extracted text, not the original document's layout. PDF page labels help locate the source page. Export is a .redacted.txt sharing copy, not an edited PDF/DOCX, and not runnable code. Do not send the original expecting it to be redacted.

## Privacy and implementation

PDF.js and Mammoth are bundled in extension/vendor, with licenses. Parsing runs locally, with no CDN or upload. CSP allows fetching only the extension's own resources for bundled PDF character maps/fonts. Remote origins remain blocked. PDF JavaScript is not run; Word is extracted as text, never injected as HTML. No new Chrome permissions were added. PDF.js uses its own parsing worker; Word extraction runs in a disposable worker.

## Testing

For development only, run npm install then npm test (Node 22 or later). Canvas is a test-only dependency for browser geometry globals under Node. Users installing the extension do not need it. Test fixtures contain only invented credentials. Native Chrome installation, font/CMap loading and visual behavior still need manual acceptance testing.
