/* Utilitaires */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

/* Année du footer */
$$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

/* === Diaporama Accueil === */
(function initHomeSlider(){
  const slider = $('.home-slider');
  if (!slider) return;

  const track = $('.slides', slider);
  const slides = $$('.slide', track);
  const prev = $('.prev', slider);
  const next = $('.next', slider);

  let i = 0;
  let timer;

  function go(n){
    i = (n + slides.length) % slides.length;
    track.style.transform = `translateX(${-100*i}%)`;
  }
  function play(){
    stop();
    timer = setInterval(()=> go(i+1), 3500); // vitesse auto (ms)
  }
  function stop(){ if (timer) clearInterval(timer); }

  next.addEventListener('click', ()=>{ go(i+1); play(); });
  prev.addEventListener('click', ()=>{ go(i-1); play(); });

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', play);

  play(); // démarrage auto
})();

/* === Travaux : panneau détail === */
(function initWorks(){
  const grid = $('.works-grid');
  const panel = $('.detail-panel');
  if (!grid || !panel) return;

  const box = $('.detail-box', panel);
  const scroller = $('.detail-scroll', panel);
  const btnClose = $('.detail-close', panel);
  const btnPrev = $('.detail-prev', panel);
  const btnNext = $('.detail-next', panel);

  const works = $$('.work', grid);
  const byId = Object.fromEntries(works.map(w => [w.id, w]));

  let currentIndex = -1;

  function openById(id){
    const work = byId[id];
    if (!work) return;

    currentIndex = works.indexOf(work);

    const tpl = $(`#detail-${id}`);
    scroller.innerHTML = '';
    scroller.appendChild(tpl.content.cloneNode(true));

    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden'; // empêche le scroll arrière-plan
  }

  function close(){
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    scroller.innerHTML = '';
    // retire l’ancre de l’URL si présente
    if (location.hash) history.replaceState(null, '', location.pathname);
  }

  function openAt(index){
    if (index < 0) index = works.length - 1;
    if (index >= works.length) index = 0;
    openById(works[index].id);
  }

  // clic vignette
  $$('.thumb', grid).forEach(btn=>{
    btn.addEventListener('click', ()=>{
      openById(btn.dataset.work);
      // met l’ancre dans l’URL pour partage & navigation directe
      history.replaceState(null, '', `#${btn.dataset.work}`);
    });
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', ()=> openAt(currentIndex-1));
  btnNext.addEventListener('click', ()=> openAt(currentIndex+1));

  // fermer au clic sur l’overlay
  panel.addEventListener('click', (e)=> {
    if (e.target === panel) close();
  });

  // touche Échap / flèches
  window.addEventListener('keydown', (e)=>{
    if (panel.classList.contains('is-open')) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') openAt(currentIndex-1);
      if (e.key === 'ArrowRight') openAt(currentIndex+1);
    }
  });

  // Ouvrir directement un travail via l’ancre (depuis Accueil ou lien externe)
  function openFromHash(){
    const id = location.hash.replace('#','');
    if (id && byId[id]) openById(id);
  }
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
})();
