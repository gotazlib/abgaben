const {chromium}=require('playwright');
const APP='file://'+process.env.APP+'/index.html';
exports.start=async(opts={})=>{const b=await chromium.launch({executablePath:process.env.HOME+'/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome',args:['--lang=de-CH']});
 const c=await b.newContext({viewport:opts.vp||{width:1366,height:900},locale:'de-CH',timezoneId:'Europe/Zurich'});
 const p=await c.newPage(); if(opts.clock!==false) await p.clock.install({time:new Date(process.env.UHR||'2026-10-26T08:00:00+01:00')}); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.accept());
 await p.goto(APP); await p.waitForTimeout(300); return {b,c,p,errs};};
exports.login=async(p,login)=>{ await p.evaluate(()=>{const d=document.getElementById('dlg'); if(d.open) d.close();}); await p.evaluate(()=>sessionStorage.removeItem('arenaone-session'));
 await p.goto(APP+'#/login'); await p.reload(); await p.waitForTimeout(300);
 await p.click(`[data-fill="${login}"]`); await p.click('#lf button.primary'); await p.waitForTimeout(200);
 const sms=await p.$('#smscode'); if(sms && await sms.isVisible()){const t=await sms.textContent(); await p.fill('#lf [name=code]', t.match(/\d{6}/)[0]); await p.click('#lf button.primary');}
 await p.waitForTimeout(300);};
exports.go=async(p,r)=>{await p.evaluate(()=>{const d=document.getElementById('dlg'); if(d.open) d.close();});await p.goto(APP+'#/'+r); await p.waitForTimeout(300);};
exports.dump=async(p)=>console.log((await p.evaluate(()=>{const m=document.querySelector('dialog[open]')||document.querySelector('main');return m.innerText+'\n--BUTTONS: '+[...m.querySelectorAll('button,a.btn,select,input')].map(x=>(x.tagName+':'+(x.innerText||x.name||x.id||x.value)).trim()).join(' | ')})).slice(0,3000));
