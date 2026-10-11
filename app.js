// navigazione tra le note tipo obsidian
const notes = [...document.querySelectorAll('.note')];
const byId = Object.fromEntries(notes.map(n => [n.id, n]));
const sideLinks = [...document.querySelectorAll('aside a')];
const aside = document.querySelector('aside');
const menu = document.getElementById('menu');
const preview = document.getElementById('preview');

// chi cita chi (serve per i backlink e per il grafo)
const links = {};
notes.forEach(n => {
  n.querySelectorAll('a.link').forEach(a => {
    const to = a.getAttribute('href').slice(1);
    if (to !== n.id && byId[to]) (links[n.id] ||= new Set()).add(to);
  });
});

function title(id) { return byId[id].dataset.title || byId[id].querySelector('h1').textContent; }

function open() {
  let id = location.hash.slice(1);
  if (!byId[id]) id = 'home';
  notes.forEach(n => n.classList.toggle('open', n.id === id));
  sideLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));

  const note = byId[id];
  note.querySelector('.backlinks')?.remove();
  const from = Object.keys(links).filter(k => links[k].has(id));
  if (from.length && id !== 'grafo') {
    const div = document.createElement('div');
    div.className = 'backlinks';
    div.innerHTML = 'Citata in: ' + from.map(k => `<a class="link" href="#${k}">${title(k)}</a>`).join('');
    note.appendChild(div);
    hover(div);
  }
  document.title = title(id) + ' | DB scuola';
  aside.classList.remove('show');
  menu.textContent = 'Menu';
  preview.style.display = 'none';
  window.scrollTo(0, 0);
  if (id === 'grafo') drawGraph();
}

// anteprima quando passi sopra un link
function hover(root) {
  if (matchMedia('(hover: none)').matches) return;
  root.querySelectorAll('a.link').forEach(a => {
    a.addEventListener('mouseenter', () => {
      const n = byId[a.getAttribute('href').slice(1)];
      if (!n) return;
      const p = n.querySelector('p');
      preview.innerHTML = `<b>${title(n.id)}</b>${p ? p.textContent : ''}`;
      preview.style.display = 'block';
      const r = a.getBoundingClientRect();
      let y = r.bottom + 8;
      if (y + preview.offsetHeight > innerHeight) y = r.top - preview.offsetHeight - 8;
      preview.style.left = Math.max(8, Math.min(r.left, innerWidth - preview.offsetWidth - 12)) + 'px';
      preview.style.top = y + 'px';
    });
    a.addEventListener('mouseleave', () => preview.style.display = 'none');
  });
}

// ricerca nella sidebar
document.getElementById('search').addEventListener('input', e => {
  const q = e.target.value.toLowerCase().trim();
  sideLinks.forEach(a => {
    const n = byId[a.getAttribute('href').slice(1)];
    const hit = !q || n.textContent.toLowerCase().includes(q);
    a.classList.toggle('hidden', !hit);
  });
});

// tema chiaro / scuro
const themeBtn = document.getElementById('theme');
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  themeBtn.textContent = t === 'dark' ? '☀' : '☾';
  try { localStorage.setItem('tema', t); } catch (e) {}
}
let saved = null;
try { saved = localStorage.getItem('tema'); } catch (e) {}
setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
themeBtn.addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  if (location.hash === '#grafo') drawGraph();
});

menu.addEventListener('click', () => {
  const s = aside.classList.toggle('show');
  menu.textContent = s ? 'Chiudi' : 'Menu';
});

// ---------- vista a grafo ----------
let raf = null;
function drawGraph() {
  const canvas = document.getElementById('graph');
  const ctx = canvas.getContext('2d');
  const dpr = devicePixelRatio || 1;
  const W = canvas.clientWidth, H = canvas.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const css = getComputedStyle(document.documentElement);
  const col = { text: css.getPropertyValue('--text'), line: css.getPropertyValue('--border'), acc: css.getPropertyValue('--accent'), mut: css.getPropertyValue('--muted') };

  const ids = notes.map(n => n.id).filter(id => id !== 'grafo');
  const nodes = ids.map((id, i) => ({
    id, x: W / 2 + Math.cos(i) * 150 + Math.random() * 20, y: H / 2 + Math.sin(i) * 150 + Math.random() * 20,
    vx: 0, vy: 0, step: byId[id].dataset.step === '1'
  }));
  const idx = Object.fromEntries(nodes.map((n, i) => [n.id, i]));
  const edges = [];
  Object.keys(links).forEach(a => links[a].forEach(b => { if (idx[a] != null && idx[b] != null) edges.push([idx[a], idx[b]]); }));
  const deg = nodes.map((_, i) => edges.filter(e => e[0] === i || e[1] === i).length);

  let drag = null, hoverN = null, t = 0;
  function tick() {
    if (t < 400) {
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        let dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy || 1;
        const f = 1800 / d2, d = Math.sqrt(d2);
        a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f;
      }
      edges.forEach(([i, j]) => {
        const a = nodes[i], b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, f = (d - 90) * 0.012;
        a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f;
      });
      nodes.forEach(n => {
        if (n === drag) return;
        n.vx += (W / 2 - n.x) * 0.004; n.vy += (H / 2 - n.y) * 0.004;
        n.x += n.vx *= 0.82; n.y += n.vy *= 0.82;
        n.x = Math.max(20, Math.min(W - 20, n.x)); n.y = Math.max(20, Math.min(H - 20, n.y));
      });
      t++;
    }
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = col.line; ctx.lineWidth = 1;
    edges.forEach(([i, j]) => {
      const lit = hoverN != null && (i === hoverN || j === hoverN);
      ctx.strokeStyle = lit ? col.acc : col.line;
      ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
    });
    nodes.forEach((n, i) => {
      const r = 4 + Math.sqrt(deg[i]) * 2;
      ctx.fillStyle = n.step ? col.acc : col.mut;
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, 7); ctx.fill();
      ctx.fillStyle = col.text; ctx.font = (i === hoverN ? '600 ' : '') + '12px IBM Plex Sans, sans-serif';
      ctx.textAlign = 'center'; ctx.fillText(title(n.id), n.x, n.y + r + 13);
    });
    raf = requestAnimationFrame(tick);
  }
  function at(e) {
    const r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    return nodes.findIndex(n => Math.hypot(n.x - x, n.y - y) < 12);
  }
  let moved = false;
  canvas.onpointerdown = e => { const i = at(e); if (i >= 0) { drag = nodes[i]; moved = false; canvas.setPointerCapture(e.pointerId); } };
  canvas.onpointermove = e => {
    const r = canvas.getBoundingClientRect();
    if (drag) { drag.x = e.clientX - r.left; drag.y = e.clientY - r.top; moved = true; t = Math.min(t, 300); }
    else { const i = at(e); hoverN = i >= 0 ? i : null; canvas.style.cursor = i >= 0 ? 'pointer' : 'grab'; }
  };
  canvas.onpointerup = e => { if (drag && !moved) location.hash = drag.id; drag = null; };

  cancelAnimationFrame(raf);
  tick();
}
addEventListener('hashchange', () => { if (location.hash !== '#grafo') cancelAnimationFrame(raf); open(); });
hover(document.querySelector('main'));
open();
