'use strict';
const scanner = globalThis.BeforeYouSendScanner;
const byId = id => document.getElementById(id);
const draft = byId('draft');
let lastText = '', findings = [], limited = false, revision = 0;
let scanWorker = null, scanTimer = null;
function cancelScan() {
  if (scanWorker) { scanWorker.onmessage = null; scanWorker.onerror = null; scanWorker.terminate(); }
  scanWorker = null;
  clearTimeout(scanTimer); scanTimer = null;
  byId('scan').removeAttribute('aria-busy');
  byId('scan').textContent = 'Check text ↗';
  byId('scan').disabled = draft.value.length > scanner.MAX_LENGTH;
}
const selected = new Set();

function status(message, error = false) {
  byId('status').textContent = message;
  byId('status').className = `status${error ? ' error' : ''}`;
}

function invalidate() {
  globalThis.BeforeYouSendPowerup?.cancel();
  cancelScan();
  revision++;
  findings = [];
  selected.clear();
  lastText = '';
  limited = false;
  byId('results').hidden = true;
  byId('findings').replaceChildren();
  byId('highlighted').replaceChildren();
  byId('redacted').value = '';
  byId('copy-status').textContent = '';
  byId('count').textContent = `${draft.value.length.toLocaleString()} / 50,000 text units`;
  const over = draft.value.length > scanner.MAX_LENGTH;
  byId('scan').disabled = over;
  status(over ? 'Too much text. Reduce it to 50,000 text units; nothing has been scanned.' : 'Text is not saved or uploaded. Closing this popup clears it.', over);
}

byId('import-file').addEventListener('change', async () => {
  const picker = byId('import-file');
  const file = picker.files?.[0];
  if (!file) return;
  // Reset the picker so the same file can be chosen again after editing it.
  picker.value = '';
  invalidate();
  const requestRevision = revision;
  picker.disabled = true;
  status('Reading the file locally…');
  try {
    const text = await globalThis.BeforeYouSendImporter.read(file);
    if (requestRevision !== revision) return;
    draft.value = text;
    invalidate();
    status(`Imported ${file.name}. Press Check text to review it.`);
  } catch (error) {
    if (requestRevision === revision) status(error.message || 'Could not read this file. Try another text file.', true);
  } finally { picker.disabled = false; }
});

draft.addEventListener('input', invalidate);
byId('profile').addEventListener('change', () => {
  invalidate();
  byId('profile-note').textContent = byId('profile').value === 'strict' ? 'Strict includes opaque strings, IP addresses and selected identity patterns.' : 'Balanced omits the broadest heuristics; core secret and personal-detail checks stay on.';
});
byId('clear').addEventListener('click', () => { draft.value = ''; invalidate(); draft.focus(); });
byId('sample').addEventListener('click', () => {
  const example=BeforeYouSendExamples.get(byId('example-choice').value);
  draft.value=example.text;
  invalidate();
  status(`Loaded fictional example: ${example.title}. Select Check text to try the scanner.`);
});

// Runs only after the user presses Use selected text. Main document only.
async function captureSelection() {
  if (!globalThis.chrome?.scripting || !globalThis.chrome?.tabs) {
    status('Webpage selection needs the installed extension. You can paste text here instead.', true);
    return;
  }
  const requestRevision = revision;
  byId('capture').disabled = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!Number.isInteger(tab?.id)) throw new Error('No active tab');
    const response = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (limit) => {
        let active = document.activeElement;
        // Traverse focused open shadow roots, without examining unrelated page text.
        while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
        if (active?.tagName === 'INPUT' && active.type === 'password') return { password: true };
        let text = '';
        if (active?.tagName === 'TEXTAREA' || active?.tagName === 'INPUT') {
          if (typeof active.selectionStart === 'number' && typeof active.selectionEnd === 'number') {
            const length = active.selectionEnd - active.selectionStart;
            if (length > limit) return { tooLong: true };
            text = active.value.slice(active.selectionStart, active.selectionEnd);
          }
        } else {
          text = window.getSelection()?.toString() || '';
        }
        if (text.length > limit) return { tooLong: true };
        return { text };
      },
      args: [scanner.MAX_LENGTH]
    });
    if (requestRevision !== revision) return;
    const result = response?.[0]?.result;
    if (result?.password) { status('Password fields are not read. Use fictional examples when testing.', true); return; }
    if (result?.tooLong) { status('Select fewer than 50,001 text units, then try again.', true); return; }
    if (!result?.text?.trim()) { status('No selection found in this page’s main document. Select text first, or paste it here.', true); return; }
    draft.value = result.text;
    invalidate();
    status('Selected text loaded. Press Check text to review it.');
  } catch {
    if (requestRevision === revision) status('This page cannot be read. Browser settings, store pages, PDFs, and embedded editors may be restricted. Paste text here instead.', true);
  } finally { byId('capture').disabled = false; }
}
byId('capture').addEventListener('click', captureSelection);

function updateRedaction() {
  const chosen = findings.filter(f => selected.has(f.id));
  byId('redacted').value = scanner.redact(lastText, chosen);
  byId('selected-count').textContent = `${chosen.length} of ${findings.length} selected`;
  byId('copy').disabled = limited || chosen.length === 0;
  byId('copy-status').textContent = limited ? 'Too many findings. Check smaller sections before copying.' : chosen.length === 0 ? 'Select at least one finding to redact.' : '';
}

function renderFindings() {
  const list = byId('findings');
  const targets = new Map();
  list.replaceChildren();
  for (const finding of findings) {
    const label = document.createElement('article');
    label.className = `finding${finding.level === 'high' ? ' priority' : ''}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.setAttribute('aria-label', `Redact ${finding.label} at character ${finding.start + 1}`);
    checkbox.addEventListener('change', () => {
      checkbox.checked ? selected.add(finding.id) : selected.delete(finding.id);
      revision++;
      updateRedaction();
    });
    const body = document.createElement('div');
    const heading = document.createElement('strong');
    const detail = globalThis.BeforeYouSendReview?.describe(finding, lastText);
    heading.textContent = `${finding.id + 1}. ${detail?.category || finding.label}`;
    const severity = document.createElement('span');
    severity.className = `severity ${finding.level === 'review' ? 'review' : ''}`;
    severity.textContent = finding.level === 'high' ? 'PRIORITY' : 'REVIEW';
    heading.append(severity);
    const position = document.createElement('span');
    position.className = 'position';
    const prefix = lastText.slice(0, finding.start);
    const line = prefix.split('\n').length;
    const column = Array.from(prefix.slice(prefix.lastIndexOf('\n') + 1)).length + 1;
    position.textContent = `Line ${line}, column ${column} · ${finding.end - finding.start} text units`;
    const explanation = document.createElement('p');
    explanation.textContent = finding.why + (detail ? ' What to check: ' + detail.action : '') + (finding.rules.length > 1 ? ` ${finding.rules.length} overlapping checks were combined to cover the full span.` : '');
    const snippet = document.createElement('pre');
    snippet.className = 'finding-code';
    snippet.setAttribute('aria-label', `Code excerpt for finding ${finding.id + 1}, line ${line}`);
    const lineStart = lastText.lastIndexOf('\n', finding.start - 1) + 1;
    const excerptStart = Math.max(lineStart, finding.start - 100);
    const nextNewline = lastText.indexOf('\n', finding.end);
    const excerptEnd = Math.min(nextNewline < 0 ? lastText.length : nextNewline, finding.end + 100);
    snippet.append(document.createTextNode((excerptStart > lineStart ? '…' : '') + lastText.slice(excerptStart, finding.start)));
    const excerptMatch = document.createElement('mark');
    const matchedText = lastText.slice(finding.start, finding.end);
    excerptMatch.textContent = matchedText.length > 160 ? matchedText.slice(0, 160) + '…' : matchedText;
    snippet.append(excerptMatch, document.createTextNode(lastText.slice(finding.end, excerptEnd) + (excerptEnd < (nextNewline < 0 ? lastText.length : nextNewline) ? '…' : '')));
    const jump = document.createElement('button');
    jump.type = 'button';
    jump.className = 'show-code';
    jump.textContent = `Show in code · line ${line}`;
    jump.addEventListener('click', () => {
      byId('highlight-details').open = true;
      for (const target of targets.values()) target.className = '';
      const target = targets.get(finding.id);
      if (!target) return;
      target.className = 'active-match';
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'center', inline: 'nearest' });
      status(`Showing finding ${finding.id + 1} at line ${line}, column ${column}. Red marks the detected text, not a compiler error.`);
    });
    const excerptHint = document.createElement('p');
    excerptHint.className = 'excerpt-hint';
    excerptHint.textContent = matchedText.length > 160 ? 'Match preview shortened. Show in code reveals the complete highlighted span.' : 'Red highlight = the exact text flagged for review.';
    body.append(heading, position, snippet, excerptHint, jump, explanation);
    label.append(checkbox, body);
    list.append(label);
  }
  // DOM text nodes ensure pasted HTML is never interpreted as executable markup.
  const highlighted = byId('highlighted');
  highlighted.replaceChildren();
  let cursor = 0;
  for (const f of findings) {
    highlighted.append(document.createTextNode(lastText.slice(cursor, f.start)));
    const mark = document.createElement('mark');
    mark.textContent = lastText.slice(f.start, f.end);
    mark.title = `Finding ${f.id + 1}: ${f.label}`;
    mark.tabIndex = -1;
    mark.setAttribute('aria-label', `Finding ${f.id + 1}: ${f.label}`);
    targets.set(f.id, mark);
    highlighted.append(mark);
    cursor = f.end;
  }
  highlighted.append(document.createTextNode(lastText.slice(cursor)));
  byId('highlight-details').open = false;
}

function displayResults(result) {
  findings = result.findings;
  limited = result.limited;
  selected.clear();
  for (const f of findings) selected.add(f.id);
  byId('results').hidden = false;
  byId('results').className = limited || findings.length ? 'has-warnings' : '';
  const high = findings.filter(f => f.level === 'high').length;
  byId('result-title').textContent = limited ? 'Check smaller sections' : findings.length ? `${findings.length} item${findings.length === 1 ? '' : 's'} to review` : 'No patterns found';
  byId('risk-count').textContent = high ? `${high} priority` : 'Review context';
  byId('risk-count').className = `pill${findings.length || limited ? '' : ' neutral'}`;
  byId('result-summary').textContent = limited
    ? 'The findings limit was reached. These results are incomplete. Split the text into smaller sections and check again.'
    : findings.length ? 'Possible matches, not confirmed leaks. Uncheck only the details you intentionally want to keep.'
    : 'Nothing matched the supported checks. This is not a guarantee that the text is safe to share.';
  byId('coverage-note').textContent = `${result.ruleCount} rule families · ${result.mode === 'strict' ? 'Strict' : 'Balanced'} profile · ${limited ? 'Incomplete check' : 'Check completed'}` + (result.normalized ? ' · Copy/paste variations normalized for matching; original text preserved.' : '');
  renderFindings();
  byId('redaction-section').hidden = findings.length === 0;
  byId('select-all').disabled = findings.length === 0;
  byId('select-none').disabled = findings.length === 0;
  updateRedaction();
  status('Review the full message, including details outside the supported checks.');
  byId('result-title').tabIndex = -1;
  byId('result-title').focus({ preventScroll: true });
  byId('results').scrollIntoView({ block: 'nearest' });
}
byId('select-all').addEventListener('click', () => {
  findings.forEach(f => selected.add(f.id));
  byId('findings').querySelectorAll('input').forEach(c => c.checked = true);
  revision++; updateRedaction();
});
byId('select-none').addEventListener('click', () => {
  selected.clear();
  byId('findings').querySelectorAll('input').forEach(c => c.checked = false);
  revision++; updateRedaction();
});
byId('scan').addEventListener('click', () => {
  if (!draft.value.trim()) { status('Paste or select some text first.', true); return; }
  invalidate();
  if (draft.value.length > scanner.MAX_LENGTH) return;
  const requestRevision = revision;
  const scanText = draft.value;
  const fail = message => {
    if (requestRevision !== revision) return;
    globalThis.BeforeYouSendPowerup?.cancel();
    cancelScan();
    revision++;
    status(message, true);
  };
  byId('scan').disabled = true;
  byId('scan').setAttribute('aria-busy', 'true');
  byId('scan').textContent = 'Checking locally…';
  status('Checking supported patterns on this device…');
  globalThis.BeforeYouSendPowerup?.start();
  try {
    scanWorker = new Worker('worker.js');
    scanWorker.onmessage = ({ data }) => {
      if (requestRevision !== revision) return;
      cancelScan();
      revision++;
      if (data.error) { globalThis.BeforeYouSendPowerup?.cancel(); status(data.error, true); return; }
      if (!data.result || !Array.isArray(data.result.findings)) { globalThis.BeforeYouSendPowerup?.cancel(); status('The check returned an invalid result. Try again.', true); return; }
      const delivered=revision;
      const showResults=()=>{if(delivered!==revision)return;cancelScan();lastText=scanText;displayResults(data.result);};
      if(data.result.limited){globalThis.BeforeYouSendPowerup?.cancel();showResults();}
      else if(globalThis.BeforeYouSendPowerup){byId('scan').disabled=true;status('Check complete. Preparing the review…');globalThis.BeforeYouSendPowerup.finish(showResults);}
      else showResults();
    };
    scanWorker.onerror = () => fail('The local scanner could not run. Reload the installed extension and try again.');
    scanTimer = setTimeout(() => fail('The check exceeded its time limit. Nothing is marked complete. Try a smaller section.'), 3000);
    scanWorker.postMessage({ text: scanText, mode: byId('profile').value });
  } catch { fail('Open the installed extension to run checks. This browser context cannot start the local scanner.'); }
});
byId('copy').addEventListener('click', async () => {
  if (limited || !selected.size || lastText !== draft.value) return;
  const copiedRevision = revision;
  try {
    await navigator.clipboard.writeText(byId('redacted').value);
    if (copiedRevision === revision) byId('copy-status').textContent = 'Redacted text copied. Review it again where you paste it.';
  } catch {
    if (copiedRevision === revision) {
      byId('redacted').focus();
      byId('redacted').select();
      byId('copy-status').textContent = 'Clipboard unavailable. The output is selected; copy it manually.';
    }
  }
});
invalidate();

window.addEventListener('pagehide', () => { draft.value = ''; invalidate(); });
