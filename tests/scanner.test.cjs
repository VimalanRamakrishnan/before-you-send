'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { scan, redact, MAX_LENGTH } = require('../extension/scanner.js');

test('ordinary prose does not produce a finding', () => {
  assert.deepEqual(scan('Please review the meeting notes before Friday.').findings, []);
});
test('labelled values retain exact offsets and redact only the secret', () => {
  for (const text of ['password = "demo value 123"', "api_key: 'DEMO_123'", 'TOKEN=demo_123', '{"password":"demo value"}']) {
    const result = scan(text);
    assert.equal(result.findings.length, 1, text);
    const f = result.findings[0];
    assert.equal(f.rule, 'labelled-secret');
    assert.ok(!text.slice(f.start,f.end).includes('password'));
    const output = redact(text,result.findings);
    assert.ok(output.includes('[REDACTED]'));
    assert.ok(!output.includes(text.slice(f.start,f.end)));
  }
});
test('email and Malaysian/international phone patterns are review items', () => {
  const r = scan('Contact alex@example.com on +60 12-345 6789 or 012-3456789.');
  assert.equal(r.findings.filter(f=>f.rule==='email').length,1);
  assert.equal(r.findings.filter(f=>f.rule==='phone').length,2);
  assert.ok(r.findings.every(f=>f.level==='review'));
});
test('card candidates require a checksum and exclude repeated zeros', () => {
  assert.equal(scan('Test 4242 4242 4242 4242').findings[0].rule, 'card');
  assert.equal(scan('4242 4242 4242 4243').findings.filter(f=>f.rule==='card').length,0);
  assert.equal(scan('0000000000000000').findings.filter(f=>f.rule==='card').length,0);
});
test('private key blocks win over overlapping matches and preserve surrounding text', () => {
  const text='Before\n-----BEGIN PRIVATE KEY-----\npassword=DEMO_ONLY\n-----END PRIVATE KEY-----\nAfter';
  const r=scan(text);assert.equal(r.findings.length,1);assert.equal(r.findings[0].rule,'private-key');
  assert.equal(redact(text,r.findings),'Before\n[REDACTED]\nAfter');
});
test('an unclosed private key block is flagged through the end', () => {
  const text='-----BEGIN RSA PRIVATE KEY-----\nDEMO';
  const r=scan(text);
  assert.equal(r.findings[0].end,text.length);
});
test('recognises synthetic token formats and bearer value', () => {
  for(const [text,rule] of [
    ['ghp_'+'A'.repeat(36),'github-token'],
    ['github_pat_'+'B'.repeat(30),'github-token'],
    ['AKIA'+'C'.repeat(16),'aws-key'],
    ['Authorization: Bearer DEMO_TOKEN_VALUE','authorization']
  ]) assert.equal(scan(text).findings[0].rule,rule);
});
test('overlapping labelled email is classified as a secret once', () => {
  const r=scan('password="alex@example.com"');
  assert.equal(r.findings.length,1);assert.equal(r.findings[0].level,'high');
});
test('partial redaction preserves unselected information and Unicode', () => {
  const text='🔐 Email: alex@example.com; password=DEMO_SECRET';
  const r=scan(text);const chosen=r.findings.filter(f=>f.level==='high');
  assert.equal(redact(text,chosen),'🔐 Email: alex@example.com; password=[REDACTED]');
  assert.equal(redact(text,[]),text);
});
test('oversized, invalid and overlapping inputs fail explicitly', () => {
  assert.throws(()=>scan('x'.repeat(MAX_LENGTH+1)),RangeError);
  assert.throws(()=>scan(null),TypeError);
  assert.equal(redact('abcdef',[{start:0,end:4},{start:3,end:5}]),'[REDACTED]f');
  assert.throws(()=>redact('abcdef',[{start:-1,end:4}]),RangeError);
});
test('large result sets report incomplete scanning instead of silent truncation', () => {
  const r=scan(Array.from({length:201},(_,i)=>`person${i}@example.com`).join('\n'));
  assert.equal(r.findings.length,200);assert.equal(r.limited,true);
});
test('HTML-looking input remains an ordinary string through redaction', () => {
  const text='<img src=x onerror=alert(1)> password=DEMO_SECRET';
  assert.equal(redact(text,scan(text).findings),'<img src=x onerror=alert(1)> password=[REDACTED]');
});
