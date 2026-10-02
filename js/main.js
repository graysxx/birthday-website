document.title = `Happy Birthday, ${RECIPIENT}`;
document.querySelectorAll('[data-name]').forEach(el => el.textContent = RECIPIENT);
document.querySelectorAll('[data-from]').forEach(el => el.textContent = SENDER);

// Age counter: 0 → AGE, "+1" tampil selama hitung, lalu berubah jadi pesan akhir
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

  await wait(1600);                    // tunggu .age muncul
  agePlus.classList.add('show');       // "+1" muncul
  await wait(450);

  // hitung naik dengan easing (cepat di awal, melambat di akhir)
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

  ageBox.classList.add('done');        // angka jadi caramel italic
  await wait(500);
  agePlus.classList.remove('show');    // "+1" memudar
  await wait(380);
  agePlus.textContent = FINAL_TEXT;    // ganti teks, lalu muncul lagi (tidak berulang)
  agePlus.classList.add('done');
  agePlus.classList.add('show');
}
runAge();

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
  setTimeout(showCats, 400);
};

document.getElementById('open').onclick = () => show(msg);
document.getElementById('toCraving').onclick = () => { hide(msg); showCats(); show(crav); };
document.querySelectorAll('[data-close]').forEach(b => b.onclick = hideAll);
overlays.forEach(o => o.addEventListener('click', e => { if (e.target === o) hideAll(); }));
document.addEventListener('keydown', e => { if (e.key === 'Escape') hideAll(); });

// Menu
const $ = id => document.getElementById(id);
const catsEl = $('cats'), subEl = $('sub'), chipsEl = $('chips');
const customEl = $('custom'), sendBtn = $('send'), hint = $('hint');
const backBtn = $('back'), cSmall = $('cSmall'), cTitle = $('ctitle'), cText = $('cText');

const HEAD = { small: cSmall.textContent, title: cTitle.textContent, text: cText.textContent };
let category = null;   // Cat object from MENU
let picked = null;     // Item

const animate = el => { el.classList.remove('view-in'); void el.offsetWidth; el.classList.add('view-in'); };

// Cat Menu
MENU.forEach(cat => {
  const b = document.createElement('button');
  b.className = 'cat';
  b.innerHTML = `<span class="ico">${cat.emoji}</span><span><b>${cat.title}</b><small>${cat.desc}</small></span><span class="arr">→</span>`;
  b.onclick = () => showItems(cat);
  catsEl.appendChild(b);
});

function showCats() {
  category = null; picked = null;
  cSmall.textContent = HEAD.small;
  cTitle.textContent = HEAD.title;
  cText.textContent = HEAD.text;
  catsEl.hidden = false; subEl.hidden = true; backBtn.hidden = true;
  animate(catsEl);
}

// Cat item
function showItems(cat) {
  category = cat; picked = null;
  const direct = !!cat.direct;
  cSmall.textContent = direct ? 'Your wish' : 'Birthday Craving';
  cTitle.textContent = cat.title;
  cText.textContent = cat.desc;
  chipsEl.innerHTML = '';
  chipsEl.hidden = direct;
  customEl.value = '';
  customEl.hidden = !direct;
  customEl.placeholder = cat.placeholder || 'Write what you want...';
  customEl.style.marginTop = direct ? '1.4rem' : '';
  sendBtn.disabled = true;
  hint.textContent = direct ? 'Write what you want.' : 'Pick what you want.';

  if (direct) picked = { emoji: cat.emoji, label: '', custom: true };

  cat.items.forEach(item => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.setAttribute('aria-pressed', 'false');
    chip.innerHTML = `<span>${item.emoji}</span>${item.label}`;
    chip.onclick = () => {
      chipsEl.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      picked = item;
      customEl.hidden = !item.custom;
      if (item.custom) { customEl.focus(); }
      updateSend();
    };
    chipsEl.appendChild(chip);
  });

  catsEl.hidden = true; subEl.hidden = false; backBtn.hidden = false;
  animate(subEl);
}

function chosenText() {
  if (!picked) return '';
  return picked.custom ? customEl.value.trim() : picked.label;
}
function updateSend() {
  const t = chosenText();
  sendBtn.disabled = !t;
  hint.textContent = t ? 'You picked ' + t
    : (picked && picked.custom ? 'Write what you want.' : 'Please select.');
}
customEl.addEventListener('input', updateSend);
backBtn.onclick = showCats;

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
  if (!category || !t || sendBtn.disabled) return;
  const emoji = picked.emoji;
  sendBtn.disabled = true;
  hint.textContent = 'Sending...';
  const ok = await notify(`🎂 ${RECIPIENT} Choose ${t} ${emoji} (${category.title})`);
  if (!ok) {
    hint.textContent = 'Oops, it failed to send. Please try again.';
    sendBtn.disabled = !chosenText();
    return;
  }
  document.getElementById('thanksWish').textContent = `${emoji} ${t}`;
  hide(crav);
  show(thanks);
};