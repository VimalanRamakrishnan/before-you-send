/* Decorative manual-scan feedback. Owns no source text or detection decisions. */
(function(root){'use strict';
 const scene=document.getElementById('powerup-scene'),caption=document.getElementById('powerup-caption');
 const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
 let approachTimer=null,finishTimer=null,active=false,arrived=false,pending=null;
 function cancel(){clearTimeout(approachTimer);clearTimeout(finishTimer);approachTimer=finishTimer=null;pending=null;active=arrived=false;scene.hidden=true;scene.className='powerup-toast';}
 function transform(){if(!active||!pending)return;scene.className='powerup-toast is-running is-powered';caption.textContent='Power-up! Check complete — review findings.';finishTimer=setTimeout(()=>{const callback=pending;cancel();callback?.();},760);}
 function start(){cancel();if(preference.matches)return;active=true;scene.hidden=false;void scene.offsetWidth;scene.className='powerup-toast is-running';caption.textContent='Checking text locally…';approachTimer=setTimeout(()=>{approachTimer=null;arrived=true;transform();},650);}
 function finish(callback){if(!active||preference.matches){cancel();callback();return;}pending=callback;if(arrived)transform();}
 preference.addEventListener?.('change',()=>{if(preference.matches){const callback=pending;cancel();callback?.();}});
 window.addEventListener('pagehide',cancel);
 root.BeforeYouSendPowerup={start,finish,cancel};
})(globalThis);
