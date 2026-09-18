import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1280,height:720}});
try {
 await page.goto('http://127.0.0.1:3100');await page.waitForSelector('.is-cinematic');
 await page.evaluate(()=>scrollTo(0,innerHeight*16*3.4/14));await page.waitForTimeout(1200);
 const data=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll('.cinema-stage *')].map(el=>({name:el.tagName,classes:el.className,rect:el.getBoundingClientRect().toJSON(),visible:getComputedStyle(el).visibility,opacity:getComputedStyle(el).opacity})).filter(e=>e.rect.right>innerWidth+1||e.rect.left<-1)}));
 await writeFile('test-results/phase03/overflow-before.json',JSON.stringify(data,null,2));
 await page.screenshot({path:'test-results/phase03/before-desktop.png'});
 console.log(JSON.stringify(data,null,2));
}finally{await browser.close();}
