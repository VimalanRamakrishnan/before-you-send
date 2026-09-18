'use strict';
importScripts('vendor/mammoth.js');
self.onmessage=async({data})=>{
  try{
    const result=await mammoth.extractRawText({arrayBuffer:data});
    if(result.messages.some(m=>m.type==='error'))throw Error('Word document could not be fully extracted. Save a fresh .docx copy.');
    if(result.value.length>50000)throw Error('Document contains more than 50,000 text units. Nothing was truncated; choose a smaller section.');
    if(!result.value.trim())throw Error('No readable Word text found. Images need OCR before importing.');
    self.postMessage({text:result.value});
  }catch(e){self.postMessage({error:e.message?.startsWith('Document contains')||e.message?.startsWith('No readable')?e.message:'Word document could not be read reliably. Save an unencrypted .docx copy and try again.'});}
};
