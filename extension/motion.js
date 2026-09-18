/* Decorative click feedback only. No input text is read or stored. */
'use strict';
function showPress(button,x,y){
 if(button.disabled||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 if(typeof button.animate!=='function')return;
 const box=button.getBoundingClientRect();
 const size=Math.max(box.width,box.height)*2;
 const ripple=document.createElement('span');ripple.className='click-ripple';ripple.setAttribute('aria-hidden','true');
 ripple.style.width=ripple.style.height=size+'px';ripple.style.left=(x-size/2)+'px';ripple.style.top=(y-size/2)+'px';button.append(ripple);
 const animation=ripple.animate([{transform:'scale(0)',opacity:.2},{transform:'scale(1)',opacity:0}],{duration:380,easing:'ease-out'});
 animation.finished.catch(()=>{}).finally(()=>ripple.remove());
}
document.addEventListener('pointerdown',event=>{if(event.button!==0)return;const button=event.target.closest?.('button');if(!button)return;const rect=button.getBoundingClientRect();showPress(button,event.clientX-rect.left,event.clientY-rect.top);});
document.addEventListener('click',event=>{if(event.detail!==0)return;const button=event.target.closest?.('button');if(button)showPress(button,button.clientWidth/2,button.clientHeight/2);});
