(() => {
  const css = `
    :root { --primary:#0d6efd; --bg:#f6f8fa; --text:#0f172a; --muted:#64748b; --ok:#198754; --dark:#0d1117; }
    *{box-sizing:border-box}
    html,body{height:100%}
    body{margin:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial; background:var(--bg); color:var(--text)}
    .wrap{min-height:100%; display:grid; grid-template-rows:auto 1fr; align-items:start; padding:0 24px 24px}
    .hero{background:var(--dark); color:#fff; display:grid; place-items:center; padding:28px 16px; box-shadow: 0 10px 30px rgba(2,8,23,.25)}
    .hero .logo{max-width:360px; width:70%; height:auto; filter:drop-shadow(0 10px 28px rgba(0,0,0,.6))}
    .card{width:min(820px, 92vw); background:#fff; border:1px solid #e5e7eb; border-radius:16px; box-shadow:0 10px 30px rgba(2,8,23,.08); padding:28px; margin:-30px auto 0}
    .head{display:flex; align-items:center; gap:16px; margin-bottom:12px}
    .badge{width:48px; height:48px; border-radius:999px; display:grid; place-items:center; background:rgba(25,135,84,.1); color:var(--ok)}
    h1{font-size:clamp(1.4rem, 2.5vw, 1.9rem); margin:0}
    p{margin:.25rem 0; color:var(--muted)} .sr{opacity:0; transform:translateY(18px); transition:transform .6s ease, opacity .6s ease;} .sr.reveal{opacity:1; transform:none;}
    .actions{display:flex; flex-wrap:wrap; gap:10px; margin-top:18px}
    a.btn{display:inline-flex; align-items:center; justify-content:center; height:42px; padding:0 16px; border-radius:10px; text-decoration:none; font-weight:600; border:1px solid #e5e7eb; color:var(--text); background:#fff}
    a.btn.primary{background:var(--primary); color:#fff; border-color:var(--primary)}
    .meta{margin-top:10px; font-size:.9rem; color:#334155}
    .row{display:flex; gap:10px; flex-wrap:wrap}
    .row code{background:#f1f5f9; padding:2px 6px; border-radius:6px}
  `;
  const style = document.createElement('style');
  style.textContent = css; document.head.appendChild(style);

  const wrap = document.createElement('div'); wrap.className = 'wrap';
  const hero = document.createElement('div'); hero.className = 'hero';
  hero.innerHTML = `<img class="logo" src="assets/ncr-logo.png" alt="NCR - Novais Construction & Renovation"/>`;
  const card = document.createElement('div'); card.className = 'card';

  const head = document.createElement('div'); head.className = 'head';
  head.innerHTML = `
    <div class="badge" aria-hidden="true">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
    </div>
    <div>
      <h1>Thanks! Your request was sent.</h1>
      <p>We’ll contact you soon with next steps.</p>
    </div>
  `;

  const tips = document.createElement('div');
  tips.innerHTML = `
    <p class="meta">What would you like to do next?</p>
    <div class="actions">
      <a class="btn primary" href="index.html">Go to Home</a>
      <a class="btn" href="galeria.html">View Gallery</a>
      <a class="btn" href="form.html">Send another request</a>
    </div>
  `;

  const info = document.createElement('div');
  const ts = new Date();
  info.className = 'meta';
  info.innerHTML = `
    <div class="row">
      <div>Timestamp:</div>
      <code>${ts.toLocaleString('en-CA')}</code>
    </div>
  `;

  card.appendChild(head);
  card.appendChild(tips);
  card.appendChild(info);
  wrap.appendChild(hero);
  wrap.appendChild(card);
  document.body.appendChild(wrap);
})();


// Add simple reveal on load
(function(){
  const hero = document.querySelector('.hero');
  const card = document.querySelector('.card');
  [hero, card].forEach((el,i)=>{ if (!el) return; el.classList.add('sr'); el.style.transitionDelay=(i*120)+'ms'; });
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('reveal'); io.unobserve(e.target);} });
  },{threshold:0.1});
  document.querySelectorAll('.sr').forEach(el=>io.observe(el));
})();
