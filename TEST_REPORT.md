# v0.4 validation

109 automated tests passed across detector, importer, popup, workspace and review-core suites. Tests exercised real scan/redaction functions, with DOM/Worker/clipboard/download test doubles for UI controllers. Download tests verified generated Blob contents and separate filenames.

JavaScript syntax, asset references, control identifiers, manifest version and unchanged permissions were checked. Development/evaluation labels were checked for valid ordered UTF-16 spans. The dataset evaluator was rerun; see datasets/EVALUATION.md for measured results and limitations.

Native Chrome extension tab opening, rendering, keyboard interaction and browser-managed downloads remain unverified in this environment. Follow TESTING.md on desktop Chrome.

## v0.4.1

28 existing popup/workspace controller tests passed after the presentation update. Motion/workspace JavaScript syntax, HTML asset references and unchanged permissions were verified. Browser animation rendering remains to be checked in Chrome.


v0.5.0: 28 popup/workspace behavior tests passed. Visual CSS refresh; native Chrome visual verification not performed.


## v0.6.0 document imports
117 tests passed, including real PDF and DOCX fixtures, .ino names, mixed/blank PDF rejection, malformed archives, document limits, legacy .doc guidance and the existing scanner/UI suite. Native Chrome integration has not been verified. npm audit for parser dependencies reported 0 known advisories at packaging time; this is not proof of security.


## v0.7.0 seven review improvements
127 automated tests passed. Added regression coverage for undo bulk/individual decisions, filter/export gating, masked preview surfaces versus actual clipboard output, trusted PDF metadata, page progress, stale imports and drop handlers. Expanded evaluation to 80 manually labelled synthetic examples: Strict exact-span precision 89.8%, recall 86.9%; Balanced precision 89.5%, recall 83.6%. Mismatch details retained. Native Chrome UI not verified: local browser preview connection refused.


## v0.8.0 example chooser and creator credit
131 automated tests passed. All 100 distinct examples scanned within limits in both profiles. Tested category filtering, example notes, selected-example loading in popup/workspace and invalidation of previous review decisions. Native Chrome visual verification remains outstanding.


## v0.9.0 advanced review
143 automated tests passed. Includes custom literal rule limits/Unicode/metacharacters/overlap union, category/custom replacement integrity, pending reset/undo, masked differences, advisory reminder resets, opt-in debouncing and stale automatic result cancellation, and guided-tour gating/download/restart. Native Chrome visual verification remains outstanding.


## v0.10.0 playful interface
47 existing interface/example/tour behavior tests passed. All extension runtime JavaScript was compared byte-for-byte with the saved v0.9.0 archive and is unchanged. All referenced local page assets exist; IDs are unique, creator attribution appears at top/bottom, and the new SVG parses successfully. Native Chrome visual verification remains outstanding.


## v0.11.0 power-up animation
51 animation/controller tests passed, including delayed/fast completion, cancellation/restart, reduced motion and changing preferences mid-sequence, stale-result rejection, incomplete/automatic scan bypass and worker error recovery. The scan remains independent of decorative animation; results are deferred briefly for the manual completion sequence. Native Chrome visual verification remains outstanding.
