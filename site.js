// Mixcloud embeds + contact bubble behavior
// Source: https://www.mixcloud.com/amooro/

const CONTACT_EMAIL = 'GlueRecords@revamail.com';

const FEATURED_SHOW = {
  title: 'AMORO - TRICKS OR TREAT?',
  url: 'https://www.mixcloud.com/amooro/amoro-tricks-or-treat/',
  key: '/amooro/amoro-tricks-or-treat/',
  waveformUrl: 'https://waveform.mixcloud.com/5/d/3/5/29c3-46ee-4ebe-b59e-a3b1054f41bd.json?v=0.1',
  duration: 5131
};

window.AmoroAudio = {
  energy: 0,
  bass: 0,
  mid: 0,
  high: 0,
  beat: 0,
  playing: false,
  position: 0
};

let waveformSamples = null;
let waveformHeight = 1200;
let smoothedEnergy = 0;
let beatPulse = 0;
let mixcloudWidget = null;

// Extracted from Mixcloud profile (All shows)
const SHOWS = [
  { title: 'Amoro - Sticky fingers', url: 'https://www.mixcloud.com/amooro/deep-fingers/' },
  { title: 'AMORO - TRICKS OR TREAT?', url: 'https://www.mixcloud.com/amooro/amoro-tricks-or-treat/' },
  { title: 'A M O R O - P A S S P O R T', url: 'https://www.mixcloud.com/amooro/a-m-o-r-o-p-a-s-s-p-o-r-t/' },
  { title: 'A M O R O - D A C I D', url: 'https://www.mixcloud.com/amooro/a-m-o-r-o-d-a-c-i-d/' },
  { title: 'Ⲁ Ⲙ Ⲟ Ꞅ Ⲟ - S T R A W B E R R Y M O O N 023*', url: 'https://www.mixcloud.com/amooro/%E2%B2%81-%E2%B2%99-%E2%B2%9F-%EA%9E%85-%E2%B2%9F-s-t-r-a-w-b-e-r-r-y-m-o-o-n-023/' },
  { title: 'A M O R O - D A R K F A C E', url: 'https://www.mixcloud.com/amooro/a-m-o-r-o-d-a-r-k-f-a-c-e/' },
  { title: 'W E L C O M E S U N R I S E [chapterONE]', url: 'https://www.mixcloud.com/amooro/w-e-l-c-o-m-e-s-u-n-r-i-s-e-chapterone/' },
  { title: 'A M O R O - 7.609.', url: 'https://www.mixcloud.com/amooro/a-m-o-r-o-7609/' },
  { title: 'A M O R O - S O C O L', url: 'https://www.mixcloud.com/amooro/a-m-o-r-o-s-o-c-o-l/' }
];

const ACCENTS = ['#00FFFF', '#FF00FF', '#FFFF00', '#FF4500', '#9370DB'];

function setAccentFromTime() {
  const idx = Math.floor((Date.now() / 1000) * 0.3) % ACCENTS.length;
  document.documentElement.style.setProperty('--accent', ACCENTS[idx]);
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function showKey(showUrl) {
  return new URL(showUrl).pathname;
}

function playShow(showUrl) {
  if (!mixcloudWidget) return;
  mixcloudWidget.load(showKey(showUrl), true).catch(() => {});
}

function waveformAmplitudeAt(index) {
  if (!waveformSamples || !waveformSamples.length) return 0;
  const clamped = Math.max(0, Math.min(waveformSamples.length - 1, index));
  const pair = waveformSamples[clamped];
  if (!pair) return 0;
  return Math.max(0, (pair[1] - pair[0]) / waveformHeight);
}

function windowAmplitude(centerIndex, radius) {
  let total = 0;
  let count = 0;
  for (let i = centerIndex - radius; i <= centerIndex + radius; i++) {
    total += waveformAmplitudeAt(i);
    count += 1;
  }
  return count ? total / count : 0;
}

function updateAudioState(position, duration, isPlaying) {
  const dur = duration || FEATURED_SHOW.duration;
  const idx = dur > 0 ? Math.floor((position / dur) * (waveformSamples?.length || 0)) : 0;

  let instant = waveformAmplitudeAt(idx);
  let bass = windowAmplitude(idx, 48);
  let mid = windowAmplitude(idx, 16);
  let high = windowAmplitude(idx, 4);

  if (!waveformSamples && isPlaying) {
    instant = 0.3 + 0.22 * Math.abs(Math.sin(position * 0.42));
    bass = 0.28 + 0.2 * Math.abs(Math.sin(position * 0.18));
    mid = 0.32 + 0.18 * Math.abs(Math.sin(position * 0.65));
    high = 0.25 + 0.24 * Math.abs(Math.sin(position * 1.35));
  }

  smoothedEnergy += (instant - smoothedEnergy) * 0.22;
  if (instant > smoothedEnergy * 1.28 + 0.08) {
    beatPulse = 1;
  }
  beatPulse *= 0.86;

  window.AmoroAudio.energy = smoothedEnergy;
  window.AmoroAudio.bass = bass;
  window.AmoroAudio.mid = mid;
  window.AmoroAudio.high = high;
  window.AmoroAudio.beat = beatPulse;
  window.AmoroAudio.playing = !!isPlaying;
  window.AmoroAudio.position = position;
}

async function loadWaveform() {
  try {
    const res = await fetch(FEATURED_SHOW.waveformUrl);
    if (!res.ok) return;
    const json = await res.json();
    waveformSamples = json.data || null;
    waveformHeight = json.height || 1200;
  } catch (_) {
    waveformSamples = null;
  }
}

function tryAutoplay(widget) {
  const start = () => widget.play().catch(() => {});

  widget.load(FEATURED_SHOW.key, true).then(start).catch(start);
  window.setTimeout(start, 350);
  window.setTimeout(start, 1200);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) start();
  });

  const unlock = () => {
    start();
    document.removeEventListener('pointerdown', unlock);
    document.removeEventListener('keydown', unlock);
    document.removeEventListener('touchstart', unlock);
  };
  document.addEventListener('pointerdown', unlock, { once: true });
  document.addEventListener('keydown', unlock, { once: true });
  document.addEventListener('touchstart', unlock, { once: true, passive: true });
}

function initFeaturedPlayer() {
  const iframe = document.getElementById('mixcloudPlayer');
  if (!iframe || typeof Mixcloud === 'undefined' || !Mixcloud.PlayerWidget) return;

  mixcloudWidget = Mixcloud.PlayerWidget(iframe);
  mixcloudWidget.ready.then(() => {
    tryAutoplay(mixcloudWidget);

    mixcloudWidget.events.play.on(() => {
      updateAudioState(window.AmoroAudio.position, FEATURED_SHOW.duration, true);
    });

    mixcloudWidget.events.pause.on(() => {
      window.AmoroAudio.playing = false;
    });

    mixcloudWidget.events.progress.on((position, duration) => {
      updateAudioState(position, duration, true);
    });

    mixcloudWidget.events.ended.on(() => {
      window.AmoroAudio.playing = false;
      window.AmoroAudio.energy = 0;
      window.AmoroAudio.beat = 0;
    });
  });
}

function bindSetCardsToPlayer() {
  const root = document.getElementById('mixcloudSets');
  if (!root) return;

  root.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-show-url]');
    if (!trigger) return;
    e.preventDefault();
    playShow(trigger.dataset.showUrl);
  });
}

function renderShows() {
  const root = document.getElementById('mixcloudSets');
  if (!root) return;

  const shows = shuffleInPlace([...SHOWS]);
  const frag = document.createDocumentFragment();

  for (const show of shows) {
    const card = document.createElement('article');
    card.className = 'setCard';
    card.dataset.showUrl = show.url;
    if (show.url === FEATURED_SHOW.url) card.classList.add('isFeatured');

    const titleRow = document.createElement('div');
    titleRow.className = 'setTitle';

    const nameBtn = document.createElement('button');
    nameBtn.type = 'button';
    nameBtn.className = 'setName';
    nameBtn.dataset.showUrl = show.url;
    nameBtn.dataset.showTitle = show.title;
    nameBtn.textContent = show.title;

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'setPlay';
    playBtn.dataset.showUrl = show.url;
    playBtn.dataset.showTitle = show.title;
    playBtn.setAttribute('aria-label', `Play ${show.title}`);
    playBtn.textContent = 'Play';

    titleRow.appendChild(nameBtn);
    titleRow.appendChild(playBtn);
    card.appendChild(titleRow);

    frag.appendChild(card);
  }

  root.innerHTML = '';
  root.appendChild(frag);

  // Subtle glitch pulse on random cards
  setInterval(() => {
    const cards = root.querySelectorAll('.setCard');
    if (!cards.length) return;
    const pick = cards[Math.floor(Math.random() * cards.length)];
    pick.classList.add('isGlitch');
    setTimeout(() => pick.classList.remove('isGlitch'), 360);
  }, 900);
}

function initContactBubble() {
  const bubble = document.getElementById('contactBubble');
  if (!bubble) return;

  let hops = 0;
  let armed = false;

  const revealContact = () => {
    const titleMount = document.getElementById('contactTitleMount');
    if (titleMount && !titleMount.dataset.ready) {
      const h2 = document.createElement('h2');
      h2.className = 'sectionTitle';
      h2.textContent = 'Contact';
      titleMount.appendChild(h2);
      titleMount.dataset.ready = '1';
    }

    const line = document.querySelector('#contact .contactLine');
    if (line) line.classList.remove('isHidden');
  };

  const teleport = () => {
    const rect = bubble.getBoundingClientRect();
    const pad = 14;

    const maxX = Math.max(pad, window.innerWidth - rect.width - pad);
    const maxY = Math.max(pad, window.innerHeight - rect.height - pad);

    const x = Math.floor(pad + Math.random() * (maxX - pad));
    const y = Math.floor(pad + Math.random() * (maxY - pad));

    bubble.style.opacity = '0';
    setTimeout(() => {
      bubble.style.left = `${x}px`;
      bubble.style.bottom = 'auto';
      bubble.style.top = `${y}px`;
      bubble.style.opacity = '1';
    }, 120);
  };

  const onHover = () => {
    if (armed) return;
    hops += 1;
    teleport();
    if (hops >= 2) {
      armed = true;
      bubble.classList.add('isArmed');
      revealContact();
      bubble.setAttribute('href', '#contact');
      bubble.setAttribute('aria-label', 'Contact');
      bubble.textContent = '@Contact';
    }
  };

  bubble.addEventListener('mouseenter', onHover);

  // Touch devices: treat taps as "hover" until armed, then open mail.
  bubble.addEventListener('click', (e) => {
    if (!armed) {
      e.preventDefault();
      onHover();
    }
  });
}

function initHeader() {
  document.title = 'Ⲁ Ⲙ Ⲟ ꓤ Ⲟ — Never Not Playing';
  setAccentFromTime();
  setInterval(setAccentFromTime, 900);
}

function init() {
  initHeader();
  loadWaveform();
  initFeaturedPlayer();
  renderShows();
  bindSetCardsToPlayer();
  initContactBubble();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
