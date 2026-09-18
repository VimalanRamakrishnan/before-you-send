/* Local text-file decoding. Nothing is executed or uploaded. */
(function(root){
  'use strict';
  const MAX_BYTES=200000, MAX_DOCUMENT_BYTES=5000000, MAX_TEXT=50000;
  const kind=file=>file.name.toLowerCase().split('.').pop();
  const extensions=new Set(['ino','pde','s','asm','bat','r','kt','swift','vue','svelte','dockerfile','txt','csv','tsv','json','jsonl','md','log','yaml','yml','xml','html','htm','css','js','mjs','cjs','jsx','ts','tsx','py','java','c','h','cpp','hpp','cs','go','rs','rb','php','sql','sh','ps1','ini','conf','config','toml','properties','env']);
  function validateFile(file){
    if(!file||typeof file.name!=='string'||!Number.isFinite(file.size))throw new Error('Choose a local text file.');
    const name=file.name.toLowerCase();
    if(name.endsWith('.doc'))throw new Error('Older .doc files need conversion. Open in Word or LibreOffice, save as .docx, then import that copy.');
    if(!['pdf','docx'].includes(kind(file))&&!extensions.has(name.split('.').pop())&&!/^\.env(?:\.[a-z0-9_-]+)*$/.test(name))throw new Error('Unsupported file. Choose text/code (including .ino), PDF or Word .docx. Images and archives require conversion to text.');
    const limit=['pdf','docx'].includes(kind(file))?MAX_DOCUMENT_BYTES:MAX_BYTES;
    if(file.size>limit)throw new Error(`File exceeds ${limit===MAX_BYTES?'200 KB':'5 MB'}. Import a smaller section.`);
    if(file.size===0)throw new Error('This file is empty.');
  }
  function decode(buffer){
    if(!(buffer instanceof ArrayBuffer))throw new Error('The file could not be read.');
    if(buffer.byteLength>MAX_BYTES)throw new Error('File exceeds 200 KB.');
    const bytes=new Uint8Array(buffer);let encoding='utf-8';
    if(bytes[0]===0xff&&bytes[1]===0xfe)encoding='utf-16le';
    if(bytes[0]===0xfe&&bytes[1]===0xff)encoding='utf-16be';
    let text;
    try{text=new TextDecoder(encoding,{fatal:true}).decode(bytes);}catch{throw new Error('Unsupported text encoding. Save the file as UTF-8 and try again.');}
    if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text))throw new Error('This appears to contain binary or unsupported control data. Import a plain-text file.');
    if(text.length>MAX_TEXT)throw new Error('File contains more than 50,000 text units. Nothing was truncated; choose a smaller section.');
    if(!text.trim())throw new Error('This file contains no text to check.');
    return text;
  }
  async function readDetailed(file,options={}){
    validateFile(file);
    options.onProgress?.({stage:'Reading local file'});
    const buffer=await file.arrayBuffer();
    if(['pdf','docx'].includes(kind(file))){
      if(!(buffer instanceof ArrayBuffer)||buffer.byteLength>MAX_DOCUMENT_BYTES)throw new Error('Document exceeds 5 MB or could not be read.');
      const extractor=await import('./document-extract.mjs');
      const result=await extractor.extract(buffer,kind(file),{...options,detailed:true});
      const text=result.text;
      if(text.length>MAX_TEXT)throw new Error('Document contains more than 50,000 text units. Nothing was truncated; choose a smaller section.');
      if(!text.trim())throw new Error('No readable text found. Scanned documents need OCR first.');
      return {...result,kind:kind(file),name:file.name,size:file.size,units:text.length};
    }
    const text=decode(buffer);return {text,kind:'text',name:file.name,size:file.size,units:text.length,pages:[],pageCount:null};
  }
  async function read(file){return (await readDetailed(file)).text;}
  const api={read,readDetailed,decode,validateFile,MAX_BYTES,MAX_DOCUMENT_BYTES};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BeforeYouSendImporter=api;
})(typeof globalThis!=='undefined'?globalThis:this);
