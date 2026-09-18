'use strict';
const tourElement=id=>document.getElementById(id);
const tourText='// Fictional training example\npassword="FAKE_TOUR_PASSWORD"\nContact: tour@example.com';
let tourStep=0,tourFindings=[],tourDecisions=new Map();
const tourTitles=['Learn with a fictional example','Check the loaded text','Decide what belongs in your copy','Compare and export'];
const tourDescriptions=['This separate practice page does not change your existing workspace. Nothing is uploaded.','In the workspace you can paste text, choose a file, or drop one into the import area. This demo uses built-in text. Click Check demo text.','Review each finding. Redact replaces its value; Keep intentionally retains it. Try both choices and make a decision for every finding.','Compare the original with the sharing copy below. Check for details the scanner missed, then download the fictional copy to practise exporting.'];
function tourOutput(){return BeforeYouSendReview.sharingCopy(tourText,tourFindings,tourDecisions,'generic',new Map());}
function renderTour(){
 tourElement('tour-step').textContent=`Step ${tourStep+1} of 4`;
 tourElement('tour-title').textContent=tourTitles[tourStep];tourElement('tour-description').textContent=tourDescriptions[tourStep];
 tourElement('tour-source').hidden=tourStep===0;tourElement('tour-source').textContent=tourText;
 tourElement('tour-findings').hidden=tourStep!==2;tourElement('tour-findings').replaceChildren();
 tourElement('tour-output').hidden=tourStep!==3;tourElement('tour-output').textContent=tourStep===3?tourOutput():'';
 tourElement('tour-next').hidden=tourStep===3;tourElement('tour-download').hidden=tourStep!==3;
 tourElement('tour-next').textContent=['Load fictional example','Check demo text','Compare sharing copy','Finished'][tourStep];
 const remaining=tourFindings.filter(f=>!tourDecisions.has(f.id)).length;
 tourElement('tour-next').disabled=tourStep===2&&remaining>0;
 tourElement('tour-message').textContent=tourStep===0?'All values are invented.':tourStep===1?'Text loaded. It has not been checked yet.':tourStep===2?`${remaining} findings still need a decision.`:'Practice complete. Your real workspace has not been changed.';
 if(tourStep===2)for(const finding of tourFindings){
  const card=document.createElement('article');card.className='finding';const title=document.createElement('h3');title.textContent=BeforeYouSendReview.describe(finding,tourText).category;
  const value=document.createElement('code');value.textContent=tourText.slice(finding.start,finding.end);const actions=document.createElement('div');actions.className='finding-actions';
  for(const [decision,label] of [['redact','Redact'],['keep','Keep intentionally']]){const button=document.createElement('button');button.type='button';button.textContent=label;button.setAttribute('aria-label',`${label} demo finding ${finding.id+1}`);button.setAttribute('aria-pressed',String(tourDecisions.get(finding.id)===decision));button.addEventListener('click',()=>{tourDecisions.set(finding.id,decision);renderTour();});actions.append(button);}
  card.append(title,value,actions);tourElement('tour-findings').append(card);
 }
}
tourElement('tour-next').addEventListener('click',()=>{if(tourStep===2&&tourFindings.some(f=>!tourDecisions.has(f.id)))return;if(tourStep===1)tourFindings=BeforeYouSendScanner.scan(tourText,{mode:'balanced'}).findings;if(tourStep<3)tourStep++;renderTour();tourElement('tour-title').focus();});
tourElement('tour-restart').addEventListener('click',()=>{tourStep=0;tourFindings=[];tourDecisions.clear();renderTour();tourElement('tour-title').focus();});
tourElement('tour-download').addEventListener('click',()=>{if(tourStep!==3||tourFindings.some(f=>!tourDecisions.has(f.id)))return;const url=URL.createObjectURL(new Blob([tourOutput()],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='fictional-tour.redacted.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);tourElement('tour-message').textContent='Practice download requested. Check your browser downloads.';});
renderTour();
