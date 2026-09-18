// Bundled parsers only. Extracted text is never interpreted as HTML.
const MAX_TEXT=50000;
const TIMEOUT=20000;
export function validateDocx(buffer){
  const b=new DataView(buffer),n=b.byteLength;
  if(n<22||b.getUint32(0,true)!==0x04034b50)throw Error('This is not a readable DOCX file. Save it as an unencrypted .docx file in Word.');
  let end=-1;
  for(let i=n-22;i>=Math.max(0,n-65557);i--)if(b.getUint32(i,true)===0x06054b50&&i+22+b.getUint16(i+20,true)===n){end=i;break;}
  if(end<0)throw Error('Damaged DOCX archive. Open and save it again in Word.');
  const count=b.getUint16(end+10,true),size=b.getUint32(end+12,true);let pos=b.getUint32(end+16,true),total=0,body=false;
  if(b.getUint16(end+4,true)||b.getUint16(end+6,true)||count>2000||pos+size>end)throw Error('This DOCX archive is too complex or unsupported.');
  const stop=pos+size;
  for(let i=0;i<count;i++){
    if(pos+46>stop||b.getUint32(pos,true)!==0x02014b50)throw Error('Damaged DOCX directory.');
    const flags=b.getUint16(pos+8,true),method=b.getUint16(pos+10,true),length=b.getUint16(pos+28,true);
    total+=b.getUint32(pos+24,true);
    if(flags&1||![0,8].includes(method))throw Error('Encrypted or unsupported DOCX. Save an unencrypted .docx copy first.');
    if(total>20000000)throw Error('DOCX expands beyond the 20 MB processing limit. Use a smaller document.');
    if(pos+46+length>stop)throw Error('Damaged DOCX filename.');
    const name=new TextDecoder().decode(new Uint8Array(buffer,pos+46,length));
    if(name==='word/document.xml')body=true;
    pos+=46+length+b.getUint16(pos+30,true)+b.getUint16(pos+32,true);
  }
  if(pos!==stop||!body)throw Error('This archive is not a supported Word DOCX document.');
}
export async function extractPdf(buffer,options={}){
  if(!new TextDecoder().decode(new Uint8Array(buffer,0,Math.min(1024,buffer.byteLength))).includes('%PDF-'))throw Error('This file is not a readable PDF.');
  const pdf=await import('./vendor/pdf.mjs');
  pdf.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdf.worker.mjs',import.meta.url).href;
  const task=pdf.getDocument({data:new Uint8Array(buffer),isEvalSupported:false,useWasm:false,useSystemFonts:false,disableFontFace:true,stopAtErrors:true,
    cMapUrl:new URL('./vendor/cmaps/',import.meta.url).href,cMapPacked:true,standardFontDataUrl:new URL('./vendor/standard_fonts/',import.meta.url).href});
  let timer;
  try{
    return await Promise.race([(async()=>{
      const doc=await task.promise;
      if(doc.numPages>100)throw Error('PDF exceeds 100 pages. Import a smaller section.');
      let text='';const pages=[];
      for(let i=1;i<=doc.numPages;i++){
        const page=await doc.getPage(i),content=await page.getTextContent();
        let pageText='';
        for(let j=0;j<content.items.length;j++){
          const item=content.items[j];if(typeof item.str!=='string')continue;
          pageText+=item.str;
          const next=content.items[j+1];
          if(item.hasEOL)pageText+='\n';
          else if(next?.transform&&item.transform){
            const vertical=Math.abs(next.transform[5]-item.transform[5]);
            const gap=next.transform[4]-(item.transform[4]+item.width);
            if(vertical>Math.max(2,item.height*.5))pageText+='\n';
            else if(gap>Math.max(1,item.height*.15))pageText+=' ';
          }
          if(pageText.length+text.length>MAX_TEXT)throw Error('Document contains more than 50,000 text units. Nothing was truncated; choose a smaller section.');
        }
        if(!pageText.trim())throw Error(`PDF page ${i} has no extractable text (possibly scanned or blank). No partial import was used. OCR or remove that page before importing.`);
        const start=text.length;
        text+=(i>1?'\n\n':'')+`[PDF page ${i}]\n`+pageText;
        pages.push({page:i,start,end:text.length});options.onProgress?.({stage:'Extracting PDF',current:i,total:doc.numPages});
        if(text.length>MAX_TEXT)throw Error('Document contains more than 50,000 text units. Nothing was truncated; choose a smaller section.');
        page.cleanup();
      }
      return options.detailed?{text,pages,pageCount:doc.numPages}:text;
    })(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('PDF extraction timed out. Use a smaller or simpler file.')),TIMEOUT);})]);
  }catch(e){
    if(e.name==='PasswordException')throw Error('Password-protected PDF. Export an unlocked copy first, then import it.');
    if(['InvalidPDFException','UnknownErrorException'].includes(e.name))throw Error('PDF could not be read reliably. Open it and export a fresh PDF or plain-text copy.');
    throw e;
  }finally{clearTimeout(timer);await task.destroy();}
}
export function extractDocx(buffer){
  validateDocx(buffer);
  return new Promise((resolve,reject)=>{
    const worker=new Worker(new URL('./document-worker.js',import.meta.url));
    let timer;const finish=(error,text)=>{clearTimeout(timer);worker.terminate();error?reject(Error(error)):resolve(text);};
    timer=setTimeout(()=>finish('Word extraction timed out. Use a smaller document.'),TIMEOUT);
    worker.onerror=()=>finish('Word extraction failed. Save a fresh .docx copy and try again.');
    worker.onmessage=({data})=>finish(data.error,data.text);
    worker.postMessage(buffer,[buffer]);
  });
}
export async function extract(buffer,kind,options={}){
 if(kind==='pdf')return extractPdf(buffer,options);
 options.onProgress?.({stage:'Extracting Word text'});
 const text=await extractDocx(buffer);return options.detailed?{text,pages:[],pageCount:null}:text;
}
