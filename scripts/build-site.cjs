'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs'),source=path.join(root,'extension');
fs.mkdirSync(out,{recursive:true});
const excluded=new Set(['manifest.json','popup.html','popup.js','popup.css']);
for(const name of fs.readdirSync(source)){
 if(excluded.has(name))continue;
 fs.cpSync(path.join(source,name),path.join(out,name),{recursive:true});
}
for(const name of fs.readdirSync(out).filter(n=>n.endsWith('.html'))){
 const p=path.join(out,name);let html=fs.readFileSync(p,'utf8').replaceAll('href="workspace.html"','href="index.html"');
 if(name==='workspace.html'){
  html=html.replace('<title>','<meta name="description" content="Review text and documents for possible secrets and personal information, locally in your browser."><title>');
  html=html.replace('</footer>','<a href="privacy.html">Privacy and limitations</a></footer>');
 }
 fs.writeFileSync(p,html);
}
fs.renameSync(path.join(out,'workspace.html'),path.join(out,'index.html'));
const script=path.join(out,'workspace.js');
fs.writeFileSync(script,fs.readFileSync(script,'utf8').replace('Reload the extension and try again.','Reload this page and try again.').replace('Use the installed extension.','Open this site over HTTPS or a local HTTP server; do not open the HTML file directly.'));
fs.copyFileSync(path.join(root,'site-pages/privacy.html'),path.join(out,'privacy.html'));
fs.writeFileSync(path.join(out,'.nojekyll'),'');
console.log('Website ready in docs/');
