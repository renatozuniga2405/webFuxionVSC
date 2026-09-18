import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import {createHash} from 'node:crypto';
const url = process.env.TEST_URL || 'http://127.0.0.1:3101';
const dir = 'test-results/phase03';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[], knownWarnings=[], results=[], captures=[], measurements=[];
const states=[['01-entrada',.06],['02-hero',.22],['03-inicio-apertura',.325],['04-abierto',.43],['05-inicio-vertido',.467],['06-vertido-medio',.56],['07-impacto',.60],['08-mezcla',.68],['09-fin-vertido',.80],['10-reveal',.92]];
try {
 const page=await browser.newPage({viewport:{width:1280,height:720}});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{
  if(m.type()!=='error')return;
  const location=m.location().url;
  if(location.endsWith('/favicon.ico')&&m.text().includes('404'))knownWarnings.push({message:m.text(),url:location});
  else errors.push({message:m.text(),url:location});
 });
 await page.goto(url);await page.waitForSelector('.is-cinematic');await page.waitForTimeout(500);
 async function seek(p){
  await page.evaluate(p=>{const distance=innerHeight*(innerWidth<700?13:16);scrollTo(0,distance*(1.55+p*3.5)/14);},p);
  await page.waitForTimeout(1100);
 }
 async function geometry(){return page.evaluate(()=>{
   const scene=document.querySelector('#thermo-t');
   const stage=scene.querySelector('.product-stage').getBoundingClientRect();
   const sachet=scene.querySelector('.sachet'), box=sachet.getBoundingClientRect();
   const emitter=scene.querySelector('.thermo-emitter').getBoundingClientRect();
   const canvas=scene.querySelector('canvas');
   const origin=canvas.dataset.origin.split(',').map(Number);
   const copy=[...scene.querySelectorAll('.product-editorial,.product-note')].filter(el=>+getComputedStyle(el).opacity>.08);
   const protectedEls=[...copy,document.querySelector('.site-header'),document.querySelector('.experience-controls')];
   const overlaps=protectedEls.filter(el=>{const r=el.getBoundingClientRect();return box.left<r.right&&box.right>r.left&&box.top<r.bottom&&box.bottom>r.top;}).map(el=>el.className);
   const allAction=[box,scene.querySelector('.glass-assembly').getBoundingClientRect()];
   return {progress:+scene.dataset.thermoProgress,overlaps,docWidth:document.documentElement.scrollWidth,viewport:innerWidth,
    emitterError:Math.hypot(emitter.x-stage.x-origin[0],emitter.y-stage.y-origin[1]),
    bounds:allAction.map(r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom})),
    mouthOpacity:+getComputedStyle(scene.querySelector('.thermo-mouth')).opacity,
    particles:+canvas.dataset.particles,flow:+canvas.dataset.flow,mix:+canvas.dataset.mix,
    packWidth:parseFloat(sachet.style.width),dpr:devicePixelRatio,canvasDpr:+canvas.dataset.dpr,
    sachetTransform:sachet.style.transform,tearTransform:scene.querySelector('.sachet-tear').style.transform,
    canvas:canvas.toDataURL(),glassOpacity:+getComputedStyle(scene.querySelector('.glass-assembly')).opacity};
 });}
 let desktopMiddle;
 for(const viewport of [{width:1280,height:720,name:'desktop'},{width:390,height:844,name:'mobile'},{width:573,height:844,name:'narrow'}]){
  await page.setViewportSize({width:viewport.width,height:viewport.height});await page.waitForTimeout(700);
  for(const [name,p] of states){
   await seek(p); const m=await geometry();
   assert.equal(m.overlaps.length,0,`${viewport.name}/${name}: overlaps ${m.overlaps}`);
   assert.ok(m.docWidth<=m.viewport,`${viewport.name}/${name}: horizontal overflow`);
   assert.ok(m.emitterError<1,`${viewport.name}/${name}: emitter error ${m.emitterError}`);
   assert.ok(m.packWidth*m.dpr<=566.1,'Asset exceeds physical source resolution');
   assert.ok(m.bounds.every(b=>b.left>=0&&b.right<=m.viewport),`${viewport.name}/${name}: action exceeds horizontal bounds`);
   if(p<.44) assert.equal(m.particles,0,'Powder before opening');
   if(p>.45&&p<.7){assert.ok(m.mouthOpacity>.95);assert.ok(m.particles>0,`Missing stream ${viewport.name}/${name}: ${JSON.stringify({...m,canvas:undefined})}`);}
   if(p>.85){assert.equal(m.particles,0);assert.ok(m.mix>.99);}
   measurements.push({viewport:viewport.name,state:name,...m,canvas:undefined});
   if(viewport.name==='desktop'&&name==='06-vertido-medio') desktopMiddle=m;
   if(viewport.name==='desktop'||viewport.name==='narrow'||['04-abierto','06-vertido-medio','07-impacto','10-reveal'].includes(name)){
    const file=`${viewport.name}-${name}.png`;await page.screenshot({path:`${dir}/${file}`});captures.push({viewport:viewport.name,state:name,file});
   }
  }
  results.push(`${viewport.width} × ${viewport.height}: all 10 states, no text/navigation collisions, aligned emitter, bounded original asset`);
 }
 await page.setViewportSize({width:1280,height:720});await page.waitForTimeout(800);
 await seek(.56);const reversed=await geometry();
 assert.equal(reversed.canvas,desktopMiddle.canvas,'Canvas must reconstruct exactly on reverse');
 assert.equal(reversed.sachetTransform,desktopMiddle.sachetTransform,'Sachet must reconstruct exactly');
 await seek(.22);assert.equal((await geometry()).particles,0);assert.equal((await geometry()).mouthOpacity,0);
 results.push('Reverse playback: identical canvas and pose; no powder when closed');
 // Sweep intermediate poses, not just the ten selected stills.
 for(const viewport of [{width:1280,height:720},{width:390,height:844},{width:573,height:844}]){
  await page.setViewportSize(viewport);await page.waitForTimeout(600);
  for(let i=1;i<=19;i++){await seek(i/20);const m=await geometry();assert.deepEqual(m.overlaps,[],`Intermediate overlap ${viewport.width}/${i}`);}
 }
 results.push('57 intermediate scroll positions checked for safe zones');
 await seek(.60);const before=(await geometry()).progress;
 for(const viewport of [{width:1280,height:720},{width:390,height:844},{width:844,height:390},{width:573,height:844}]){
  await page.setViewportSize(viewport);await page.waitForTimeout(1300);
  const after=await geometry();assert.ok(Math.abs(after.progress-before)<.012,`Resize reset ${before} -> ${after.progress}`);
  assert.equal(await page.locator('.pin-spacer').count(),1);
 }
 results.push('Resize + orientation: progress preserved, one ScrollTrigger pin');
 for(const label of ['NOCARB-T','BEAUTY-IN','THERMO T3']){
  await page.getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(1700);
  assert.equal(await page.getByRole('button',{name:label,exact:true}).getAttribute('aria-current'),'step');
 }
 await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>document.activeElement?.tagName==='BUTTON'));
 await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await page.waitForTimeout(1400);
 assert.equal(await page.locator('.scroll-caption').evaluate(el=>+getComputedStyle(el).opacity),0);
 results.push('Chapter navigation, keyboard navigation and final scroll prompt');
 await page.getByRole('button',{name:'Ver sin animación'}).click();await page.waitForTimeout(400);
 await page.getByRole('button',{name:'THERMO T3',exact:true}).click();
 assert.equal(await page.locator('.pin-spacer').count(),0);
 assert.ok(await page.locator('#thermo-t .glass-assembly').isVisible());
 assert.equal(await page.locator('#thermo-t .thermo-mouth').evaluate(el=>+getComputedStyle(el).opacity),0);
 await page.screenshot({path:`dir/static.png`.replace('dir',dir)});
 results.push('Manual static view: closed sachet, prepared glass, copy and navigation');
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForTimeout(500);
 await page.getByRole('button',{name:'THERMO T3',exact:true}).click();
 assert.equal(await page.locator('.pin-spacer').count(),0);
 assert.ok(await page.locator('#thermo-t .glass-assembly').isVisible());
 await page.screenshot({path:`${dir}/reduced-motion.png`});
 results.push('Reduced motion: stable product and prepared drink');
 const retina=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3});
 await retina.goto(url);await retina.waitForSelector('.is-cinematic');
 await retina.evaluate(()=>scrollTo(0,innerHeight*13*(1.55+.56*3.5)/14));await retina.waitForTimeout(1100);
 const budget=await retina.locator('#thermo-t').evaluate(el=>({width:parseFloat(el.querySelector('.sachet').style.width),dpr:devicePixelRatio,canvas:+el.querySelector('canvas').dataset.dpr}));
 assert.ok(budget.width*budget.dpr<=566.1);assert.ok(budget.canvas<=2);
 await retina.screenshot({path:`${dir}/mobile-dpr3.png`});
 results.push('DPR 3: source-pixel budget respected; Canvas capped at DPR 2');
 const hashes=JSON.parse(await readFile(new URL('./phase03-baseline.json',import.meta.url),'utf8'));
 for(const [file,hash]of Object.entries(hashes))assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'),hash,`Out of scope modification ${file}`);
 results.push('Product data, original assets, FinalScene and Atmosphere unchanged (SHA-256)');
 assert.deepEqual(errors,[]);
 results.push('No browser exceptions or scene resource failures; pre-existing favicon 404 recorded separately');
 await writeFile(`${dir}/report.json`,JSON.stringify({pass:true,results,knownWarnings,measurements,captures},null,2));
 await writeFile(`${dir}/gallery.html`,`<!doctype html><html lang="es"><meta charset="utf-8"><title>Thermo T3 — Fase 03</title><style>body{background:#12110f;color:#eee;font:14px system-ui;margin:32px}main{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}img{width:100%;max-height:650px;object-fit:contain;background:#050505}figure{margin:0}figcaption{margin:8px 0 24px}h1{font-weight:400}</style><h1>Thermo T3 — Fase 03</h1><main>${captures.map(c=>`<figure><img src="${c.file}"><figcaption>${c.viewport} · ${c.state}</figcaption></figure>`).join('')}</main></html>`);
 console.log(JSON.stringify({pass:true,results,knownWarnings},null,2));
}finally{await browser.close();}
