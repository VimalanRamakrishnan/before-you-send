'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const importer=require('../extension/importer.js');
const bytes=s=>new TextEncoder().encode(s).buffer;
for(const name of ['notes.txt','settings.JSON','sample.csv','script.py','sketch.ino','sketch.INO','.env','.env.local'])test(`accepts ${name}`,async()=>{
 const text='password=DEMO_ONLY';assert.equal(await importer.read({name,size:18,arrayBuffer:async()=>bytes(text)}),text);
});
test('unsupported extensions rejected before read',async()=>{
 let read=false;await assert.rejects(importer.read({name:'archive.zip',size:100,arrayBuffer:async()=>{read=true;}}),/Unsupported file/);assert.equal(read,false);
});
test('oversized file rejected before read',async()=>{
 let read=false;await assert.rejects(importer.read({name:'large.txt',size:200001,arrayBuffer:async()=>{read=true;}}),/200 KB/);assert.equal(read,false);
});
test('UTF-8 BOM is decoded',()=>assert.equal(importer.decode(new Uint8Array([239,187,191,65]).buffer),'A'));
test('UTF-16 BOM is decoded in either byte order',()=>{
 assert.equal(importer.decode(new Uint8Array([255,254,65,0]).buffer),'A');assert.equal(importer.decode(new Uint8Array([254,255,0,65]).buffer),'A');
});
test('binary and invalid UTF-8 are rejected',()=>{
 assert.throws(()=>importer.decode(new Uint8Array([65,0,66]).buffer),/binary/);
 assert.throws(()=>importer.decode(new Uint8Array([255,128]).buffer),/encoding/);
});
test('decoded text is bounded without truncation',()=>assert.throws(()=>importer.decode(bytes('x'.repeat(50001))),/Nothing was truncated/));
test('blank files rejected',()=>assert.throws(()=>importer.decode(bytes(' \n\t')),/no text/));
test('read failures propagate',async()=>assert.rejects(importer.read({name:'x.txt',size:10,arrayBuffer:async()=>{throw Error('Read failed');}}),/Read failed/));
test('code and HTML are returned as text, not executed',()=>assert.equal(importer.decode(bytes('<script>throw 1</script>')),'<script>throw 1</script>'));
