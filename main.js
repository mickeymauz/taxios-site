// Sceny sterowane przewijaniem. Bez bibliotek: każda sekcja .scrolly dostaje postęp 0–1,
// wygładzany w requestAnimationFrame, i rysuje swoją klatkę. Przy „mniej ruchu” — jedna statyczna klatka.
(() => {
  const RM = document.documentElement.classList.contains('rm');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => t * t * (3 - 2 * t);
  const ramp = (t) => ease(clamp(t));
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  let vw = innerWidth, vh = innerHeight;

  // Prosty generator liczb (stałe ziarno → ta sama scena przy każdym wejściu)
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  function fitCanvas(c) {
    const r = c.getBoundingClientRect();
    c.width = Math.round(r.width * DPR); c.height = Math.round(r.height * DPR);
    const ctx = c.getContext('2d'); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return { ctx, W: r.width, H: r.height };
  }

  // Warstwy tekstu: data-range="od do" → --o (krycie i przesunięcie)
  function applyRanges(sec, p) {
    if (RM) return;
    sec.querySelectorAll('[data-range]').forEach((el) => {
      const [a, b] = el.dataset.range.split(' ').map(Number);
      const o = Math.min(ramp((p - a) / 0.06 + (a <= 0 ? 1 : 0)), ramp((b - p) / 0.06));
      el.style.setProperty('--o', o.toFixed(3));
      el.style.visibility = o < 0.01 ? 'hidden' : '';
    });
  }

  /* ---------- 1. Jazda ---------- */
  function heroScene(sec) {
    const c = sec.querySelector('canvas');
    const costs = sec.querySelectorAll('.costs span');
    let g, stars, city;
    const resize = () => {
      g = fitCanvas(c);
      const R = rng(7);
      stars = Array.from({ length: 140 }, () => ({ x: R(), y: R() * 0.5, r: R() * 1.1 + 0.2, a: R() * 0.6 + 0.15 }));
      city = Array.from({ length: 90 }, () => ({ x: R() * 0.56, h: R() * R() * 16, a: R() * 0.5 + 0.2, w: R() < 0.2 }));
    };
    const bez = (p0, p1, p2, p3, t) => {
      const u = 1 - t;
      return [u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0], u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]];
    };
    function draw(p) {
      const { ctx, W, H } = g;
      const narrow = W < 760;
      const hy = H * (narrow ? 0.5 : 0.47);
      const vx = W * (narrow ? 0.7 : 0.66);
      const end = ramp((p - 0.66) / 0.34);
      const moonR = Math.min(W, H) * 0.05 * (1 + end * 1.6);
      const moonY = hy - H * 0.13 - end * H * 0.04;

      // niebo
      let gr = ctx.createLinearGradient(0, 0, 0, hy);
      gr.addColorStop(0, '#05090d'); gr.addColorStop(1, '#132132');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, hy + 1);
      for (const s of stars) { ctx.globalAlpha = s.a * (1 - end * 0.5); ctx.fillStyle = '#dbe6f3'; ctx.fillRect(s.x * W, s.y * H, s.r, s.r); }
      ctx.globalAlpha = 1;

      // poświata księżyca
      const halo = ctx.createRadialGradient(vx, moonY, moonR * 0.6, vx, moonY, moonR * (7 + end * 6));
      halo.addColorStop(0, 'rgba(245,214,140,0.42)'); halo.addColorStop(0.35, 'rgba(245,190,56,0.10)'); halo.addColorStop(1, 'rgba(245,190,56,0)');
      ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#f8ecc4'; ctx.beginPath(); ctx.arc(vx, moonY, moonR, 0, Math.PI * 2); ctx.fill();

      // miasto na horyzoncie
      for (const b of city) { ctx.globalAlpha = b.a; ctx.fillStyle = b.w ? '#cfe0f0' : '#f5be38'; ctx.fillRect(b.x * W, hy - 2 - b.h, 1.6, 1.6); }
      ctx.globalAlpha = 1;

      // ziemia i droga
      ctx.fillStyle = '#060a0e'; ctx.fillRect(0, hy, W, H - hy);
      const bl = [-W * 0.25, H], br = [W * 1.02, H];
      gr = ctx.createLinearGradient(0, hy, 0, H);
      gr.addColorStop(0, '#0b1219'); gr.addColorStop(1, '#151f2a');
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.moveTo(vx - 1.5, hy); ctx.lineTo(vx + 1.5, hy); ctx.lineTo(br[0], br[1]); ctx.lineTo(bl[0], bl[1]); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(241,245,249,0.42)'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(vx + 1.5, hy); ctx.lineTo(W * 0.94, H); ctx.stroke();

      // przerywana linia środkowa — przesuwa się z przewijaniem
      const cb = [W * 0.36, H];
      const travel = p * 70 + end * end * 60;
      const spacing = 3.2, len = 1.5;
      for (let k = 0; k < 26; k++) {
        const z = 1 + k * spacing - (travel % spacing);
        const z2 = z + len;
        if (z < 0.6) continue;
        const f1 = 1 / z, f2 = 1 / z2;
        const x1 = vx + (cb[0] - vx) * f1, y1 = hy + (cb[1] - hy) * f1;
        const x2 = vx + (cb[0] - vx) * f2, y2 = hy + (cb[1] - hy) * f2;
        ctx.strokeStyle = `rgba(241,245,249,${0.5 * Math.min(1, f1 * 3)})`;
        ctx.lineWidth = Math.max(0.6, 7 * f1);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }

      // smugi świateł — rosną z przewijaniem i skręcają do księżyca
      ctx.globalCompositeOperation = 'lighter';
      const starts = [0.02, 0.13, 0.24, 0.31];
      starts.forEach((sx, i) => {
        const p0 = [W * sx - W * 0.1, H + 10];
        const p3 = [vx, moonY + moonR * 0.7];
        const p1 = [p0[0] + (vx - p0[0]) * 0.45, hy + (H - hy) * (0.42 - i * 0.05)];
        const p2 = [vx - 6 - i * 3, hy + 4];
        const rev = clamp(0.32 + 0.68 * ramp((p - i * 0.03) / 0.55));
        const N = 90, n = Math.floor(N * rev);
        let prev = bez(p0, p1, p2, p3, 0);
        for (let j = 1; j <= n; j++) {
          const t = j / N, pt = bez(p0, p1, p2, p3, t);
          const w = (1 - t) * 1 + 0.08;
          const head = j > n - 8 ? 1.6 : 1;
          ctx.strokeStyle = `rgba(245,190,56,${0.07 * head})`; ctx.lineWidth = 22 * w;
          ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(pt[0], pt[1]); ctx.stroke();
          ctx.strokeStyle = `rgba(245,190,56,${0.28 * head})`; ctx.lineWidth = 6 * w;
          ctx.stroke();
          ctx.strokeStyle = `rgba(255,236,190,${0.75 * head})`; ctx.lineWidth = 1.6 * w + 0.4;
          ctx.stroke();
          prev = pt;
        }
      });
      ctx.globalCompositeOperation = 'source-over';

      // przyciemnienie pod tekst (z lewej) i wyjście w kolejną sekcję
      gr = ctx.createLinearGradient(0, 0, W * 0.75, 0);
      gr.addColorStop(0, 'rgba(7,12,17,0.82)'); gr.addColorStop(1, 'rgba(7,12,17,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
      const out = ramp((p - 0.9) / 0.1);
      if (out > 0) { ctx.fillStyle = `rgba(12,19,26,${out})`; ctx.fillRect(0, 0, W, H); }
    }
    resize();
    return {
      resize,
      render(p) {
        draw(p);
        applyRanges(sec, p);
        costs.forEach((el, k) => el.style.setProperty('--o', ramp((p - (0.31 + k * 0.065)) / 0.05).toFixed(3)));
      },
    };
  }

  /* ---------- 2. Licznik ---------- */
  function meterScene(sec) {
    const big = sec.querySelector('#meter-big');
    const lbl = sec.querySelector('#meter-lbl');
    const split = sec.querySelector('#meter-split');
    const phone = sec.querySelector('.phone');
    const lines = [...sec.querySelectorAll('.lines li')];
    const steps = [ // [od kiedy, kwota po kroku, podpis]
      [0.04, 452, 'utarg z aplikacji'],
      [0.2, 339, 'po prowizji platformy'],
      [0.36, 210, 'po czynszu za auto'],
      [0.52, 118, 'zarobek po kosztach'],
    ];
    let last = '';
    return {
      resize() {},
      render(p) {
        let v = 0, label = steps[0][2];
        steps.forEach(([at, val, l], i) => {
          const from = i ? steps[i - 1][1] : 0;
          const t = ramp((p - at) / 0.1);
          if (p >= at) { v = from + (val - from) * t; label = l; }
        });
        const txt = Math.round(v) + ' zł';
        if (txt !== last) { big.textContent = txt; last = txt; }
        lbl.textContent = label;
        const done = p >= 0.66;
        big.classList.toggle('done', done);
        split.hidden = p < 0.76;
        lines.forEach((li) => li.classList.toggle('on', p >= Number(li.dataset.at)));
        if (phone) {
          phone.style.setProperty('--rot', (-18 + 14 * ramp(p / 0.8)).toFixed(2) + 'deg');
          phone.querySelector('.glow').style.setProperty('--g', ramp((p - 0.64) / 0.1).toFixed(3));
        }
      },
    };
  }

  /* ---------- 3. Funkcje w poziomie ---------- */
  function trackScene(sec) {
    const track = sec.querySelector('.track');
    let dist = 0;
    const resize = () => {
      if (RM) return;
      dist = Math.max(0, track.scrollWidth - vw);
      sec.style.height = (dist + vh) + 'px';
    };
    resize();
    return { resize, render(p) { if (!RM) track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`; } };
  }

  /* ---------- 4. Bańka: mapa nocą i zapis kursu ---------- */
  function bubbleScene(sec) {
    const c = sec.querySelector('canvas');
    const bubble = sec.querySelector('#bubble');
    const bt = sec.querySelector('#bubble-t');
    let g, streets, blocks;
    const S = 96; // rozstaw ulic
    const route = [[-4, 3], [-4, 1], [-1, 1], [-1, -1], [2, -1], [2, -3], [5, -3]];
    const segLen = route.slice(1).map((q, i) => Math.hypot(q[0] - route[i][0], q[1] - route[i][1]));
    const total = segLen.reduce((a, b) => a + b, 0);
    const resize = () => {
      g = fitCanvas(c);
      const R = rng(11);
      streets = [];
      for (let k = -14; k <= 14; k++) streets.push({ k, major: k % 3 === 0, j: (R() - 0.5) * 6 });
      blocks = Array.from({ length: 40 }, () => ({ x: Math.floor(R() * 20) - 10, y: Math.floor(R() * 14) - 7, t: R() }));
    };
    const at = (d) => {
      let acc = 0;
      for (let i = 0; i < segLen.length; i++) {
        if (acc + segLen[i] >= d) { const t = (d - acc) / segLen[i]; const a = route[i], b = route[i + 1]; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, i]; }
        acc += segLen[i];
      }
      const e = route[route.length - 1]; return [e[0], e[1], segLen.length - 1];
    };
    function draw(p) {
      const { ctx, W, H } = g;
      const r = ramp((p - 0.16) / 0.64);
      const car = at(r * total);
      ctx.fillStyle = '#0a1118'; ctx.fillRect(0, 0, W, H);
      ctx.save();
      // kamera: lekko podąża za autem, mapa obrócona jak w nawigacji
      ctx.translate(W * 0.5, H * 0.42);
      ctx.rotate(-0.32);
      ctx.translate(-car[0] * S * 0.55, -car[1] * S * 0.55);
      // kwartały: parki i woda
      for (const b of blocks) {
        ctx.fillStyle = b.t < 0.25 ? '#0e1d18' : b.t < 0.35 ? '#0d1b29' : '#0d151d';
        ctx.fillRect(b.x * S + 8, b.y * S + 8, S - 16, S - 16);
      }
      ctx.fillStyle = '#0f2131';
      ctx.fillRect(-15 * S, 4.35 * S, 30 * S, S * 0.7);
      // ulice
      ctx.lineCap = 'round';
      for (const s of streets) {
        ctx.strokeStyle = s.major ? '#2a3d51' : '#1a2836'; ctx.lineWidth = s.major ? 6 : 3;
        ctx.beginPath(); ctx.moveTo(-15 * S, s.k * S + s.j * 0); ctx.lineTo(15 * S, s.k * S); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s.k * S, -15 * S); ctx.lineTo(s.k * S, 15 * S); ctx.stroke();
      }
      // plan z nawigacji (niebieski), zapisany odcinek (bursztyn)
      ctx.setLineDash([2, 12]); ctx.strokeStyle = 'rgba(124,184,255,0.7)'; ctx.lineWidth = 4;
      ctx.beginPath(); route.forEach(([x, y], i) => (i ? ctx.lineTo(x * S, y * S) : ctx.moveTo(x * S, y * S))); ctx.stroke();
      ctx.setLineDash([]);
      if (r > 0) {
        ctx.strokeStyle = 'rgba(245,190,56,0.25)'; ctx.lineWidth = 16;
        const path = () => { ctx.beginPath(); ctx.moveTo(route[0][0] * S, route[0][1] * S); for (let i = 1; i <= car[2]; i++) ctx.lineTo(route[i][0] * S, route[i][1] * S); ctx.lineTo(car[0] * S, car[1] * S); };
        path(); ctx.stroke();
        ctx.strokeStyle = '#f5be38'; ctx.lineWidth = 5; path(); ctx.stroke();
      }
      // punkt startu i auto
      ctx.fillStyle = '#34d399'; ctx.beginPath(); ctx.arc(route[0][0] * S, route[0][1] * S, 7, 0, 7); ctx.fill();
      const cx = car[0] * S, cy = car[1] * S;
      const halo = ctx.createRadialGradient(cx, cy, 2, cx, cy, 40);
      halo.addColorStop(0, 'rgba(245,190,56,0.55)'); halo.addColorStop(1, 'rgba(245,190,56,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, 40, 0, 7); ctx.fill();
      ctx.fillStyle = '#f8ecc4'; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, 7); ctx.fill();
      ctx.restore();
      // winieta
      const v = ctx.createRadialGradient(W / 2, H * 0.42, Math.min(W, H) * 0.2, W / 2, H * 0.42, Math.max(W, H) * 0.75);
      v.addColorStop(0, 'rgba(7,12,17,0)'); v.addColorStop(1, 'rgba(7,12,17,0.85)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
      // bańka nad autem: pozycja na ekranie = środek kamery
      bubble.style.setProperty('--bx', W * 0.5 + 'px');
      bubble.style.setProperty('--by', H * 0.42 + 'px');
      return r;
    }
    resize();
    let state = '';
    return {
      resize,
      render(p) {
        const r = draw(p);
        const s = p < 0.16 ? 'start' : p < 0.82 ? 'live' : 'saved';
        bubble.classList.toggle('live', s === 'live');
        bubble.classList.toggle('saved', s === 'saved');
        if (s === 'start') bt.textContent = 'Nowy kurs';
        else if (s === 'live') {
          const sec = Math.round(r * 23 * 60), km = (r * 9.4).toFixed(1).replace('.', ',');
          bt.innerHTML = `Koniec kursu <small>${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')} · ${km} km</small>`;
        } else if (state !== 'saved') bt.innerHTML = 'Kurs zapisany <small>23 min · 9,4 km</small>';
        state = s;
      },
    };
  }

  const makers = { hero: heroScene, meter: meterScene, track: trackScene, bubble: bubbleScene };
  const scenes = [...document.querySelectorAll('[data-scene]')].map((sec) => {
    const s = makers[sec.dataset.scene](sec);
    return Object.assign(s, { sec, p: 0, target: 0 });
  });

  function measure() {
    for (const s of scenes) {
      const r = s.sec.getBoundingClientRect();
      const span = r.height - vh;
      s.visible = r.bottom > -50 && r.top < vh + 50;
      s.target = span > 0 ? clamp(-r.top / span) : 0;
    }
  }

  // Statyczna wersja: każda scena pokazuje swój kluczowy kadr
  if (RM) {
    const still = { hero: 0.45, meter: 1, track: 0, bubble: 0.6 };
    scenes.forEach((s) => s.render(still[s.sec.dataset.scene]));
    addEventListener('resize', () => { vw = innerWidth; vh = innerHeight; scenes.forEach((s) => { s.resize(); s.render(still[s.sec.dataset.scene]); }); });
    return;
  }

  let running = false;
  function frame() {
    measure();
    let moving = false;
    for (const s of scenes) {
      const d = s.target - s.p;
      s.p = Math.abs(d) < 0.0004 ? s.target : s.p + d * 0.14;
      if (s.p !== s.target) moving = true;
      if (s.visible && (s.p !== s.last)) { s.render(s.p); s.last = s.p; }
    }
    running = moving;
    if (moving) requestAnimationFrame(frame);
  }
  const kick = () => { if (!running) { running = true; requestAnimationFrame(frame); } };

  const top = document.getElementById('top');
  addEventListener('scroll', () => { top.classList.toggle('solid', scrollY > 40); kick(); }, { passive: true });
  addEventListener('resize', () => {
    vw = innerWidth; vh = innerHeight;
    scenes.forEach((s) => { s.resize(); s.last = -1; });
    kick();
  });
  document.fonts && document.fonts.ready.then(() => { scenes.forEach((s) => { s.resize(); s.last = -1; }); kick(); });

  measure();
  scenes.forEach((s) => { s.p = s.target; s.render(s.p); s.last = s.p; });
  top.classList.toggle('solid', scrollY > 40);
})();
