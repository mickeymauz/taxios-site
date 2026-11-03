// Polityka prywatności: spis treści (aktywny rozdział, zwijanie na telefonie), pojawianie się rozdziałów,
// pasek postępu czytania, przycisk „do góry”. Bez bibliotek. Treść polityki jest tylko po polsku —
// w wersji UA/EN strona pokazuje informację o tym, a tytuł karty mówi „(польською)” / „(in Polish)”.
(() => {
  window.ppReady = true;
  const root = document.documentElement;
  const RM = root.classList.contains('rm');

  /* ---------- Język: przełącznik z i18n.js zmienia nagłówek i stopkę, dokument zostaje po polsku ---------- */
  const T = {
    uk: { note: 'Ця політика конфіденційності доступна лише польською мовою. Нижче — оригінальний текст.', title: 'Політика конфіденційності (польською) — Rejs OS', home: 'Головна сторінка', top: 'Нагору' },
    en: { note: 'This privacy policy is available in Polish only. The original text follows below.', title: 'Privacy policy (in Polish) — Rejs OS', home: 'Home page', top: 'Back to top' },
  };
  const metaDesc = document.querySelector('meta[name="description"]');
  const PL = { title: document.title, desc: metaDesc ? metaDesc.content : '' };
  const texts = [...document.querySelectorAll('[data-doc]')];
  const arias = [...document.querySelectorAll('[data-doc-aria]')];
  texts.forEach((el) => { PL[el.dataset.doc] = el.textContent; });
  arias.forEach((el) => { PL[el.dataset.docAria] = el.getAttribute('aria-label'); });
  const note = document.querySelector('.pp-langnote');

  function applyLang(lang) {
    const D = T[lang];
    const pick = (k) => (D && D[k] != null ? D[k] : PL[k]);
    // i18n.js wpisuje tytuł i opis strony głównej — tu wracają właściwe dla polityki
    document.title = pick('title');
    if (metaDesc) metaDesc.content = PL.desc;
    texts.forEach((el) => { el.textContent = pick(el.dataset.doc); });
    arias.forEach((el) => el.setAttribute('aria-label', pick(el.dataset.docAria)));
    if (note) { note.hidden = !D; if (D) note.lang = lang; }
  }
  applyLang(window.rejsI18n ? window.rejsI18n.lang : 'pl');
  document.addEventListener('rejs:lang', (e) => applyLang(e.detail));

  /* ---------- Spis treści ---------- */
  const secs = [...document.querySelectorAll('.pp-sec')];
  const details = document.querySelector('.pp-toc details');
  const links = [...document.querySelectorAll('.pp-toc a[href^="#"]')];
  const linkFor = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const cur = document.querySelector('.pp-toc-cur');
  const ind = document.querySelector('.pp-toc-ind');
  const wide = matchMedia('(min-width: 1000px)');

  // Komputer: zawsze rozwinięty. Telefon: zwinięty pasek, rozwija się dotknięciem.
  const syncToc = () => { if (details) details.open = wide.matches; placeInd(); };
  wide.addEventListener ? wide.addEventListener('change', syncToc) : wide.addListener(syncToc);

  links.forEach((a) => a.addEventListener('click', () => { if (!wide.matches && details) details.open = false; }));
  document.addEventListener('click', (e) => {
    if (!wide.matches && details && details.open && !details.contains(e.target)) details.open = false;
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !wide.matches && details && details.open) { details.open = false; details.querySelector('summary').focus(); }
  });

  let active = null;
  function placeInd() {
    if (!ind) return;
    const a = active && linkFor.get(active.id);
    if (!a || !wide.matches) { ind.style.opacity = '0'; return; }
    ind.style.transform = `translateY(${a.offsetTop}px)`;
    ind.style.height = `${a.offsetHeight}px`;
    ind.style.opacity = '1';
  }
  function setActive(sec) {
    if (sec === active) return;
    if (active) { active.classList.remove('is-active'); const o = linkFor.get(active.id); if (o) o.removeAttribute('aria-current'); }
    active = sec;
    if (sec) {
      sec.classList.add('is-active');
      const a = linkFor.get(sec.id);
      if (a) a.setAttribute('aria-current', 'location');
      if (cur && a) cur.textContent = `${a.querySelector('.no').textContent} · ${a.textContent.replace(a.querySelector('.no').textContent, '').trim()}`;
    } else if (cur) cur.textContent = '';
    placeInd();
  }

  /* ---------- Przewijanie: aktywny rozdział, postęp, „do góry” ---------- */
  const header = document.getElementById('top');
  const totop = document.querySelector('.pp-totop');
  let queued = false;
  function update() {
    queued = false;
    const vh = innerHeight;
    const y = scrollY;
    const max = document.documentElement.scrollHeight - vh;
    const line = (header ? header.getBoundingClientRect().bottom : 64) + Math.min(vh * 0.28, 220);
    let sec = null;
    for (const s of secs) { if (s.getBoundingClientRect().top <= line) sec = s; else break; }
    // Na samym dole krótkie końcowe rozdziały nie dojdą do linii: wtedy rozdział ze skoku (#hash), jeśli widać jego nagłówek, inaczej ostatni
    if (max > 0 && y >= max - 4 && secs.length) {
      const h = location.hash && document.getElementById(location.hash.slice(1));
      sec = h && secs.includes(h) && h.getBoundingClientRect().top < vh * 0.6 ? h : secs[secs.length - 1];
    }
    setActive(sec);
    if (header) header.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');
    if (totop) totop.classList.toggle('show', y > Math.max(600, vh * 0.9));
  }
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', () => { placeInd(); queue(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { placeInd(); queue(); });

  if (totop) totop.addEventListener('click', (e) => {
    e.preventDefault();
    scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
    const h1 = document.querySelector('.pp-hero h1');
    if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
  });

  /* ---------- Pojawianie się rozdziałów ---------- */
  if (root.classList.contains('pp-reveal') && !RM && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    secs.forEach((s) => io.observe(s));
    // Skok kotwicą lub druk: rozdział ma być widoczny od razu
    addEventListener('hashchange', () => { const t = document.getElementById(location.hash.slice(1)); if (t && t.classList.contains('pp-sec')) t.classList.add('in'); });
    addEventListener('beforeprint', () => secs.forEach((s) => s.classList.add('in')));
  } else {
    root.classList.remove('pp-reveal');
  }

  syncToc();
  update();
})();
