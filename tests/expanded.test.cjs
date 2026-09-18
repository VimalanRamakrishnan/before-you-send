'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {scan,redact,MAX_LENGTH,ruleCatalog}=require('../extension/scanner.js');
const has=(s,id,mode='strict')=>scan(s,{mode}).findings.some(f=>f.rules.includes(id));
const clean=s=>redact(s,scan(s).findings);
const cases=[
 ['environment variable','DB_PASSWORD=ab','labelled-secret'],
 ['AWS secret name','AWS_SECRET_ACCESS_KEY=DEMO_SECRET','labelled-secret'],
 ['camel case label','clientSecret="DEMO_SECRET"','labelled-secret'],
 ['single-character password','password=x','labelled-secret'],
 ['quoted whitespace','password="two words"','labelled-secret'],
 ['curly quotes','password=“DEMO_SECRET”','labelled-secret'],
 ['full-width label','ｐａｓｓｗｏｒｄ＝ＳＥＣＲＥＴ','labelled-secret'],
 ['invisible characters','pass\u200bword=DEMO_SECRET','labelled-secret'],
 ['bearer with period','Bearer DEMO.VALUE.TOKEN','authorization'],
 ['basic header','Authorization: Basic ZGVtbzpkZW1v','authorization'],
 ['database URL','postgres://demo:DEMO_PASSWORD@db.example/app','url-credentials'],
 ['encoded URL password','https://demo:p%40ss@example.com','url-credentials'],
 ['query parameter','https://example.com?access_token=DEMO%2FTOKEN&x=1','sensitive-query'],
 ['encoded parameter name','https://example.com?%74oken=DEMO_SECRET&x=1','encoded-query'],
 ['session cookie','Cookie: session=DEMO; theme=dark','cookie'],
 ['OTP','OTP: 123456','otp'],
 ['PIN','PIN=1234','otp'],
 ['Stripe secret','sk_live_'+'A'.repeat(24),'stripe-key'],
 ['Stripe test','sk_test_'+'B'.repeat(24),'stripe-key'],
 ['Stripe restricted','rk_live_'+'C'.repeat(24),'stripe-key'],
 ['Slack token','xoxb-1234567890-1234567890-DEMO','slack-token'],
 ['service key','sk-proj-'+'D'.repeat(40),'service-key'],
 ['JWT-like format','eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkZW1vIn0.DEMOSIGNATURE','jwt'],
 ['Slack webhook','https://hooks.slack.com/services/TDEMO/BDEMO/DEMO_ONLY','webhook'],
 ['PGP block','-----BEGIN PGP PRIVATE KEY BLOCK-----\nDEMO\n-----END PGP PRIVATE KEY BLOCK-----','pgp-private'],
 ['DOB label','DOB: 2000-01-01','labelled-personal'],
 ['home address label','Home address: 123 Fictional Street','labelled-personal'],
 ['bank account label','bank_account_number=12345678','labelled-personal'],
 ['MY formatted ID','000101-01-0000','my-id'],
 ['IP address','Internal host 192.168.1.10','ipv4'],
 ['obfuscated email','alex [at] example [dot] com','obfuscated-email'],
 ['IBAN test','GB82 WEST 1234 5698 7654 32','iban'],
 ['Arabic digits','٤٢٤٢ ٤٢٤٢ ٤٢٤٢ ٤٢٤٢','card'],
 ['NBSP card spacing','4242\u00a04242\u00a04242\u00a04242','card']
];
for(const [name,input,id] of cases)test(name,()=>assert.ok(has(input,id),name));

test('strict-only rules are deliberately absent in balanced mode',()=>{
 for(const [s,id] of [['192.168.1.10','ipv4'],['000101-01-0000','my-id'],['alex [at] example [dot] com','obfuscated-email']])assert.equal(has(s,id,'balanced'),false);
 assert.equal(has('password=DEMO_SECRET','labelled-secret','balanced'),true);
});
test('invalid identity dates and IP octets are rejected',()=>{
 assert.equal(has('001332-01-0000','my-id'),false);
 assert.equal(has('999.10.20.30','ipv4'),false);
});
test('public key material and publishable Stripe keys are not secret rules',()=>{
 assert.equal(has('-----BEGIN PUBLIC KEY-----\nDEMO\n-----END PUBLIC KEY-----','private-key'),false);
 assert.equal(has('pk_live_'+'A'.repeat(24),'stripe-key'),false);
});
test('unclosed quoted values cover the remaining secret',()=>{
 assert.equal(clean('password="DEMO_SECRET'),'password="[REDACTED]');
});
test('escaped quote values are redacted completely',()=>{
 assert.equal(clean('password="demo\\"secret"'),'password="[REDACTED]"');
});
test('multiline quoted secrets are handled',()=>{
 assert.equal(clean('password="first\nsecond"'),'password="[REDACTED]"');
});
test('repeated content gives exact offsets, not a last-substring guess',()=>{
 const s='password="password"; password="password"';
 assert.equal(clean(s),'password="[REDACTED]"; password="[REDACTED]"');
});
test('Unicode normalization maps back to original text and does not alter surroundings',()=>{
 const s='🔒 pass\u200bword=“ＳＥＣＲＥＴ” end';
 assert.equal(clean(s),'🔒 pass\u200bword=“[REDACTED]” end');
});
test('overlap unions preserve the tails of nested credentials',()=>{
 const s='password="Bearer DEMO_TOKEN with tail"';
 assert.equal(clean(s),'password="[REDACTED]"');
 assert.ok(scan(s).findings[0].rules.length>1);
});
test('cookie headers merge inner matches without losing remaining fields',()=>{
 assert.equal(clean('Cookie: token=DEMO_SECRET; email=alex@example.com'),'Cookie: [REDACTED]');
});
test('URL redaction keeps the host and nonsensitive parameters',()=>{
 assert.equal(clean('https://demo:DEMO_PASSWORD@example.com/?token=DEMO&x=1'),'https://[REDACTED]@example.com/?token=[REDACTED]&x=1');
});
test('invalid checksum and malformed percent encoding do not crash',()=>{
 assert.equal(has('GB83 WEST 1234 5698 7654 32','iban'),false);
 assert.doesNotThrow(()=>scan('https://example.com?%ZZtoken=DEMO'));
});
test('bad options and finding ranges fail intentionally',()=>{
 assert.throws(()=>scan('text',{mode:'unknown'}),TypeError);
 for(const f of [{start:1.5,end:3},{start:0,end:99},{start:3,end:2},{start:-1,end:3}])assert.throws(()=>redact('text',[f]),RangeError);
});
test('empty values are not treated as credentials',()=>{
 assert.equal(has('password=""','labelled-secret'),false);
 assert.equal(has('password=','labelled-secret'),false);
});
test('redaction union is deterministic across ordering and duplicates',()=>{
 const s='0123456789', f=[{start:2,end:5},{start:4,end:8},{start:2,end:5}];
 assert.equal(redact(s,f),'01[REDACTED]89');assert.equal(redact(s,f.reverse()),'01[REDACTED]89');
});
test('finding boundaries are valid and sorted across synthetic combined corpus',()=>{
 const s=cases.map(c=>c[1]).join('\n\n');const r=scan(s);let end=0;
 for(const f of r.findings){assert.ok(f.start>=end&&f.end>f.start&&f.end<=s.length);end=f.end;}
 assert.doesNotThrow(()=>redact(s,r.findings));
});
test('large repetitive and adversarial inputs finish within a generous budget',()=>{
 for(const s of ['a'.repeat(MAX_LENGTH),('password="').repeat(4000),'+1'.repeat(20000),('a-').repeat(25000),('x@').repeat(20000)]){
 const start=performance.now();scan(s);assert.ok(performance.now()-start<2500);
 }
});
test('rule catalog has unique IDs',()=>assert.equal(new Set(ruleCatalog.map(r=>r.id)).size,ruleCatalog.length));

test('Basic prose is not an authorization credential',()=>assert.equal(has('Basic knowledge is useful','authorization'),false));
test('quoted whitespace belongs to the secret value',()=>{assert.equal(clean('password="  abc  "'),'password="[REDACTED]"');assert.equal(clean('password=" "'),'password="[REDACTED]"');});
