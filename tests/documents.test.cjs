const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const importer=require('../extension/importer.js');
const buffer=name=>{const b=fs.readFileSync(path.join(__dirname,'fixtures',name));return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);};
// PDF.js references browser geometry even for text-only extraction.
let canvas;try{canvas=require('@napi-rs/canvas');}catch(error){if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw error;canvas=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'));}
const {DOMMatrix,ImageData,Path2D}=canvas;
Object.assign(globalThis,{DOMMatrix,ImageData,Path2D});
const modulePromise=import('../extension/document-extract.mjs');
test('real PDF text is extracted and scanned',async()=>{const {extractPdf}=await modulePromise;const s=await extractPdf(buffer('text.pdf'));assert.match(s,/password=FAKE_TEST_ONLY_123/);assert.ok(require('../extension/scanner.js').scan(s).findings.length);});
test('blank and mixed PDFs fail rather than silently importing partial text',async()=>{const {extractPdf}=await modulePromise;for(const name of ['blank.pdf','mixed.pdf'])await assert.rejects(extractPdf(buffer(name)),/No partial import/);});
test('fake PDF extension rejected',async()=>{const {extractPdf}=await modulePromise;await assert.rejects(extractPdf(new TextEncoder().encode('not pdf').buffer),/not a readable PDF/);});
test('DOCX directory validated; corrupt ZIP rejected',async()=>{const {validateDocx}=await modulePromise;validateDocx(buffer('text.docx'));assert.throws(()=>validateDocx(new ArrayBuffer(30)),/not a readable DOCX/);});
test('real bundled Word worker extracts paragraphs and table text without rendering HTML',async()=>{
 const context={Uint8Array,ArrayBuffer,TextDecoder,TextEncoder,Promise,setTimeout,clearTimeout,console};context.self=context;
 vm.createContext(context);context.importScripts=()=>vm.runInContext(fs.readFileSync(path.join(__dirname,'../extension/vendor/mammoth.js'),'utf8'),context);
 const result=new Promise(resolve=>context.postMessage=resolve);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../extension/document-worker.js'),'utf8'),context);
 await context.onmessage({data:buffer('text.docx')});const data=await result;assert.equal(data.error,undefined);assert.match(data.text,/password=FAKE_WORD_ONLY_456/);assert.match(data.text,/api_key=FAKE_TABLE_KEY/);
});
test('documents have separate size limit and legacy DOC gives conversion guidance',()=>{importer.validateFile({name:'x.pdf',size:300000});assert.throws(()=>importer.validateFile({name:'x.docx',size:5000001}),/5 MB/);assert.throws(()=>importer.validateFile({name:'x.doc',size:100}),/save as .docx/);});
test('PDF detailed extraction returns page offsets and real progress separately from content',async()=>{const {extractPdf}=await modulePromise;const progress=[];const result=await extractPdf(buffer('text.pdf'),{detailed:true,onProgress:p=>progress.push(p)});assert.equal(result.pageCount,1);assert.deepEqual(result.pages,[{page:1,start:0,end:result.text.length}]);assert.equal(progress[0].current,1);assert.equal(progress[0].total,1);assert.match(result.text,/FAKE_TEST_ONLY_123/);});
test('text detailed import reports actual size and units without inventing document pages',async()=>{const text='password=FAKE_ARDUINO_123';const bytes=new TextEncoder().encode(text);const result=await importer.readDetailed({name:'example.ino',size:bytes.length,arrayBuffer:async()=>bytes.buffer});assert.equal(result.text,text);assert.equal(result.units,text.length);assert.equal(result.pageCount,null);assert.equal(result.kind,'text');assert.equal(result.size,bytes.length);});
