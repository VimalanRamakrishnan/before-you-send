# Project architecture — v0.2

## Objective

Help users review sensitive-looking text before sharing while keeping input local. The first practical delivery is a desktop Chrome extension with manual inspection and optional redaction.

## Data flow

1. The user pastes text or explicitly requests selection capture.
2. The popup starts a dedicated worker with an immutable text/profile snapshot.
3. The scanner normalizes supported character variants while retaining original-offset mappings.
4. Ordered rule families generate candidates within hard limits.
5. Overlapping candidates are merged into complete spans with combined explanations.
6. Findings return to the popup only if the request is still current.
7. The user selects spans for redaction and copies a reviewed result.

Input, intermediate values and output exist in memory. There is no server, database or external inference service. The worker is not a continuously running background monitor.

## State and failure handling

Editing, clearing or changing profiles invalidates results and terminates the active worker. Each request has a revision guard. A later callback from an earlier request cannot replace a newer draft or an error state. Closing/navigating away clears rendered text and ends scanning.

Scans exceeding three seconds are terminated. Candidate/display caps return explicit incomplete status. Copy is disabled for incomplete checks and when nothing is selected. Worker failure is distinct from a completed check with zero findings. Clipboard failure offers manual copying; it does not falsely announce success.

## Security decisions

The manifest requests only activeTab, scripting and clipboardWrite. Selection capture reads only selected text in the main frame or supported focused fields, excludes password inputs, and offers manual paste for unsupported pages/editors. No page-wide text scraper or send interceptor is installed.

User input is displayed using DOM text nodes and textarea values, not executable HTML. The content security policy disallows remote scripts, network connections, objects and form submissions. Bundled workers/scripts are permitted. No eval or user-supplied regular expressions are used.

The scanner has bounded text and match counts. Known pathological patterns were exercised with repetitive input, and a slow pattern was repaired. A finite test set is not proof against every pathological input; the worker timeout remains part of the design.

## Testing and honest claims

Tests cover positive cases, negative cases, Unicode offsets, overlapping intervals, exact redaction, malformed inputs, limits and controller lifecycle behaviour. The controller uses mock DOM/Worker objects; this tests logic, not browser rendering. Real Chrome integration must be checked separately.

No statistical accuracy number, security certification, provider-equivalent detection claim or complete DLP guarantee is made. An honest portfolio description is: “A local, rule-based sensitive-text review extension with explainable findings, Unicode-aware offsets, controlled redaction and bounded asynchronous scanning.”

## Maintenance

Add a detector only with a written coverage boundary and positive/negative tests. Keep the normalizer's source-offset mapping intact. Test every change against existing redaction cases. Preserve the explicit incomplete/error states, and never convert a scanner exception into an empty successful result.

Future send-button integrations, custom rules, browser sync or a web version are separate features with their own permission and testing implications. They are not present in v0.2.

## v0.4 workspace architecture

The popup opens a separate extension page using a relative link. No text is placed in its URL, persisted for transfer or transmitted between tabs. The user imports/pastes into the fresh workspace. Shared scanner/importer modules run the same checks as the popup.

`review-core.js` classifies presentation labels, counts explicit decisions, calculates line offsets and produces a safe download filename. `workspace.js` owns per-tab state, the scan worker, a 250-line source page, linked findings, preview and export gates. Original text is preserved separately from provisional redacted output. Pending decisions block export. A Keep decision preserves that span and is always shown explicitly. Downloads use a local Blob and browser-managed anchor; the temporary object URL is revoked afterwards.

Comparison displays original and redacted text without interpreting code as HTML. Overlapping spans stay combined according to the detector. Per-finding actions cover that entire span, and explanations state this. Field-based categories improve clarity without asserting that a detected credential is valid.

The small synthetic evaluation is intentionally separate from the packaged runtime. Only the generated summary page is bundled. Dataset files, error details and reproducible scripts stay in the development package. This evaluation does not justify universal detection or production accuracy claims.
