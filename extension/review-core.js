/* Shared, pure workspace logic. All offsets refer to original UTF-16 text. */
(function(root){
'use strict';
function describe(f,text){
 const prefix=text.slice(Math.max(0,f.start-160),f.start);
 const key=prefix.match(/([a-z][a-z0-9_-]*)["']?\s*(?:=|:|is)\s*["']?$/i)?.[1]||'';
 const r=f.rules||[f.rule];let category=f.label,action='Check whether this detail is necessary for the intended recipient.';
 if(r.some(x=>/private|pgp/.test(x))){category='Private key';action='Remove private key material before sharing. If a real key was exposed, rotate or revoke it through its service.';}
 else if(r.includes('labelled-secret')){
  category=/password|passwd|pwd|passphrase/i.test(key)?'Password':/key/i.test(key)?'API key / secret key':/session/i.test(key)?'Session credential':/token/i.test(key)?'Access token':'Secret value';
  action='Replace a real credential with a placeholder before sharing. A placeholder copy is not runnable configuration.';
 }else if(r.some(x=>/token|jwt|authorization/.test(x))){category='Access / authentication token';action='Check whether this token grants access or contains private claims; redact it unless sharing is specifically intended.';}
 else if(r.some(x=>/key/.test(x))){category='API key / key identifier';action='Check the provider and whether the value is secret or deliberately public. Pattern matching does not verify validity.';}
 else if(r.includes('cookie')){category='Session / cookie data';action='A cookie may grant account access. Review the entire header before sharing.';}
 else if(r.some(x=>/url|query|webhook/.test(x))){category='Credential-bearing URL';action='Remove authentication values before sharing the link.';}
 else if(r.some(x=>/email|phone/.test(x))){category='Contact detail';}
 else if(r.some(x=>/card|iban/.test(x))){category='Financial detail';}
 else if(r.includes('labelled-personal')||r.includes('my-id')){category='Personal / identity detail';}
 else if(r.includes('otp')){category='Verification / recovery code';action='Do not share a live login or recovery code.';}
 else if(r.some(x=>/opaque|ipv4/.test(x))){category='Needs context';action='This may be an ordinary identifier, hash or network address. Keep it only after considering the recipient and purpose.';}
 if(r.every(x=>x==='custom-term')){category='Custom confidential term';action='Check whether this term reveals private project, device or organisational information.';}
 const exposure=/Password|token|credential|Session|Secret|Private key|API key|Verification/i.test(category)?'A real value may allow access to an account, service or device.':/Contact|Personal|Financial/i.test(category)?'This may disclose personal, contact or financial information.':'This may reveal confidential context, identifiers or internal infrastructure.';
 return {category,field:key,trigger:f.why,action,exposure,evidence:r.includes('custom-term')?'Includes a custom literal match. Matching does not establish confidentiality or validity.':'Pattern evidence only. The scanner does not verify whether this value is real, active or confidential.'};
}
function summary(findings,decisions){
 let pending=0,redact=0,keep=0;
 for(const f of findings){const d=decisions.get(f.id);if(d==='redact')redact++;else if(d==='keep')keep++;else pending++;}
 return {pending,redact,keep};
}
function exportName(name){
 const cleaned=String(name||'message').split(/[\\/]/).pop().replace(/[^A-Za-z0-9._-]/g,'_').slice(0,100)||'message';
 return cleaned+'.redacted.txt';
}
function lineStarts(text){const result=[0];for(let i=0;i<text.length;i++)if(text[i]==='\n')result.push(i+1);return result;}
function lineAt(starts,offset){let lo=0,hi=starts.length;while(lo<hi){const mid=(lo+hi)>>1;if(starts[mid]<=offset)lo=mid+1;else hi=mid;}return Math.max(0,lo-1);}
function canExport(findings,decisions,complete){const s=summary(findings,decisions);return !!complete&&s.pending===0;}
function replacement(f,text,style='generic',overrides=new Map()){
 if(overrides.has(f.id))return overrides.get(f.id);
 if(style!=='category')return '[REDACTED]';
 const category=describe(f,text).category;
 const label=/Password/.test(category)?'PASSWORD':/Private key/.test(category)?'PRIVATE KEY':/API key/.test(category)?'API KEY':/token|credential|Session|Secret|Verification/i.test(category)?'CREDENTIAL':/Contact/.test(category)?'CONTACT':/Financial/.test(category)?'FINANCIAL DETAIL':/Personal/.test(category)?'PERSONAL DETAIL':/Custom/.test(category)?'CONFIDENTIAL TERM':'SENSITIVE DETAIL';
 return '['+label+' REMOVED]';
}
function sharingCopy(text,findings,decisions,style,overrides){let result='',cursor=0;for(const f of findings){result+=text.slice(cursor,f.start)+(decisions.get(f.id)==='keep'?text.slice(f.start,f.end):replacement(f,text,style,overrides));cursor=f.end;}return result+text.slice(cursor);}
function validateReplacement(value){if(typeof value!=='string'||!value.trim()||value.length>100||/[\u0000-\u001f\u007f]/.test(value))throw Error('Use 1–100 visible text units for a custom replacement, without line breaks.');return value;}
const api={describe,summary,exportName,lineStarts,lineAt,canExport,replacement,sharingCopy,validateReplacement};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BeforeYouSendReview=api;
})(typeof globalThis!=='undefined'?globalThis:this);
