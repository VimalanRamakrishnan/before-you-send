# Advanced review — v0.9.0

Use Open full-page workspace from the popup. The popup continues to provide the compact built-in-pattern checker. Custom rules and the new review controls belong to the workspace; they are not silently copied to other tabs.

## Custom confidential terms

Open Custom confidential terms below the source panel. Enter one literal word or phrase per line. Up to 20 unique terms, 2–128 UTF-16 text units each, with a 3,000-unit input cap. Leading/trailing spaces and blank lines are ignored. Matches are substrings, case-insensitive by default; enable Match exact letter case if required. Punctuation is literal: `demo.*` matches those exact characters, not a regular expression. Terms are kept only in this tab and cleared on close/reload. Case-insensitive Unicode matching follows JavaScript regular-expression case rules; custom terms do not use the built-in normalization pipeline.

Custom findings merge with overlapping built-in findings without losing the matched tail. The high-priority built-in explanation is retained where applicable; the card also states that a custom match contributed. Excess matches mark a scan incomplete and block export. Changing rules invalidates prior results and decisions. When masking is enabled the custom-terms input is hidden along with the raw source editor; turn masking off to edit it.

## Understand findings

Each card now separates why it matched, possible exposure, the action to consider, and the limits of the evidence. These are pattern-based explanations, not verification that a credential is active or a detail is confidential.

## Replacement choices

Above comparison, choose generic [REDACTED] or category labels such as [PASSWORD REMOVED] and [API KEY REMOVED]. Each finding has a Replacement text section for an optional custom value (1–100 visible text units, no line breaks/control characters). Use custom applies it; Use default removes it. Custom replacements are rendered as text, never HTML. They affect pending/redacted findings; Keep intentionally retains the original. Avoid typing a real secret into a replacement.

Copy/download use exactly the unmasked reviewed output, including chosen replacements. Preview masking only hides detected original values on screen. Replacement overrides can be undone with Undo decision; the global replacement style is changed directly in its selector. A new scan or source change clears overrides and decision history.

## Difference view

Open Show exactly what changes below the comparison. Removed spans are struck through and labelled Removed; replacement spans are underlined and labelled Inserted. Kept text remains unchanged. Pending findings are provisional. The view respects masking. The Removed/Inserted labels exist only in the display; they are not included in the exported text.

## Export reminders

The three checkboxes remind you to inspect undetected personal details, document extraction/omissions, and the final copy. They are optional reminders, not an accuracy guarantee or an additional export lock. Source, decision and replacement changes reset them. Export still requires a complete current scan and explicit Redact/Keep decisions for every finding.

## Guided practice

Start the guided practice tour from the link above the workflow steps. It opens tour.html in a separate tab and leaves your work intact. Load the fictional example, check it, decide Redact or Keep on each finding, compare and optionally download fictional-tour.redacted.txt. Restart is available at any time. No automatic first-visit popup or saved completion tracking is used.

## Reset to Pending

Each card has Reset to Pending. This reopens that finding without affecting other decisions. It blocks export until resolved and is itself undoable.

## Automatic checks

Auto-check after edits is off by default. When enabled, typing/pasting or changing the profile/custom rules schedules a local check after an 800 ms pause. Composition input waits until composition ends. Automatic results do not scroll the page or move keyboard focus. Source changes cancel obsolete scans, and turning auto-check off cancels pending automatic work. Scans still have the existing 3-second timeout and 50,000-unit input cap. Enabling auto-check while a complete current review exists preserves its decisions until you edit. Example loading and file import remain explicit Check text workflows.

## Verification

143 automated tests pass, including rule bounds, metacharacters, overlapping spans, replacement output integrity, masked differences, pending/undo/export behavior, automatic-scan cancellation, input composition and the tour's exact downloaded output. Native Chrome visual and extension integration checks remain outstanding; earlier preview connections were refused. The detector's built-in rules and 80-case evaluation labels are unchanged by this release.
