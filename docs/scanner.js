/* Before You Send 0.2 — bounded, local detection. No browser APIs or I/O. */
(function (root) {
  'use strict';
  const MAX_LENGTH = 50000, MAX_FINDINGS = 200, MAX_CANDIDATES = 1500;
  const levels = { high: 2, review: 1 };
  const rules = [];
  function rule(id, label, group, pattern, why, options = {}) {
    rules.push({ id, label, group, pattern, why, level: 'high', ...options });
  }
  function luhn(value) {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19 || /^(\d)\1+$/.test(digits)) return false;
    let sum = 0, double = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = Number(digits[i]); if (double && (n *= 2) > 9) n -= 9;
      sum += n; double = !double;
    }
    return sum % 10 === 0;
  }
  function entropy(value) {
    const counts = {}; for (const c of value) counts[c] = (counts[c] || 0) + 1;
    return Object.values(counts).reduce((h, n) => h - n / value.length * Math.log2(n / value.length), 0);
  }
  // Normalize common copy/paste variants while maintaining original UTF-16 offsets.
  function normalize(text) {
    let value = ''; const starts = [], ends = [];
    for (let i = 0; i < text.length;) {
      const point = String.fromCodePoint(text.codePointAt(i)), end = i + point.length;
      let normalized = point.normalize('NFKC').replace(/[\u200b-\u200f\u202a-\u202e\u2060-\u2069\ufeff]/g, '');
      normalized = normalized.replace(/[\u0660-\u0669\u06f0-\u06f9]/g, c => String(c.charCodeAt(0) - (c <= '\u0669' ? 0x660 : 0x6f0)));
      normalized = normalized.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[‐‑‒–−]/g, '-');
      for (const unit of normalized.split('')) { value += unit; starts.push(i); ends.push(end); }
      i = end;
    }
    return { value, starts, ends };
  }
  rule('private-key', 'Private key material', 'credentials', /-----BEGIN (?:RSA |EC |DSA |OPENSSH |ENCRYPTED )?PRIVATE KEY-----[\s\S]*?(?:-----END (?:RSA |EC |DSA |OPENSSH |ENCRYPTED )?PRIVATE KEY-----|$)/g,
    'A supported private-key block is present. An unclosed block is covered through the end of the text.');
  rule('pgp-private', 'PGP private key material', 'credentials', /-----BEGIN PGP PRIVATE KEY BLOCK-----[\s\S]*?(?:-----END PGP PRIVATE KEY BLOCK-----|$)/g,
    'This is a private PGP key block, not a public key.');
  rule('github-token', 'Possible GitHub token', 'credentials', /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g,
    'This resembles a GitHub credential. Its validity is not checked.');
  rule('aws-key', 'Possible AWS access key ID', 'credentials', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,
    'This is an access-key-ID pattern, not the secret key itself. Review any associated secret.');
  rule('stripe-key', 'Possible Stripe secret or restricted key', 'credentials', /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{12,}\b/g,
    'Secret and restricted keys deserve protection, including test keys. Publishable pk_ keys are not matched by this rule.');
  rule('slack-token', 'Possible Slack token', 'credentials', /\bxox[baprs]-[A-Za-z0-9-]{12,}\b/g,
    'This resembles a Slack credential; the format alone does not verify it.');
  rule('service-key', 'Possible service API key', 'credentials', /\b(?:sk-(?:proj-|svcacct-|ant-api\d+-)?[A-Za-z0-9_-]{20,}|AIza[A-Za-z0-9_-]{35}|npm_[A-Za-z0-9]{30,}|glpat-[A-Za-z0-9_-]{20,}|SG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{20,})\b/g,
    'This matches a supported service-key pattern. Some keys are deliberately public or restricted; review the context.');
  rule('webhook', 'Possible private webhook URL', 'credentials', /https:\/\/(?:hooks\.slack\.com\/services\/|(?:canary\.|ptb\.)?discord(?:app)?\.com\/api\/webhooks\/)[^\s<>"']+/gi,
    'This URL may contain a token that permits actions on a service. Redact the full URL.');
  rule('authorization', 'Authorization credential', 'credentials', /(?:\bBearer|\bAuthorization[ \t]*:[ \t]*Basic)[ \t]+([A-Za-z0-9._~+\/-]+={0,2})/gi,
    'Authentication data can grant access. Basic authentication is encoded, not encrypted.', { capture: 1 });
  rule('jwt', 'Possible JWT or encrypted token', 'credentials', /\beyJ[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]*){2,4}(?![A-Za-z0-9_.-])/g,
    'A JWT-like token can contain personal claims or grant access. No signature or expiry is validated.', {
      validate: v => { const parts = v.split('.'); return (parts.length === 3 || parts.length === 5) && parts[1].length > 0; }
    });
  rule('url-credentials', 'Credentials inside a URL', 'credentials', /(?<![a-z0-9+.-])\b[a-z][a-z0-9+.-]*:\/\/([^\s\/@<>"']+:[^\s\/@<>"']*)@/gi,
    'A username/password pair is embedded in the URL. The pair is removed while the destination is preserved.', { capture: 1 });
  rule('cookie', 'Cookie or session header', 'credentials', /\b(?:set-cookie|cookie)[ \t]*:[ \t]*([^\r\n]+)/gi,
    'A cookie header may contain a session credential. This rule covers its entire value.', { capture: 1 });
  // Prefixes allow environment-style names such as DB_PASSWORD and AWS_SECRET_ACCESS_KEY.
  const secretLabel = '(?:[a-z][a-z0-9]{0,63}[_-]){0,8}(?:password|passwd|pwd|passphrase|api[_ -]?key|api[_ -]?token|access[_ -]?token|refresh[_ -]?token|auth[_ -]?token|client[_ -]?secret|secret[_ -]?(?:access[_ -]?)?key|private[_ -]?key|session[_ -]?(?:id|token)|secret|token)';
  const secretPattern = new RegExp(String.raw`\b${secretLabel}\b["']?[ \t]*(?::|=|\bis\b)[ \t]*("(?:\\(?:[\s\S]|$)|[^"\\])*(?:"|$)|'(?:\\(?:[\s\S]|$)|[^'\\])*(?:'|$)|[^\s,;"'<>}\]\[]+)`, 'gi');
  rule('labelled-secret', 'Labelled secret', 'credentials', secretPattern,
    'A secret-related label is followed by a value. Quoted values, escapes and short passwords are included.', { capture: 1, quoted: true });
  rule('sensitive-query', 'Sensitive URL parameter', 'credentials', /[?&#](?:access_token|refresh_token|token|api_key|apikey|key|password|passwd|secret|client_secret|signature|sig|x-amz-signature|x-goog-signature|code)=([^&#\s<>"']+)/gi,
    'A URL parameter can carry credentials or a temporary authorization code. Encoded values are redacted as a whole.', { capture: 1 });
  rule('encoded-query', 'Encoded sensitive URL parameter', 'credentials', /[?&#]([A-Za-z0-9_%.-]+)=([^&#\s<>"']+)/g,
    'A percent-encoded parameter name resolves to a supported sensitive field. The encoded value is covered without decoding or executing it.', { capture:2, validate:(value, match)=>{
      if(!match[1].includes('%'))return false;
      try{return /^(?:access_token|refresh_token|token|api_key|apikey|key|password|passwd|secret|client_secret|signature|sig|code)$/i.test(decodeURIComponent(match[1]));}catch{return false;}
    } });
  rule('otp', 'Labelled verification code or PIN', 'credentials', /\b(?:otp|pin|one[ -]time[ -](?:password|code)|verification[ -]code|recovery[ -]code|backup[ -]code)\b[ \t]*(?::|=|is)[ \t]*["']?([A-Za-z0-9][A-Za-z0-9-]{2,31})/gi,
    'A labelled code may be usable for verification or recovery. Check even short numeric values.', { capture: 1 });
  rule('email', 'Email address', 'personal', /(?<![A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-])[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+\b/g,
    'Check whether the recipient needs this contact detail.', { level: 'review' });
  rule('obfuscated-email', 'Obfuscated email address', 'personal', /(?<![A-Za-z0-9._%+-])[A-Za-z0-9._%+-]{1,64}[ \t]*(?:\[at\]|\(at\))[ \t]*[A-Za-z0-9-]+(?:[ \t]*(?:\[dot\]|\(dot\))[ \t]*[A-Za-z0-9-]+)+\b/gi,
    'Replacing @ and dots does not necessarily make an address private.', { level: 'review', strict: true });
  rule('card', 'Possible payment-card number', 'financial', /(?<![\d])\d(?:[ \t-]?\d){12,18}(?![\d])/g,
    'The number passes a Luhn checksum. It is not verified as a real account.', { validate: luhn });
  rule('iban', 'Possible IBAN', 'financial', /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]){11,30}\b/g,
    'This bank-account-like value passes the IBAN mod-97 check; bank or account existence is not verified.', { validate: v => {
      const s = v.replace(/ /g,''); if (s.length < 15 || s.length > 34) return false;
      const rearranged = s.slice(4)+s.slice(0,4); let remainder=0;
      for(const c of rearranged){ for(const d of (/[A-Z]/.test(c)?String(c.charCodeAt(0)-55):c)) remainder=(remainder*10+Number(d))%97; }
      return remainder===1;
    } });
  rule('phone', 'Possible phone number', 'personal', /(?<![\w+])(?:\+\d[\d ()-]{7,22}\d|0(?:1\d|[3-9])[\d -]{6,12}\d)(?!\w)/g,
    'This resembles an international or Malaysian phone number, not a verified subscriber.', { level: 'review', validate: v => {
      const d=v.replace(/\D/g,''); return d.length>=9 && d.length<=15 && !/^(\d)\1+$/.test(d);
    } });
  rule('labelled-personal', 'Labelled personal or financial detail', 'personal', /\b(?:full[ _-]?name|home[ _-]?address|postal[ _-]?address|date[ _-]?of[ _-]?birth|dob|passport(?:[ _-]?(?:number|no))?|mykad|nric|ic[ _-]?(?:number|no)|national[ _-]?id|ssn|social[ _-]?security(?:[ _-]?number)?|bank[ _-]?account(?:[ _-]?(?:number|no))?|account[ _-]?(?:number|no)|cvv|cvc|card[ _-]?number|phone|mobile)\b["']?[ \t]*[:=][ \t]*("(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|[^\r\n,;<>}]+)/gi,
    'A personal or financial field is explicitly labelled. The whole field value is covered; confirm its boundaries.', { capture: 1, quoted: true, level: 'review' });
  rule('my-id', 'Possible Malaysian identity number', 'personal', /\b\d{6}-\d{2}-\d{4}\b/g,
    'This resembles a Malaysian identity number with a plausible birth date. It is not validated against government records.', { level: 'review', strict: true, validate: v => {
      const y=2000+Number(v.slice(0,2)), m=Number(v.slice(2,4)),d=Number(v.slice(4,6));
      const date=new Date(Date.UTC(y,m-1,d)); return date.getUTCMonth()===m-1 && date.getUTCDate()===d;
    } });
  rule('ipv4', 'IP address to review', 'context', /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    'IP addresses are not inherently secret. Check whether this exposes internal infrastructure or someone’s network details.', { level: 'review', strict: true, validate: v => v.split('.').every(p=>Number(p)<=255) });
  rule('opaque', 'Unlabelled opaque value', 'context', /(?<![A-Za-z0-9_+\/-])[A-Za-z0-9_+\/-]{32,256}={0,2}(?![A-Za-z0-9_+\/-])/g,
    'This varied, token-like string could be a secret, hash, identifier or encoded data. It is a heuristic, not a confirmed credential.', { level:'review', strict:true, validate:v=>/\d/.test(v)&&/[a-z]/.test(v)&&/[A-Z]/.test(v)&&entropy(v)>=4.2 });

  function merge(candidates) {
    const sorted=[...candidates].sort((a,b)=>a.start-b.start||b.end-a.end);
    const merged=[];
    for(const item of sorted){
      const last=merged[merged.length-1];
      if(last && item.start<last.end){
        last.end=Math.max(last.end,item.end);
        if(!last.rules.includes(item.rule)) {last.rules.push(item.rule);last.reasons.push(item.why);}
        if(levels[item.level]>levels[last.level]){last.level=item.level;last.label=item.label;last.rule=item.rule;last.group=item.group;last.why=item.why;}
      }else merged.push({...item,rules:[item.rule],reasons:[item.why]});
    }
    return merged.map((f,id)=>({...f,id}));
  }
  function scan(text, options={}) {
    if(typeof text!=='string') throw new TypeError('Text must be a string.');
    if(text.length>MAX_LENGTH) throw new RangeError('Check up to 50,000 text units at a time.');
    const mode=options.mode ?? 'strict';
    if(!['strict','balanced'].includes(mode)) throw new TypeError('Unknown detection profile.');
    const view=normalize(text), candidates=[]; let limited=false;
    for(const r of rules){
      if(r.strict && mode!=='strict') continue;
      // The d flag provides exact capture offsets, including repeated/escaped values.
      const regex=new RegExp(r.pattern.source,r.pattern.flags+'d');let match;
      while((match=regex.exec(view.value))!==null){
        if(r.id==='labelled-secret' && /[?&#]/.test(view.value[match.index-1]||''))continue;
        const slot=r.capture||0;let [start,end]=match.indices[slot];
        if(r.id==='email' && candidates.some(c=>c.rule==='url-credentials' && view.starts[start]>=c.start && view.starts[start]<c.end))continue;
        const quoted=r.quoted && (view.value[start]==='"'||view.value[start]==="'");
        if(quoted){const quote=view.value[start];start++;if(end>start && view.value[end-1]===quote)end--;}
        if(!quoted)while(end>start && /[ \t]/.test(view.value[end-1])) end--;
        if(end<=start) continue;
        const value=view.value.slice(start,end);
        if(r.validate&&!r.validate(value,match))continue;
        if(candidates.length>=MAX_CANDIDATES){limited=true;break;}
        candidates.push({start:view.starts[start],end:view.ends[end-1],rule:r.id,label:r.label,group:r.group,level:r.level,why:r.why});
      }
      if(limited)break;
    }
    let findings=merge(candidates);
    if(findings.length>MAX_FINDINGS){limited=true;findings=findings.slice(0,MAX_FINDINGS);}
    return { findings, limited, mode, ruleCount:rules.filter(r=>!r.strict||mode==='strict').length,
      normalized:view.value!==text, coverage:limited?'incomplete':'completed' };
  }
  function redact(text, findings) {
    if(typeof text!=='string'||!Array.isArray(findings))throw new TypeError('Invalid redaction input.');
    for(const f of findings) if(!f||!Number.isInteger(f.start)||!Number.isInteger(f.end)||f.start<0||f.end>text.length||f.end<=f.start)throw new RangeError('Invalid finding range.');
    // Merge independently to ensure even overlapping caller-provided spans cannot leak a tail.
    const sorted=[...findings].sort((a,b)=>a.start-b.start), spans=[];
    for(const f of sorted){const last=spans[spans.length-1];if(last&&f.start<last.end)last.end=Math.max(last.end,f.end);else spans.push({start:f.start,end:f.end});}
    let output='',cursor=0;
    for(const f of spans){output+=text.slice(cursor,f.start)+'[REDACTED]';cursor=f.end;}
    return output+text.slice(cursor);
  }
  const api=Object.freeze({scan,redact,MAX_LENGTH,MAX_FINDINGS,ruleCatalog:rules.map(r=>({id:r.id,label:r.label,strict:!!r.strict}))});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BeforeYouSendScanner=api;
})(typeof globalThis!=='undefined'?globalThis:this);
