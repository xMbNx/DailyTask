// Estilos visuales (data-skin en <html>) y su selector. Se carga en <head> de las dos páginas:
// el estilo guardado se aplica al instante, antes de pintar, para que no haya parpadeo.
(function(){
  'use strict';
  const KEY = 'tareas-view-skin';          // 'tareas-view-' → se sincroniza con la cuenta (auth.js)
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
    try{ return localStorage.getItem(KEY) || ''; }catch(e){ return ''; }
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
    select.setAttribute('aria-label', 'Estilo visual');
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
})();
