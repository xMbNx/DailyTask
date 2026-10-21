// Cliente de Supabase y pantalla de acceso, compartidos por index.html y dailytask.html.
// Necesita cargarse después de supabase-js (window.supabase) y de config.js.
(function(){
  'use strict';

  const cfg = window.DAILYTASK_CONFIG || {};
  const configured = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase);
  const sb = configured ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;

  const CSS = `
    .auth-overlay{
      position:fixed; inset:0; z-index:1000; background:var(--bg);
      display:flex; align-items:center; justify-content:center; padding:16px;
    }
    .auth-box{
      background:var(--card); border:1px solid var(--border); border-radius:var(--radius, 14px);
      padding:26px 22px; width:min(360px, 100%); display:flex; flex-direction:column; gap:12px;
      color:var(--text); font-family:inherit;
    }
    .auth-box h2{margin:0 0 4px; font-size:1.15rem;}
    .auth-box p{margin:0; color:var(--muted); font-size:.85rem; line-height:1.45;}
    .auth-box input{
      font:inherit; padding:10px 12px; border-radius:8px; border:1px solid var(--border);
      background:var(--bg); color:var(--text);
    }
    .auth-box button{
      font:inherit; cursor:pointer; border:none; border-radius:10px; padding:10px 16px;
      background:var(--accent); color:#fff; font-size:.9rem; font-weight:600;
    }
    .auth-box button:disabled{opacity:.6; cursor:wait;}
    .auth-box .auth-err{color:var(--danger); font-size:.8rem; min-height:1em;}
    .auth-box code{font-size:.8rem;}
  `;

  function injectCss(){
    if(document.getElementById('authCss')) return;
    const style = document.createElement('style');
    style.id = 'authCss';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function showNotConfigured(){
    injectCss();
    const overlay = document.createElement('div');
    overlay.className = 'auth-overlay';
    overlay.innerHTML = `<div class="auth-box">
      <h2>Falta configurar Supabase</h2>
      <p>Rellena <code>supabaseUrl</code> y <code>supabaseAnonKey</code> en <code>config.js</code> con los datos de tu proyecto (Project Settings → API).</p>
    </div>`;
    document.body.appendChild(overlay);
  }

  // Resolves with the session once the user is signed in (immediately if a
  // session is already stored). Never resolves if Supabase isn't configured.
  function showLogin(){
    injectCss();
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'auth-overlay';
      overlay.innerHTML = `<form class="auth-box" novalidate>
        <h2>Daily Task</h2>
        <p>Inicia sesión para ver tus proyectos.</p>
        <input type="email" name="email" placeholder="Email" autocomplete="username" required>
        <input type="password" name="password" placeholder="Contraseña" autocomplete="current-password" required>
        <div class="auth-err"></div>
        <button type="submit">Entrar</button>
      </form>`;
      document.body.appendChild(overlay);
      const form = overlay.querySelector('form');
      const err = overlay.querySelector('.auth-err');
      const btn = overlay.querySelector('button');
      form.email.focus();

      form.addEventListener('submit', async e => {
        e.preventDefault();
        const email = form.email.value.trim();
        const password = form.password.value;
        if(!email || !password){ err.textContent = 'Escribe tu email y contraseña.'; return; }
        btn.disabled = true;
        err.textContent = '';
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        btn.disabled = false;
        if(error){
          err.textContent = error.message === 'Invalid login credentials'
            ? 'Email o contraseña incorrectos.'
            : error.message;
          return;
        }
        overlay.remove();
        resolve(data.session);
      });
    });
  }

  async function requireAuth(){
    if(!configured){ showNotConfigured(); return new Promise(() => {}); }
    const { data } = await sb.auth.getSession();
    if(data.session) return data.session;
    return showLogin();
  }

  async function signOut(){
    if(sb) await sb.auth.signOut();
    location.href = 'index.html';
  }

  window.DT = { sb, requireAuth, signOut };
})();
