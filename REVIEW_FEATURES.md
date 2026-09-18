# Seven review improvements — v0.7.0

These controls are in the full-page workspace. The popup remains a compact quick checker and links to the workspace; drafts are not automatically transferred between them.

1. **Exact finding navigation.** Click a finding title or Show in source to focus the exact highlighted span, including when it is beyond the current 250-line view. The excerpt highlights the matched value. PDF findings display source page numbers from trusted extraction metadata rather than parsing page-like text. Line/column still refers to extracted text. Editing the text clears original-page associations.
2. **Search and filters.** Search categories, fields, reasons and PDF page references. Combine category and decision filters. The visible count states how many findings remain in view. Hidden pending findings still block export. Redact all applies to every finding, including filtered-out ones.
3. **Import summary.** After successful import, read filename, bytes, extracted units, format coverage and PDF pages processed. DOCX page count is not available because Word pagination depends on layout. Extraction omissions remain visible. Editing the source removes the old summary. Failed imports preserve the existing draft and its summary.
4. **Undo decisions.** Undo restores the most recent individual Redact/Keep or Redact all action. Bulk redaction is one undo step. Stores up to 100 decision snapshots in memory. Editing, importing or rescanning clears history so it cannot apply to different source text. This is decision undo, not text-edit undo.
5. **Expanded detection evaluation.** 30 new manually annotated fictional Arduino/document/configuration examples join the existing 50. Run node scripts/evaluate.cjs to reproduce all 80. The evaluation page and datasets/EVALUATION.md expose false positives and misses. This is not independent real-world accuracy evidence, and the detector has not been tuned to these labels.
6. **Drag-and-drop import.** Drop one supported file on the drop area or use the keyboard-accessible file chooser. Shows file-reading/extraction status and actual PDF page progress, not a fabricated percentage. Text/Word parsing uses an indeterminate progress indicator. Rejects multiple files and prevents simultaneous imports; source changes discard late results. No automatic upload or scan.
7. **Optional masked previews.** Use Mask detected values in the source toolbar. The raw editor is hidden, and finding excerpts, highlighted source and both comparisons hide detected values. Each finding has Reveal value / Hide value, applied across the review previews. Reveals reset when masking changes or a new scan starts. The switch remains available after clearing the text. Undetected sensitive content can still be visible. This is a presentation aid, not encryption or access control; data remains in memory. Copy/download honors your actual Redact/Keep decisions, so a kept value is included in the exported copy even while masked on screen.

## Quick walkthrough

Load example → Check text → filter Passwords → click Show in source → Keep intentionally → Undo decision → Redact all → Undo decision. Switch on Mask detected values, reveal one finding, then hide it. Import tests/fixtures/text.pdf to check the extraction summary and PDF page reference. Drop an .ino file to review source code.

## Verification

127 automated tests pass, covering scanner rules, imports, PDF/DOCX fixtures, stale callbacks, combined filters, undo, masking versus export, metadata page references and drag-and-drop handlers. Cloud browser connection to the local preview was refused; native Chrome UI, drag/drop behavior and visual layout have not been verified here.
