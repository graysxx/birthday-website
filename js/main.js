document.title = `Happy Birthday, ${RECIPIENT}`;
document.querySelectorAll('[data-name]').forEach(el => el.textContent = RECIPIENT);
document.querySelectorAll('[data-from]').forEach(el => el.textContent = SENDER);

// Age counter
const ageEl = document.querySelector('[data-age-count]');
const ageBox = ageEl.parentElement;
const agePlus = document.querySelector('.age-plus');
const FINAL_TEXT = `that's it, you're ${AGE} now.`;
const wait = ms => new Promise(r => setTimeout(r, ms));

async function runAge() {
  ageEl.textContent = '0';

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    ageEl.textContent = AGE; ageBox.classList.add('done');
    agePlus.textContent = FINAL_TEXT; agePlus.classList.add('show', 'done');
    return;
  }

  agePlus.classList.add('show');  
  await wait(450);

  const dur = Math.min(3600, 1400 + AGE * 50);
  let last = 0;
  await new Promise(resolve => {
    const t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / dur, 1);
      const val = Math.round(AGE * (1 - Math.pow(1 - p, 3)));
      if (val !== last) {
        last = val;
        ageEl.textContent = val;
        agePlus.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }],
          { duration: 160 }
        );
      }
      p < 1 ? requestAnimationFrame(step) : resolve();
    };
    requestAnimationFrame(step);
  });

  ageBox.classList.add('done');      
  await wait(500);
  agePlus.classList.remove('show');    
  await wait(380);
  agePlus.textContent = FINAL_TEXT;    
  agePlus.classList.add('done');
  agePlus.classList.add('show');
}
// Animation
let delay = 0;
document.querySelectorAll('#title [data-text]').forEach(line => {
  [...line.dataset.text].forEach(c => {
    const s = document.createElement('span');
    s.className = 'ch'; s.setAttribute('aria-hidden', 'true');
    s.textContent = c; s.style.animationDelay = (delay += 0.07) + 's';
    line.appendChild(s);
  });
  delay += 0.15;
});

// Popup
const msg = document.getElementById('msgOverlay');
const crav = document.getElementById('cravOverlay');
const thanks = document.getElementById('thanksOverlay');
const overlays = [msg, crav, thanks];
const show = el => { el.classList.add('open'); document.body.classList.add('lock'); el.querySelector('.close').focus({ preventScroll: true }); };
const hide = el => el.classList.remove('open');
const hideAll = () => {
  if (!overlays.some(o => o.classList.contains('open'))) return;
  overlays.forEach(hide);
  document.body.classList.remove('lock');
  document.getElementById('open').focus({ preventScroll: true });
  setTimeout(resetWish, 400);
};

document.getElementById('open').onclick = () => show(msg);
document.getElementById('toCraving').onclick = () => { hide(msg); resetWish(); show(crav); };
document.querySelectorAll('[data-close]').forEach(b => b.onclick = hideAll);
overlays.forEach(o => o.addEventListener('click', e => { if (e.target === o) hideAll(); }));
document.addEventListener('keydown', e => { if (e.key === 'Escape') hideAll(); });

// Wish 
const $ = id => document.getElementById(id);
const customEl = $('custom'), sendBtn = $('send'), hint = $('hint');
const HINT_DEFAULT = 'Write what you want.';

function resetWish() {
  customEl.value = '';
  sendBtn.disabled = true;
  hint.textContent = HINT_DEFAULT;
}
const chosenText = () => customEl.value.trim();
function updateSend() {
  const t = chosenText();
  sendBtn.disabled = !t;
  hint.textContent = t ? 'You wrote: ' + t : HINT_DEFAULT;
}
customEl.addEventListener('input', updateSend);
customEl.addEventListener('keydown', e => { if (e.key === 'Enter' && !sendBtn.disabled) sendBtn.click(); });

// Notification
async function notify(text) {
  const jobs = [];
  if (typeof DISCORD_WEBHOOK === 'string' && DISCORD_WEBHOOK)
    jobs.push(fetch(DISCORD_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Birthday Bot', content: text }), keepalive: true }));
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID)
    jobs.push(fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, { method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }) }));
  const results = await Promise.allSettled(jobs);
  return results.some(r => r.status === 'fulfilled' && r.value.ok);
}

sendBtn.onclick = async () => {
  const t = chosenText();
  if (!t || sendBtn.disabled) return;
  sendBtn.disabled = true;
  hint.textContent = 'Sending...';
  const ok = await notify(`🎂 ${RECIPIENT} wants: ${t}`);
  if (!ok) {
    hint.textContent = 'Oops, it failed to send. Please try again.';
    sendBtn.disabled = !chosenText();
    return;
  }
  document.getElementById('thanksWish').textContent = `🎁 ${t}`;
  hide(crav);
  show(thanks);
};

// Cinematic intro 
const photos = (typeof PHOTOS !== 'undefined' && Array.isArray(PHOTOS)) ? PHOTOS.filter(p => p && p.src) : [];

function buildPhotos() {
  if (!photos.length) return [];
  const wrap = document.getElementById('polaroids');
  const made = ['p1', 'p2', 'p3'].map((cls, i) => {
    const p = photos[i] || photos[0];
    const f = document.createElement('figure');
    f.className = 'polaroid ' + cls;
    const img = new Image();
    img.decoding = 'async'; img.alt = '';
    img.onerror = () => { console.error('[foto] GAGAL load:', img.src, '→ cek path/nama/huruf besar-kecil'); f.remove(); };
    img.onload  = () => console.log('[foto] OK:', img.src);
    img.src = p.src;   // preload 
    f.appendChild(img);
    if (p.caption) { const c = document.createElement('figcaption'); c.textContent = p.caption; f.appendChild(c); }
    wrap.appendChild(f);
    return f;
  });
  const mp = photos[3] || photos[0];
  const mf = document.getElementById('modalPhoto');
  const mi = mf.querySelector('img');
  mi.onerror = () => { console.error('[foto modal] GAGAL load:', mi.src); mf.hidden = true; };
  mi.src = mp.src;
  mf.hidden = false;
  return made;
}

async function intro() {
  const q = s => document.querySelector(s);
  const reveal = el => el.classList.add('in');
  const polaroids = buildPhotos();
  const title = q('#title');

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.rv').forEach(reveal);
    title.classList.add('go');
    polaroids.forEach(reveal);
    return runAge();
  }

  await wait(500);  reveal(q('.top'));                  // label
  await wait(1000); reveal(q('.for'));                  // For Recipent
  await wait(1000); title.classList.add('go');          // Happy Birthday.
  await wait(delay * 1000 + 1200);
  reveal(q('.age'));                                    // Age
  await wait(1100);
  await runAge();
  await wait(700);  reveal(q('.lead'));                 // Paragraph
  await wait(2600); reveal(q('#open')); reveal(q('.bottom'));   // Button + footer
  setTimeout(() => q('#open').classList.remove('rv', 'in'), 1300); 
  await wait(900);  polaroids.forEach(reveal);        
}
intro();