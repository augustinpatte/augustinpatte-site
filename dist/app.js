const root=document.documentElement;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header=document.querySelector('.site-header');
const menu=document.querySelector('.menu-toggle');
const navigation=document.getElementById('navigation');
function closeMenu(){header?.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false');}
menu?.addEventListener('click',()=>{const open=header.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&header?.classList.contains('menu-open')){closeMenu();menu.focus();}});
document.addEventListener('click',event=>{if(header&&!header.contains(event.target))closeMenu();});
navigation?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
window.matchMedia('(min-width: 761px)').addEventListener('change',closeMenu);
const reveals=[...document.querySelectorAll('.reveal')];
if(!reduced&&'IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}},{threshold:0.05,rootMargin:'0px 0px 30px 0px'});root.classList.add('js');reveals.forEach(el=>observer.observe(el));}
const progress=document.querySelector('.progress');let queued=false;
function updateProgress(){const total=document.documentElement.scrollHeight-window.innerHeight;const ratio=total>0?Math.max(0,Math.min(1,window.scrollY/total)):0;if(progress)progress.style.transform=`scaleX(${ratio})`;queued=false;}
function scheduleProgress(){if(!queued){queued=true;requestAnimationFrame(updateProgress);}}
window.addEventListener('scroll',scheduleProgress,{passive:true});window.addEventListener('resize',scheduleProgress,{passive:true});updateProgress();
const cards=[...document.querySelectorAll('[data-kind]')];
const filters=[...document.querySelectorAll('[data-filter]')];
filters.forEach(button=>button.addEventListener('click',()=>{filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));let count=0;cards.forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.kind!==button.dataset.filter;if(!card.hidden){count++;card.classList.add('visible');}});const counter=document.querySelector('.filter-count');if(counter)counter.textContent=`${count} ${document.documentElement.lang==='fr'?'projet':'project'}${count===1?'':'s'}`;scheduleProgress();}));
document.querySelector('[data-print]')?.addEventListener('click',()=>window.print());
if('IntersectionObserver' in window){const sectionObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){document.querySelectorAll('.article-index>a').forEach(a=>a.classList.toggle('current',a.hash==='#'+entry.target.id));}}},{rootMargin:'-15% 0px -60% 0px'});document.querySelectorAll('.project-prose>section[id]').forEach(el=>sectionObserver.observe(el));}
// Keep links to the first version's French query working.
if(new URLSearchParams(location.search).get('lang')==='fr'&&!location.pathname.startsWith('/fr/')){location.replace('/fr'+(location.pathname==='/'?'/':location.pathname.replace(/resume\.html$/,'resume/'))+location.hash);}
