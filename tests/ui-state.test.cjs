/* Controller tests with a minimal DOM and controllable Worker/clipboard.
   These validate state logic, not Chrome integration or visual layout. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const scanner=require('../extension/scanner.js');
function setup(powerup){
 class Element{
  constructor(tag='div'){this.tag=tag;this.value='';this.textContent='';this.children=[];this.events={};this.hidden=false;this.disabled=false;this.attrs={};}
  addEventListener(name,fn){this.events[name]=fn;}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=[...nodes];}
  setAttribute(k,v){this.attrs[k]=v;}
  removeAttribute(k){delete this.attrs[k];}
  focus(){} scrollIntoView(){} select(){this.selected=true;}
  querySelectorAll(tag){return this.children.flatMap(c=>typeof c==='object'?[...(c.tag===tag?[c]:[]),...c.querySelectorAll(tag)]:[]);}
 }
 const html=fs.readFileSync(path.join(__dirname,'../extension/popup.html'),'utf8');
 const nodes=Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Element()]));
 nodes.profile.value='strict';const workers=[],timers=new Map();let timerId=0,clipboard='',pagehide;
 class Worker{
  constructor(){workers.push(this);} postMessage(data){this.data=data;} terminate(){this.terminated=true;}
  finish(){this.onmessage?.({data:{result:scanner.scan(this.data.text,{mode:this.data.mode})}});}
 }
 const ctx={BeforeYouSendPowerup:powerup,document:{getElementById:id=>nodes[id],createElement:tag=>new Element(tag),createTextNode:text=>text},BeforeYouSendExamples:require('../extension/examples.js'),BeforeYouSendScanner:scanner,BeforeYouSendImporter:require('../extension/importer.js'),Worker,
  setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id),
  navigator:{clipboard:{writeText:async text=>{clipboard=text;}}},window:{addEventListener:(name,fn)=>{if(name==='pagehide')pagehide=fn;}}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'../extension/popup.js'),'utf8'),ctx);
 return {nodes,workers,timers,ctx,hide:()=>pagehide(),clipboard:()=>clipboard,click:id=>nodes[id].events.click(),input:text=>{nodes.draft.value=text;nodes.draft.events.input();}};
}
test('scan, selective redaction and copy use the current input',async()=>{
 const a=setup();a.input('password=DEMO_SECRET; alex@example.com');a.click('scan');a.workers[0].finish();
 assert.equal(a.nodes.results.hidden,false);assert.equal(a.nodes.redacted.value,'password=[REDACTED]; [REDACTED]');
 const boxes=a.nodes.findings.querySelectorAll('input');boxes[1].checked=false;boxes[1].events.change();
 assert.equal(a.nodes.redacted.value,'password=[REDACTED]; alex@example.com');await a.click('copy');assert.equal(a.clipboard(),a.nodes.redacted.value);
});
test('editing cancels the worker and rejects an already-captured stale callback',()=>{
 const a=setup();a.input('password=OLD');a.click('scan');const w=a.workers[0],late=w.onmessage;
 a.input('New draft');assert.equal(w.terminated,true);late({data:{result:scanner.scan('password=OLD')}});
 assert.equal(a.nodes.results.hidden,true);assert.equal(a.nodes.redacted.value,'');
});
test('timeout never becomes a no-findings success, and retry works',()=>{
 const a=setup();a.input('password=DEMO');a.click('scan');const late=a.workers[0].onmessage;
 [...a.timers.values()][0]();assert.match(a.nodes.status.textContent,/time limit/);assert.equal(a.nodes.results.hidden,true);
 late({data:{result:scanner.scan('password=DEMO')}});assert.equal(a.nodes.results.hidden,true);
 a.click('scan');a.workers[1].finish();assert.equal(a.nodes.results.hidden,false);
});
test('worker failure is explicit and clears busy state',()=>{
 const a=setup();a.input('password=DEMO');a.click('scan');a.workers[0].onerror();
 assert.match(a.nodes.status.textContent,/could not run/);assert.equal(a.nodes.scan.disabled,false);assert.equal(a.nodes.results.hidden,true);
});
test('profile changes invalidate results and use the selected profile',()=>{
 const a=setup();a.input('Host 192.168.1.10');a.click('scan');a.workers[0].finish();assert.match(a.nodes['result-title'].textContent,/1 item/);
 a.nodes.profile.value='balanced';a.nodes.profile.events.change();assert.equal(a.nodes.results.hidden,true);
 a.click('scan');a.workers[1].finish();assert.equal(a.nodes['result-title'].textContent,'No patterns found');
});
test('empty input and oversized input never launch a worker',()=>{
 const a=setup();a.click('scan');assert.equal(a.workers.length,0);a.input('a'.repeat(50001));a.click('scan');assert.equal(a.workers.length,0);assert.equal(a.nodes.scan.disabled,true);
});
test('select none disables copying; select all restores redaction',()=>{
 const a=setup();a.input('password=DEMO');a.click('scan');a.workers[0].finish();a.click('select-none');assert.equal(a.nodes.copy.disabled,true);
 a.click('select-all');assert.equal(a.nodes.copy.disabled,false);assert.equal(a.nodes.redacted.value,'password=[REDACTED]');
});
test('incomplete results cannot be copied',()=>{
 const a=setup();a.input(Array.from({length:201},(_,i)=>`x${i}@example.com`).join('\n'));a.click('scan');a.workers[0].finish();
 assert.equal(a.nodes.copy.disabled,true);assert.match(a.nodes['result-title'].textContent,/smaller sections/);
});
test('clipboard failure selects output for manual copying',async()=>{
 const a=setup();a.ctx.navigator.clipboard.writeText=async()=>{throw Error('Unavailable');};a.input('password=DEMO');a.click('scan');a.workers[0].finish();await a.click('copy');
 assert.equal(a.nodes.redacted.selected,true);assert.match(a.nodes['copy-status'].textContent,/manually/);
});
test('clear and pagehide remove rendered sensitive text and state',()=>{
 const a=setup();a.input('password=DEMO');a.click('scan');a.workers[0].finish();a.hide();
 assert.equal(a.nodes.draft.value,'');assert.equal(a.nodes.redacted.value,'');assert.equal(a.nodes.highlighted.children.length,0);assert.equal(a.nodes.findings.children.length,0);
});
test('selection API absence gives a paste fallback without destroying input',async()=>{
 const a=setup();a.input('Keep this draft');await a.click('capture');assert.match(a.nodes.status.textContent,/paste/i);assert.equal(a.nodes.draft.value,'Keep this draft');
});

test('file import loads content and clears old results',async()=>{
 const a=setup();a.input('password=OLD');a.click('scan');a.workers[0].finish();
 a.nodes['import-file'].files=[{name:'demo.txt',size:17,arrayBuffer:async()=>new TextEncoder().encode('password=NEW_DEMO').buffer}];
 await a.nodes['import-file'].events.change();assert.equal(a.nodes.draft.value,'password=NEW_DEMO');assert.equal(a.nodes.results.hidden,true);assert.match(a.nodes.status.textContent,/Imported demo.txt/);
});
test('late file read never overwrites newer edits',async()=>{
 const a=setup();let finish;a.nodes['import-file'].files=[{name:'demo.txt',size:10,arrayBuffer:()=>new Promise(r=>finish=r)}];
 const pending=a.nodes['import-file'].events.change();a.input('Newer draft');finish(new TextEncoder().encode('Old file').buffer);await pending;assert.equal(a.nodes.draft.value,'Newer draft');
});
test('unsupported file preserves draft and reports error',async()=>{
 const a=setup();a.input('Keep me');a.nodes['import-file'].files=[{name:'x.zip',size:10}];await a.nodes['import-file'].events.change();assert.equal(a.nodes.draft.value,'Keep me');assert.match(a.nodes.status.textContent,/Unsupported file/);assert.equal(a.nodes['import-file'].disabled,false);
});
test('Show in code opens the viewer and targets the chosen match without changing redaction',()=>{
 const a=setup();a.input('Intro\npassword=DEMO_ONE\npassword=DEMO_TWO');a.click('scan');a.workers[0].finish();
 const buttons=a.nodes.findings.querySelectorAll('button');const original=a.nodes.redacted.value;
 buttons[1].events.click();assert.equal(a.nodes['highlight-details'].open,true);
 const marks=a.nodes.highlighted.querySelectorAll('mark');assert.equal(marks[1].className,'active-match');assert.equal(marks[0].className,'');assert.equal(a.nodes.redacted.value,original);assert.match(a.nodes.status.textContent,/line 3/);
});
test('finding excerpt highlights exact value and keeps code context as text',()=>{
 const a=setup();a.input('const password = "DEMO_SECRET";');a.click('scan');a.workers[0].finish();
 const preview=a.nodes.findings.querySelectorAll('pre')[0];assert.equal(preview.querySelectorAll('mark')[0].textContent,'DEMO_SECRET');assert.equal(preview.children[0],'const password = "');assert.equal(preview.children[2],'";');
});
test('popup loads the chosen practice example instead of a fixed sample',()=>{const a=setup();a.nodes['example-choice'].value='example-100';a.nodes.sample.events.click();assert.equal(a.nodes.draft.value,require('../extension/examples.js').get('example-100').text);assert.equal(a.nodes.results.hidden,true);assert.match(a.nodes.status.textContent,/Complete practice review/);});
test('popup power-up reveals only current results and cancels on worker error',()=>{let finish,cancels=0;const a=setup({start(){},cancel(){cancels++;},finish(fn){finish=fn;}});a.input('password=DEMO');a.click('scan');a.workers[0].finish();assert.equal(a.nodes.results.hidden,true);finish();assert.equal(a.nodes.results.hidden,false);a.click('scan');const before=cancels;a.workers[1].onerror();assert.ok(cancels>before);assert.equal(a.nodes.results.hidden,true);assert.equal(a.nodes.scan.disabled,false);});
