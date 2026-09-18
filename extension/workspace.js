'use strict';
const $=id=>document.getElementById(id), core=BeforeYouSendReview;
let text='',findings=[],decisions=new Map(),complete=false,revision=0,worker=null,timer=null;
let filename='message',starts=[0],page=0,active=-1;
const PAGE_LINES=250;
let importInfo=null,importing=false,importGeneration=0;
let replacements=new Map(),autoTimer=null,scanIsAutomatic=false,composing=false;
const history=[],revealed=new Set();
function masked(){return !!$('mask-previews').checked;}
function valuePreview(f,value){return masked()&&!revealed.has(f.id)?'[HIDDEN]':value;}
function remember(){history.push({decisions:new Map(decisions),replacements:new Map(replacements)});if(history.length>100)history.shift();}
function refreshReview(){renderCards();renderCode();renderComparison();}
function sourcePage(f){return importInfo?.kind==='pdf'?importInfo.pages.find(p=>p.start<=f.start&&f.start<p.end)?.page:null;}
function categoryGroup(f){const category=core.describe(f,text).category.toLowerCase();return f.rules.includes('custom-term')?'custom': category.includes('password')?'password':category.includes('key')?'key':/contact|financial|personal|identity/.test(category)?'personal':/token|credential|session|cookie|secret|verification/.test(category)?'credential':'other';}
function matchesFilter(f){
 const group=$('category-filter').value||'all',decision=$('decision-filter').value||'all',query=$('finding-search').value.trim().toLowerCase();
 const d=core.describe(f,text),search=[d.category,d.field,d.trigger,sourcePage(f)?'PDF page '+sourcePage(f):''].join(' ').toLowerCase();
 return (group==='all'||categoryGroup(f)===group)&&(decision==='all'||(decisions.get(f.id)||'pending')===decision)&&(!query||search.includes(query));
}
function clearImportInfo(){importInfo=null;$('extraction-summary').hidden=true;}
function showImportInfo(info){
 importInfo=info;$('extraction-summary').hidden=false;
 $('extraction-details').textContent=`${info.name} · ${info.size.toLocaleString()} bytes · ${info.units.toLocaleString()} extracted text units`+(info.kind==='pdf'?` · ${info.pageCount} of ${info.pageCount} pages processed`:info.kind==='docx'?' · Word body text (page count unavailable)':' · complete text file decoded');
 $('extraction-limits').textContent=info.kind==='text'?'Source is imported as text; code is not executed. Review this summary before scanning.': 'Text extraction only: images, attachments, comments, headers and other unextracted content are not checked. Compare with the original. Export makes a text copy, not a redacted document. Review this summary before scanning.';
}
async function importFile(file){
 if(importing){status('An import is already running. Wait for it to finish.',true);return;}
 invalidate();const request=revision,job=++importGeneration;importing=true;$('import-file').disabled=true;$('scan').disabled=true;
 $('import-meter').hidden=false;$('import-meter').removeAttribute('value');$('import-progress').textContent='Reading local file…';status('Reading the file locally…');
 try{
  const info=await BeforeYouSendImporter.readDetailed(file,{onProgress:progress=>{
   if(job!==importGeneration||request!==revision)return;
   $('import-progress').textContent=progress.total?`${progress.stage}: ${progress.current} of ${progress.total} pages`:progress.stage+'…';
   if(progress.total){$('import-meter').max=progress.total;$('import-meter').value=progress.current;}
  }});
  if(request!==revision){$('import-progress').textContent='Import discarded because the source or settings changed.';return;}
  $('draft').value=info.text;setFilename(file.name);invalidate();showImportInfo(info);
  $('import-progress').textContent='Import complete. Review the extraction summary, then check the text.';status('File loaded. Check text to begin your review.');
 }catch(e){if(request===revision){status(e.message||'The file could not be read.',true);$('import-progress').textContent='Import failed. Existing source text was preserved.';}}
 finally{importing=false;$('import-file').disabled=false;$('import-meter').hidden=true;$('scan').disabled=$('draft').value.length>50000;}
}

function status(message,error=false){$('status').textContent=message;$('status').className=error?'error':'';}
function cancel(){scanIsAutomatic=false;$('scan').removeAttribute('aria-busy');if(worker){worker.onmessage=null;worker.onerror=null;worker.terminate();}worker=null;clearTimeout(timer);timer=null;$('scan').disabled=$('draft').value.length>50000;$('scan').textContent='Check text ↗';}
function invalidate(){globalThis.BeforeYouSendPowerup?.cancel();clearTimeout(autoTimer);autoTimer=null;cancel();revision++;replacements.clear();resetChecklist();history.length=0;revealed.clear();$('undo-decision').disabled=true;text='';findings=[];decisions.clear();complete=false;page=0;active=-1;$('review').hidden=true;for(const id of ['findings','code','original-preview','redacted-preview','difference-preview'])$(id).replaceChildren();$('copy').disabled=true;$('download').disabled=true;$('export-status').textContent='';$('count').textContent=`${$('draft').value.length.toLocaleString()} / 50,000 text units`;status($('draft').value.length>50000?'Text exceeds the limit. Reduce it before scanning.':'Text stays in this tab only. Closing or reloading clears it.',$('draft').value.length>50000);}
function setFilename(value){filename=value;$('filename').textContent=value==='message'?'Pasted text':value;}
$('draft').addEventListener('input',()=>{clearImportInfo();invalidate();scheduleScan();});
$('draft').addEventListener('compositionstart',()=>{composing=true;clearTimeout(autoTimer);});
$('draft').addEventListener('compositionend',()=>{composing=false;scheduleScan();});
$('profile').addEventListener('change',()=>{invalidate();scheduleScan();});
$('clear').addEventListener('click',()=>{clearImportInfo();$('draft').value='';setFilename('message');invalidate();});
$('sample').addEventListener('click',()=>{const example=BeforeYouSendExamples.get($('example-choice').value);clearImportInfo();$('draft').value=example.text;setFilename(example.id+'.txt');invalidate();status(`Loaded fictional example: ${example.title}. Check text to review it.`);});
$('import-file').addEventListener('change',async()=>{const file=$('import-file').files?.[0];if(!file)return;$('import-file').value='';await importFile(file);});
for(const event of ['dragenter','dragover'])$('drop-zone').addEventListener(event,e=>{e.preventDefault();$('drop-zone').className='drop-zone dragging';});
$('drop-zone').addEventListener('dragleave',()=>{$('drop-zone').className='drop-zone';});
$('drop-zone').addEventListener('drop',async e=>{e.preventDefault();$('drop-zone').className='drop-zone';const files=e.dataTransfer?.files;if(files?.length!==1){status('Drop exactly one file at a time.',true);return;}await importFile(files[0]);});
window.addEventListener('dragover',e=>e.preventDefault());
window.addEventListener('drop',e=>e.preventDefault());
for(const id of ['finding-search','category-filter','decision-filter'])$(id).addEventListener(id==='finding-search'?'input':'change',()=>{if(text)renderCards();});
$('undo-decision').addEventListener('click',()=>{if(!history.length)return;const previous=history.pop();decisions=previous.decisions;replacements=previous.replacements;revision++;resetChecklist();refreshReview();});
$('mask-previews').addEventListener('change',()=>{revealed.clear();$('draft').hidden=masked();$('masked-editor').hidden=!masked();$('custom-rules').hidden=masked();$('masked-rules').hidden=!masked();if(text)refreshReview();});

function choose(id,value){if(!findings.some(f=>f.id===id)||!['redact','keep','pending'].includes(value))throw Error('Invalid review decision');if((decisions.get(id)||'pending')===value)return;remember();if(value==='pending')decisions.delete(id);else decisions.set(id,value);revision++;resetChecklist();refreshReview();}
function navigateTo(id){const f=findings.find(f=>f.id===id);if(!f)return;active=id;page=Math.floor(core.lineAt(starts,f.start)/PAGE_LINES);renderCards();renderCode();const target=$('code').querySelector('.target-mark');if(target){target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'center',inline:'nearest'});}}
function renderCode(){
 const viewer=$('code');viewer.replaceChildren();const first=page*PAGE_LINES,last=Math.min(first+PAGE_LINES,starts.length);let fi=0;
 while(fi<findings.length&&findings[fi].end<=starts[first])fi++;
 for(let n=first;n<last;n++){
  const start=starts[n],rawEnd=n+1<starts.length?starts[n+1]-1:text.length;
  const end=rawEnd>start&&text[rawEnd-1]==='\r'?rawEnd-1:rawEnd;
  const row=document.createElement('div');row.className='code-line';
  const number=document.createElement('span');number.className='line-no';number.textContent=String(n+1);number.setAttribute('aria-hidden','true');
  const code=document.createElement('span');code.className='line-text';let cursor=start;
  while(fi<findings.length&&findings[fi].end<=start)fi++;
  for(let j=fi;j<findings.length&&findings[j].start<end;j++){
   const f=findings[j],a=Math.max(start,f.start),b=Math.min(end,f.end);if(b<=a)continue;
   code.append(document.createTextNode(text.slice(cursor,a)));const mark=document.createElement('mark');mark.textContent=valuePreview(f,text.slice(a,b));mark.className=(decisions.get(f.id)==='keep'?'kept ':'')+(f.id===active?'target-mark':'');mark.title=`Finding ${f.id+1}: ${core.describe(f,text).category}`;code.append(mark);cursor=b;
   if(f.id===active)row.className='code-line target-line';
  }
  code.append(document.createTextNode(text.slice(cursor,end)|| (cursor===start?' ':'')));row.append(number,code);viewer.append(row);
 }
 $('line-window').textContent=`Lines ${first+1}–${last} of ${starts.length}`;$('previous-lines').disabled=page===0;$('next-lines').disabled=last>=starts.length;
}
function renderCards(){
 const list=$('findings');list.replaceChildren();const visible=findings.filter(matchesFilter);$('filter-count').textContent=`Showing ${visible.length} of ${findings.length} findings. Filters do not change export decisions.`;if(!findings.length){const p=document.createElement('p');p.textContent='No supported patterns found. Review the source for anything the scanner does not recognise.';p.className='quiet';list.append(p);return;}
 if(!visible.length){const p=document.createElement('p');p.className='quiet';p.textContent='No findings match these filters. Clear the search or change the filters.';list.append(p);}
 for(const f of visible){
  const description=core.describe(f,text),line=core.lineAt(starts,f.start),column=Array.from(text.slice(starts[line],f.start)).length+1;
  const card=document.createElement('article');card.className='finding'+(active===f.id?' active':'');
  const heading=document.createElement('h3');const titleJump=document.createElement('button');titleJump.type='button';titleJump.className='finding-title';titleJump.textContent=`${f.id+1}. ${description.category}`;titleJump.addEventListener('click',()=>navigateTo(f.id));heading.append(titleJump);
  const state=document.createElement('span');state.className='finding-state';state.textContent=decisions.get(f.id)==='redact'?'Redact':decisions.get(f.id)==='keep'?'Keep intentionally':'Needs review';heading.append(state);
  const location=document.createElement('p');location.className='location';location.textContent=(sourcePage(f)?`PDF page ${sourcePage(f)} · `:'')+`Line ${line+1}, column ${column}${description.field?' · Field: '+description.field:''}`;
  const snippet=document.createElement('code');const raw=text.slice(f.start,f.end);const highlight=document.createElement('mark');highlight.textContent=valuePreview(f,raw.length>180?raw.slice(0,180)+'…':raw);snippet.append(highlight);
  const trigger=document.createElement('p');trigger.textContent='Why it was flagged: '+description.trigger;
  const exposure=document.createElement('p');exposure.textContent='Possible exposure: '+description.exposure;
  const evidence=document.createElement('p');evidence.className='location';evidence.textContent=description.evidence;
  const action=document.createElement('p');action.textContent='What to check: '+description.action;
  const overlap=document.createElement('p');overlap.className='location';overlap.textContent=f.rules.length>1?`${f.rules.length} overlapping checks combined. The complete span is reviewed together.`:'Pattern match only; validity is not verified.';
  const actions=document.createElement('div');actions.className='finding-actions';
  const jump=document.createElement('button');jump.type='button';jump.textContent='Show in source';jump.setAttribute('aria-label',`Show finding ${f.id+1} in code`);jump.addEventListener('click',()=>navigateTo(f.id));actions.append(jump);
  if(masked()){const reveal=document.createElement('button');reveal.type='button';reveal.textContent=revealed.has(f.id)?'Hide value':'Reveal value';reveal.setAttribute('aria-label',`Toggle visibility of finding ${f.id+1}`);reveal.setAttribute('aria-pressed',String(revealed.has(f.id)));reveal.addEventListener('click',()=>{revealed.has(f.id)?revealed.delete(f.id):revealed.add(f.id);refreshReview();});actions.append(reveal);}
  for(const [value,label] of [['redact','Redact'],['keep','Keep intentionally'],['pending','Reset to Pending']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-label',`${label} finding ${f.id+1}`);b.setAttribute('aria-pressed',String((decisions.get(f.id)||'pending')===value));b.addEventListener('click',()=>{choose(f.id,value);const replacement=$('findings').querySelector(`[aria-label="${label} finding ${f.id+1}"]`);replacement?.focus({preventScroll:true});});actions.append(b);}
  card.append(heading,location,snippet,trigger,exposure,action,evidence,overlap,actions,replacementEditor(f));list.append(card);
 }
}
function replacementFor(f){return core.replacement(f,text,$('replacement-style').value,replacements);}
function output(){return core.sharingCopy(text,findings,decisions,$('replacement-style').value,replacements);}
function renderComparison(){
 $('undo-decision').disabled=history.length===0;renderDifference();
 const counts=core.summary(findings,decisions);$('review-count').textContent=`${counts.pending} remaining · ${counts.redact} redact · ${counts.keep} keep`;
 $('compare-summary').textContent=counts.pending?'Preview includes pending redactions':counts.redact?`${counts.redact} spans replaced`:'No replacements; original content retained';
 $('original-preview').replaceChildren();let cursor=0;for(const f of findings){$('original-preview').append(document.createTextNode(text.slice(cursor,f.start)));const mark=document.createElement('mark');mark.textContent=valuePreview(f,text.slice(f.start,f.end));mark.className=decisions.get(f.id)==='keep'?'kept':'';$('original-preview').append(mark);cursor=f.end;}$('original-preview').append(document.createTextNode(text.slice(cursor)));
 let preview='',pos=0;for(const f of findings){preview+=text.slice(pos,f.start)+(decisions.get(f.id)==='keep'?valuePreview(f,text.slice(f.start,f.end)):replacementFor(f));pos=f.end;}preview+=text.slice(pos);$('redacted-preview').textContent=preview;const ready=core.canExport(findings,decisions,complete)&&text===$('draft').value;
 $('copy').disabled=!ready;$('download').disabled=!ready;$('export-status').textContent=!complete?'Incomplete check: export disabled.':counts.pending?'Finish every decision to enable export.':counts.keep?'Your copy includes details you chose to keep. Review before sharing.':'Review the full copy before sharing.';
}
$('previous-lines').addEventListener('click',()=>{if(page>0){page--;renderCode();$('code').scrollTop=0;}});
$('next-lines').addEventListener('click',()=>{if((page+1)*PAGE_LINES<starts.length){page++;renderCode();$('code').scrollTop=0;}});
$('redact-all').addEventListener('click',()=>{if(!findings.some(f=>decisions.get(f.id)!=='redact'))return;remember();for(const f of findings)decisions.set(f.id,'redact');revision++;resetChecklist();renderCards();renderCode();renderComparison();});
function runScan(automatic=false){
 if(importing){status('Wait for the import to finish.',true);return;}if(!$('draft').value.trim()){status('Import or paste some text first.',true);return;}invalidate();if($('draft').value.length>50000)return;
 try{BeforeYouSendCustom.parse($('custom-rules').value);}catch(error){status(error.message,true);return;}
 scanIsAutomatic=automatic;
 const request=revision,snapshot=$('draft').value;status('Checking locally…');$('scan').setAttribute('aria-busy','true');$('scan').disabled=true;$('scan').textContent='Checking…';
 const fail=message=>{if(request!==revision)return;globalThis.BeforeYouSendPowerup?.cancel();cancel();revision++;status(message,true);};
 if(!automatic)globalThis.BeforeYouSendPowerup?.start();
 try{worker=new Worker('worker.js');worker.onmessage=({data})=>{if(request!==revision)return;cancel();revision++;if(data.error||!data.result){globalThis.BeforeYouSendPowerup?.cancel();status(data.error||'Invalid result.',true);return;}const delivered=revision;const showResults=()=>{if(delivered!==revision)return;cancel();text=snapshot;findings=data.result.findings;complete=!data.result.limited;starts=core.lineStarts(text);page=0;active=-1;$('review').hidden=false;$('review-title').textContent=complete?`${findings.length} findings to review`:'Incomplete check — use smaller sections';$('coverage').textContent=`${data.result.ruleCount} rule families · ${data.result.mode} profile · ${data.result.customRuleCount||0} custom terms. No matches is not a guarantee of safety.`;renderCode();renderCards();renderComparison();status('Check finished. Review the evidence and make your decisions.');if(!automatic){$('review-title').tabIndex=-1;$('review-title').focus({preventScroll:true});$('review').scrollIntoView({block:'start'});}};if(automatic||data.result.limited){globalThis.BeforeYouSendPowerup?.cancel();showResults();}else if(globalThis.BeforeYouSendPowerup){$('scan').disabled=true;status('Check complete. Preparing the review…');globalThis.BeforeYouSendPowerup.finish(showResults);}else showResults();};worker.onerror=()=>fail('The local scanner could not run. Reload the extension and try again.');timer=setTimeout(()=>fail('The check timed out. Try a smaller section; no complete result is available.'),3000);worker.postMessage({text:snapshot,mode:$('profile').value,customRules:$('custom-rules').value,caseSensitive:!!$('custom-case').checked});}catch{fail('The scanner cannot start in this context. Use the installed extension.');}
}
$('scan').addEventListener('click',()=>runScan(false));
function ready(){return complete&&text===$('draft').value&&core.canExport(findings,decisions,complete);}
$('copy').addEventListener('click',async()=>{if(!ready())return;const request=revision;try{await navigator.clipboard.writeText(output());if(request===revision)$('export-status').textContent='Reviewed copy copied to the system clipboard.';}catch{if(request===revision)$('export-status').textContent='Clipboard unavailable. Select and copy the sharing preview manually.';}});
$('download').addEventListener('click',()=>{if(!ready())return;const blob=new Blob([output()],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=core.exportName(filename);document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);$('export-status').textContent='Download requested: '+core.exportName(filename)+'. Check your browser downloads.';});
window.addEventListener('pagehide',()=>{clearImportInfo();importGeneration++;$('custom-rules').value='';$('auto-scan').checked=false;$('draft').value='';setFilename('message');invalidate();});

function updateChecklist(){const total=['check-context','check-document','check-copy'].filter(id=>$(id).checked).length;$('checklist-status').textContent=`${total} of 3 reminders checked. This checklist is not a safety guarantee and does not block export.`;}
function resetChecklist(){for(const id of ['check-context','check-document','check-copy'])$(id).checked=false;updateChecklist();}
for(const id of ['check-context','check-document','check-copy'])$(id).addEventListener('change',updateChecklist);
function scheduleScan(){clearTimeout(autoTimer);autoTimer=null;if(!$('auto-scan').checked||composing||importing||!$('draft').value.trim()||$('draft').value.length>50000)return;autoTimer=setTimeout(()=>{autoTimer=null;if($('auto-scan').checked&&!composing&&!importing)runScan(true);},800);}
$('auto-scan').addEventListener('change',()=>{if(!$('auto-scan').checked){clearTimeout(autoTimer);autoTimer=null;if(scanIsAutomatic)invalidate();}else if(!complete||text!==$('draft').value)scheduleScan();});
function changeRules(){invalidate();try{const terms=BeforeYouSendCustom.parse($('custom-rules').value);$('custom-status').textContent=`${terms.length} custom terms ready. Literal substrings only; stored in this tab until it closes.`;scheduleScan();}catch(error){$('custom-status').textContent=error.message;}}
$('custom-rules').addEventListener('input',changeRules);$('custom-case').addEventListener('change',changeRules);
$('replacement-style').addEventListener('change',()=>{revision++;resetChecklist();if(text)refreshReview();});
function replacementEditor(f){
 const section=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Replacement text';section.className='replacement-editor';section.append(summary);
 const description=document.createElement('p');description.textContent='Used for Redact; ignored for Keep. Default: '+core.replacement(f,text,$('replacement-style').value);section.append(description);
 const input=document.createElement('input');input.type='text';input.maxLength=100;input.value=replacements.get(f.id)||'';input.placeholder='e.g. [PROJECT REMOVED]';input.setAttribute('aria-label',`Custom replacement for finding ${f.id+1}`);
 const apply=document.createElement('button');apply.type='button';apply.textContent='Use custom';apply.setAttribute('aria-label',`Apply replacement for finding ${f.id+1}`);apply.addEventListener('click',()=>{try{const value=core.validateReplacement(input.value);if(replacements.get(f.id)===value)return;remember();replacements.set(f.id,value);revision++;resetChecklist();refreshReview();status('Custom replacement applied. Review the sharing copy.');}catch(error){status(error.message,true);input.focus();}});
 const reset=document.createElement('button');reset.type='button';reset.textContent='Use default';reset.disabled=!replacements.has(f.id);reset.setAttribute('aria-label',`Reset replacement for finding ${f.id+1}`);reset.addEventListener('click',()=>{if(!replacements.has(f.id))return;remember();replacements.delete(f.id);revision++;resetChecklist();refreshReview();});section.append(input,apply,reset);return section;
}
function renderDifference(){
 const view=$('difference-preview');view.replaceChildren();let cursor=0;
 for(const f of findings){view.append(document.createTextNode(text.slice(cursor,f.start)));if(decisions.get(f.id)==='keep')view.append(document.createTextNode(valuePreview(f,text.slice(f.start,f.end))));else{
  const removed=document.createElement('del'),added=document.createElement('ins');removed.textContent='[Removed: '+valuePreview(f,text.slice(f.start,f.end))+']';added.textContent='[Inserted: '+replacementFor(f)+']';view.append(removed,added);
 }cursor=f.end;}view.append(document.createTextNode(text.slice(cursor)));
}

invalidate();
