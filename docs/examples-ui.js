/* Choosing an example never replaces source text until Load example is clicked. */
(function(){
 'use strict';
 const category=document.getElementById('example-category'),choice=document.getElementById('example-choice'),note=document.getElementById('example-note');
 const {items,get}=BeforeYouSendExamples;
 for(const name of [...new Set(items.map(x=>x.category))]){const option=document.createElement('option');option.value=name;option.textContent=name;category.append(option);}
 function describe(){const example=get(choice.value);note.textContent=example.note;}
 function populate(){
  const previous=choice.value;choice.replaceChildren();
  const matches=items.filter(x=>category.value==='all'||x.category===category.value);
  for(const example of matches){const option=document.createElement('option');option.value=example.id;option.textContent=`${example.id.slice(-3)} · ${example.title}`;choice.append(option);}
  choice.value=matches.some(x=>x.id===previous)?previous:matches[0].id;describe();
 }
 category.addEventListener('change',populate);choice.addEventListener('change',describe);populate();
})();
