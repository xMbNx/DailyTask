// Estilos visuales (data-skin en <html>) y su selector. Se carga en <head> de las dos páginas:
// el estilo guardado se aplica al instante, antes de pintar, para que no haya parpadeo.
(function(){
  'use strict';
  // 'tareas-view-' → se sincroniza con la cuenta (auth.js).
  // Cada proyecto guarda su propio estilo en 'tareas-view-skin:<proyecto>'. El estilo general
  // ('tareas-view-skin') es el de la lista de proyectos y el de los proyectos que aún no tienen uno propio.
  const GLOBAL_KEY = 'tareas-view-skin';
  const PROJECT = new URLSearchParams(location.search).get('p') || '';
  const KEY = PROJECT ? GLOBAL_KEY + ':' + PROJECT : GLOBAL_KEY;
  const SKINS = [
    ['', 'Clásico'],
    ['glass', 'Cristal'],
    ['neu', 'Neumorfismo'],
    ['clay', 'Arcilla 3D'],
    ['pixel', '8 bits'],
    ['brutal', 'Neobrutalismo'],
    ['term', 'Terminal neón']
  ];
  const FONT_URL = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap';

  function stored(){
    try{
      const own = localStorage.getItem(KEY);          // '' también es una elección (Clásico)
      return own !== null ? own : (localStorage.getItem(GLOBAL_KEY) || '');
    }catch(e){ return ''; }
  }
  function valid(s){ return SKINS.some(x => x[0] === s); }

  function apply(skin){
    const root = document.documentElement;
    if(!valid(skin)) skin = '';
    if(skin) root.setAttribute('data-skin', skin); else root.removeAttribute('data-skin');
    // La fuente pixel solo se descarga si se elige ese estilo.
    if(skin === 'pixel' && !document.getElementById('skinFont')){
      const link = document.createElement('link');
      link.id = 'skinFont'; link.rel = 'stylesheet'; link.href = FONT_URL;
      document.head.appendChild(link);
    }
  }
  apply(stored());

  function init(){
    const anchor = document.getElementById('themeToggleBtn');
    if(!anchor || document.getElementById('skinSelect')) return;
    const select = document.createElement('select');
    select.id = 'skinSelect';
    select.className = 'skin-select';
    select.setAttribute('aria-label', PROJECT ? 'Estilo visual de este proyecto' : 'Estilo visual por defecto');
    select.title = PROJECT ? 'Estilo de este proyecto (cada proyecto puede tener el suyo)'
                           : 'Estilo de esta lista y de los proyectos que no tengan uno propio';
    SKINS.forEach(([value, label]) => {
      const opt = document.createElement('option');
      opt.value = value; opt.textContent = 'Estilo: ' + label;
      select.appendChild(opt);
    });
    select.value = valid(stored()) ? stored() : '';
    select.addEventListener('change', () => {
      apply(select.value);
      if(window.DT && DT.setPref) DT.setPref(KEY, select.value);
      else{ try{ localStorage.setItem(KEY, select.value); }catch(e){ /* bloqueado */ } }
    });
    anchor.insertAdjacentElement('afterend', select);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Banner «Daily Task» acorde al estilo y al modo claro/oscuro: banners/<estilo>-<modo>.webp.
  // Cristal y Terminal neón solo tienen versión oscura, igual que sus estilos.
  const BANNERS = {'':'clasico', glass:'cristal', neu:'neumorfismo', clay:'arcilla', pixel:'8bits', brutal:'neobrutalismo', term:'terminal'};
  const ONLY_DARK = ['glass', 'term'];
  const darkMQ = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function bannerSrc(){
    const root = document.documentElement;
    const skin = root.getAttribute('data-skin') || '';
    const theme = root.getAttribute('data-theme') || (darkMQ && darkMQ.matches ? 'dark' : 'light');
    const mode = (ONLY_DARK.includes(skin) || theme === 'dark') ? 'oscuro' : 'claro';
    return 'banners/' + (BANNERS[skin] || 'clasico') + '-' + mode + '.webp';
  }
  function updateBanners(){
    const src = bannerSrc();
    document.querySelectorAll('img.overview-banner-img, img.logo').forEach(img => {
      if(img.getAttribute('src') !== src) img.setAttribute('src', src);
      img.style.imageRendering = 'auto';   // los banners ya vienen a alta resolución (también el de 8 bits)
    });
  }
  function initBanners(){
    updateBanners();
    new MutationObserver(updateBanners).observe(document.documentElement, {attributes:true, attributeFilter:['data-skin', 'data-theme']});
    if(darkMQ){
      if(darkMQ.addEventListener) darkMQ.addEventListener('change', updateBanners);
      else if(darkMQ.addListener) darkMQ.addListener(updateBanners);
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initBanners);
  else initBanners();
})();
