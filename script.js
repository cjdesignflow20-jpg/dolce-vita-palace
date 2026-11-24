const mobileViewport=matchMedia('(max-width:760px)');
const heroVideos=[
  document.querySelector('.hero-video-desktop'),
  document.querySelector('.hero-video-mobile')
];

function setHeroVideo(){
  const activeVideo=heroVideos[Number(mobileViewport.matches)];
  heroVideos.forEach(video=>{
    if(video===activeVideo){
      if(video===heroVideos[1]){
        video.classList.remove('is-ready');
        video.addEventListener('canplay',()=>video.classList.add('is-ready'),{once:true});
      }
      if(!video.src) video.src=video.dataset.src;
      video.load();
      playHeroVideo(video);
      return;
    }
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.classList.remove('is-ready');
  });
}

function playHeroVideo(video){
  video.play().catch(error=>{
    const interrupted=error?.name==='AbortError' || error?.message?.includes('interrupted by');
    if(!interrupted){
      console.warn('La vidéo du hero n’a pas pu démarrer automatiquement.',error);
    }
  });
}

setHeroVideo();
mobileViewport.addEventListener('change',setHeroVideo);

const splitTargets=document.querySelectorAll('.blur-target');
splitTargets.forEach(target=>{
  const walker=document.createTreeWalker(target,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.textContent.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});
  const nodes=[];
  while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(textNode=>{
    const parts=textNode.textContent.split(/(\s+)/);
    const fragment=document.createDocumentFragment();
    let index=0;
    parts.forEach(part=>{
      if(!part) return;
      if(/^\s+$/.test(part)){
        fragment.appendChild(document.createTextNode(part));
        return;
      }
      const span=document.createElement('span');
      span.className='blur-word';
      span.style.setProperty('--word-index',index++);
      span.textContent=part;
      fragment.appendChild(span);
    });
    textNode.replaceWith(fragment);
  });
});

function replayTextAnimations(page){
  const targets=document.querySelectorAll(`${page} .blur-target`);
  targets.forEach(target=>target.classList.remove('is-visible'));
  void document.body.offsetWidth;
  targets.forEach(target=>target.classList.add('is-visible'));
}

function activatePage(page,activeLink,updateHistory=true){
  document.body.dataset.page=page;
  document.querySelectorAll('.nav a, .mobile-menu a').forEach(link=>{
    const isActive=link.closest('.mobile-menu')
      ? link===mobileMenu.querySelector(`[data-page-link="${page}"]`)
      : link===activeLink;
    link.classList.toggle('active',isActive);
    if(isActive) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  const hash=page==='hero'?'#accueil':'#univers';
  if(updateHistory && location.hash!==hash) history.pushState(null,'',hash);
  const scrollBehavior=document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior='auto';
  window.scrollTo({top:0,behavior:'auto'});
  requestAnimationFrame(()=>{ document.documentElement.style.scrollBehavior=scrollBehavior; });
  replayTextAnimations(page==='hero'?'#accueil':'#univers');
  if(page==='hero') playHeroVideo(heroVideos[Number(mobileViewport.matches)]);
  else heroVideos.forEach(video=>video.pause());
  closeMobileMenu();
}

const navLinks=[...document.querySelectorAll('.nav a')];
const mobileMenu=document.querySelector('.mobile-menu');
const mobileMenuToggle=document.querySelector('.mobile-menu-toggle');

function closeMobileMenu(){
  mobileMenu.hidden=true;
  mobileMenuToggle.setAttribute('aria-expanded','false');
  mobileMenuToggle.setAttribute('aria-label','Ouvrir le menu');
  mobileMenuToggle.classList.remove('is-open');
}

mobileMenuToggle.addEventListener('click',()=>{
  const isOpen=mobileMenuToggle.getAttribute('aria-expanded')==='true';
  mobileMenu.hidden=isOpen;
  mobileMenuToggle.setAttribute('aria-expanded',String(!isOpen));
  mobileMenuToggle.setAttribute('aria-label',isOpen?'Ouvrir le menu':'Fermer le menu');
  mobileMenuToggle.classList.toggle('is-open',!isOpen);
});

document.querySelectorAll('[data-page-link]').forEach(link=>{
  link.addEventListener('click',event=>{
    event.preventDefault();
    const page=link.dataset.pageLink;
    const selectedNav=link.closest('.nav')?link:navLinks.find(navLink=>navLink.dataset.pageLink===page);
    activatePage(page,selectedNav);
  });
});

document.addEventListener('keydown',event=>{
  if(event.key==='Escape') closeMobileMenu();
});

document.querySelector('.brand').addEventListener('click',event=>{
  event.preventDefault();
  activatePage('hero',navLinks[0]);
});

document.querySelector('.page-back').addEventListener('click',()=>{
  activatePage('hero',navLinks[0]);
});

window.addEventListener('popstate',()=>{
  const page=location.hash==='#univers'?'univers':'hero';
  activatePage(page,page==='hero'?navLinks[0]:navLinks[1],false);
});

const initialPage=location.hash==='#univers'?'univers':'hero';
activatePage(initialPage,initialPage==='hero'?navLinks[0]:navLinks[1]);

const gallery=document.querySelector('.gallery');
const cards=[...document.querySelectorAll('.gallery-card')];
function setupTouch(){
  if(matchMedia('(hover:none)').matches){
    gallery.classList.add('is-touch');
    const mainCard=gallery.querySelector('.gallery-card.main');
    if(mainCard) mainCard.classList.add('is-active');
    cards.forEach(card=>card.addEventListener('click',()=>{
      cards.forEach(c=>c.classList.remove('is-active'));
      card.classList.add('is-active');
    }));
  }
}
setupTouch();
