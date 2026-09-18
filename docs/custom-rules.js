/* Bounded literal-only rules; user text is never executable regular-expression syntax. */
(function(root){'use strict';
function parse(value){
 if(typeof value!=='string'||value.length>3000)throw Error('Custom rules are limited to 3,000 text units.');
 const terms=[...new Set(value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean))];
 if(terms.length>20)throw Error('Use at most 20 custom terms, one per line.');
 if(terms.some(x=>x.length<2||x.length>128))throw Error('Each custom term must contain 2–128 text units.');
 return terms;
}
function scan(scanner,text,options={}){
 const terms=parse(options.customRules||'');
 const result=scanner.scan(text,{mode:options.mode});
 if(!terms.length)return {...result,customRuleCount:0};
 const candidates=result.findings.map(f=>({...f,rules:[...f.rules],reasons:[...f.reasons]}));let limited=result.limited,count=0;
 outer:for(const term of terms){
  const escaped=term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const pattern=new RegExp(escaped,options.caseSensitive?'gu':'giu');let match;
  while((match=pattern.exec(text))){
   if(++count>1500){limited=true;break outer;}
   candidates.push({start:match.index,end:match.index+match[0].length,rule:'custom-term',label:'Custom confidential term',group:'custom',level:'review',why:'Matches a literal term you asked to review.',rules:['custom-term'],reasons:['Matches a literal term you asked to review.']});
   // Consider overlapping literal matches (for example aba in ababa).
   pattern.lastIndex=match.index+(text.codePointAt(match.index)>0xffff?2:1);
  }
 }
 candidates.sort((a,b)=>a.start-b.start||b.end-a.end);const merged=[];
 for(const f of candidates){const previous=merged[merged.length-1];
  if(previous&&f.start<previous.end){previous.end=Math.max(previous.end,f.end);previous.rules=[...new Set([...previous.rules,...f.rules])];previous.reasons=[...new Set([...previous.reasons,...f.reasons])];if(previous.level!=='high'&&f.level==='high'){for(const key of ['rule','label','group','level','why'])previous[key]=f[key];}}
  else merged.push({...f});
 }
 if(merged.length>scanner.MAX_FINDINGS)limited=true;
 return {...result,limited,findings:merged.slice(0,scanner.MAX_FINDINGS).map((f,id)=>({...f,id})),customRuleCount:terms.length};
}
const api={parse,scan};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BeforeYouSendCustom=api;
})(typeof globalThis!=='undefined'?globalThis:this);
