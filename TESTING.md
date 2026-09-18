# Acceptance checks for v0.2.1

Use fictional values, never live credentials.

## Automated evidence

The package contains detector regression tests and controller tests. Controller tests use a minimal DOM and controllable Worker/clipboard, not real Chrome. The user confirmed v0.1's basic workflow worked; that does not replace acceptance testing of v0.2.1's worker and profile controls.

Run `node --test tests/scanner.test.cjs tests/expanded.test.cjs tests/ui-state.test.cjs`.

## Desktop Chrome checks

1. Reload the extension and confirm v0.2.1 in the footer and Strict selected.
2. Try an example → Check text. Expect the labelled key, email and test-card value to be reviewable.
3. Expand highlighted text and confirm matched spans align with the input.
4. Clear selection: Copy must be disabled. Select all: redaction returns. Uncheck an email: only that detail reappears.
5. Check `password="Bearer DEMO_TOKEN with tail"`. The complete quoted value must be removed, not just DEMO_TOKEN.
6. Check `password=“ＳＥＣＲＥＴ”`. The value should be found while original curly quotes remain around [REDACTED].
7. Check `https://demo:DEMO_PASSWORD@example.com/?token=DEMO&x=1`. Expect `https://[REDACTED]@example.com/?token=[REDACTED]&x=1`.
8. Check `Host 192.168.1.10`. Strict should flag the IP for review. Change to Balanced: prior results disappear; a new check should not flag that IP.
9. Start a check and immediately edit/clear the input. No old result should reappear.
10. Copy redacted text into a temporary editor and compare it with the output. Test the clipboard fallback if access is unavailable.
11. Check empty text, ordinary prose, more than 50,000 text units, and more than 200 distinct email matches. Oversized/capped input must not be presented as a completed safe result.
12. Select normal page text, textarea text and rich-text editor content. Restricted pages or unsupported editors must retain the manual-paste fallback.
13. Close/reopen the popup and confirm that input and results are gone. Test keyboard navigation and larger text settings.
14. Check Chrome's extension Errors panel. Confirm no unexpected network requests originate from the extension while scanning.

The popup's timeout is approximately three seconds and may vary with browser scheduling. A timeout must show an error with results hidden. Smaller sections can then be checked normally.

## Release boundary

Automated tests can pass while browser integration still has problems. The browser preview was unreachable in the build environment, so this package is ready for the user's Chrome acceptance checks, not represented as independently browser-verified or store-approved.

## v0.4 full-page acceptance

1. Click Open full-page workspace from the popup. Confirm it opens a fresh tab with no transferred draft.
2. Load example and scan. Confirm source line numbers and findings appear side by side on desktop.
3. Click Show in code for different findings and confirm the highlighted source matches the card.
4. Scan a file longer than 250 lines. Navigate pages and jump to a finding on a later page; verify export retains the entire file.
5. Initially, all findings must be Needs review and export disabled. Make Redact/Keep decisions and check the counter.
6. Keep an email intentionally and redact a password. Verify the comparison preserves the email and replaces the password. Kept text must not be called safe.
7. Download and open the .redacted.txt file. Compare its complete contents with the visible output; verify your original file is unchanged.
8. Choose Keep for all findings: the comparison must explicitly say no replacements were made.
9. Edit the source after review. Old decisions, results and export must be invalidated.
10. Check oversized/capped input, worker errors, keyboard navigation, Chrome downloads behaviour, zoom and narrow window layout.
11. Open Detection evaluation and inspect its limitations. Compare the figures with datasets/EVALUATION.md.

The automated controller tests cover these logical flows with test doubles, but do not substitute for native Chrome or visual acceptance testing.


## v0.6.0 acceptance
Run npm install then npm test for all tests. In Chrome 130+, import tests/fixtures/text.pdf and text.docx, Check text, make review decisions, and export. Compare extracted text with the source. Test an Arduino .ino. Verify blank.pdf and mixed.pdf errors retain previous input. Verify .doc conversion guidance. Review IMPORT_SUPPORT.md for extraction boundaries.
