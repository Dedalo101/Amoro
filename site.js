// Mixcloud embeds + contact bubble behavior
// Source: https://www.mixcloud.com/amooro/

const CONTACT_EMAIL = 'GlueRecords@revamail.com';

const FEATURED_SHOW = {
  title: 'AMORO - TRICKS OR TREAT?',
  url: 'https://www.mixcloud.com/amooro/amoro-tricks-or-treat/'
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

// Extracted from Mixcloud profile (All shows)
const SHOWS = [
  { title: 'Amoro - Sticky fingers', url: 'https://www.mixcloud.com/amooro/deep-fingers/', art: 'https://thumbnailer.mixcloud.com/unsafe/120x120/extaudio/7/c/9/8/da36-f137-4765-9d1d-c8959886eb15' },
  { title: 'AMORO - TRICKS OR TREAT?', url: 'https://www.mixcloud.com/amooro/amoro-tricks-or-treat/', art: 'https://thumbnailer.mixcloud.com/unsafe/120x120/extaudio/7/1/e/8/d88c-79f0-418c-bc1d-77887a0df249' },
  { title: 'A M O R O - P A S S P O R T', url: 'https://www.mixcloud.com/amooro/a-m-o-r-o-p-a-s-s-p-o-r-t/', art: 'https://thumbnailer.mixcloud.com/unsafe/120x120/extaudio/c/7/7/f/05be-b85d-4a59-8506-23ebe6090199' },
  { title: 'A M O R O - D A C I D', url: 'https://www.mixcloud.com/amooro/a-m-o-r-o-d-a-c-i-d/', art: 'https://thumbnailer.mixcloud.com/unsafe/120x120/extaudio/7/d/a/5/33db-f2ec-481c-9e6f-76284740a499' },
  { title: 'Ⲁ Ⲙ Ⲟ Ꞅ Ⲟ - S T R A W B E R R Y M O O N 023*', url: 'https://www.mixcloud.com/amooro/%E2%B2%81-%E2%B2%99-%E2%B2%9F-%EA%9E%85-%E2%B2%9F-s-t-r-a-w-b-e-r-r-y-m-o-o-n-023/', art: 'https://thumbnailer.mixcloud.com/unsafe/120x120/extaudio/9/c/d/6/91d4-a424-46d4-a820-191cb435f21f' },
  { title: 'A M O R O - D A R K F A C E', url: 'https://www.mixcloud.com/amooro/a-m-o-r-o-d-a-r-k-f-a-c-e/', art: 'https://thumbnailer.mixcloud.com/unsafe/120x120/extaudio/6/7/9/2/473c-8fa7-47da-9727-8c96ded4a83b' },
  { title: 'W E L C O M E S U N R I S E [chapterONE]', url: 'https://www.mixcloud.com/amooro/w-e-l-c-o-m-e-s-u-n-r-i-s-e-chapterone/', art: 'https://thumbnailer.mixcloud.com/unsafe/120x120/extaudio/c/1/7/b/05c3-912f-4842-9627-36f56e288980' },
  { title: 'A M O R O - 7.609.', url: 'https://www.mixcloud.com/amooro/a-m-o-r-o-7609/', art: 'https://thumbnailer.mixcloud.com/unsafe/120x120/extaudio/b/9/0/4/7267-175b-4296-9976-a4f1546d0987' },
  { title: 'A M O R O - S O C O L', url: 'https://www.mixcloud.com/amooro/a-m-o-r-o-s-o-c-o-l/', art: 'https://thumbnailer.mixcloud.com/unsafe/120x120/extaudio/f/1/3/b/d661-8439-4bfc-aa61-76fe171567ed' }
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

function mixcloudEmbedSrc(showUrl, autoplay = false) {
  const feed = encodeURIComponent(showKey(showUrl));
  const autoplayParam = autoplay ? '&autoplay=1' : '';
  return `https://www.mixcloud.com/widget/iframe/?hide_cover=1&light=1&feed=${feed}${autoplayParam}`;
}

function findSetCard(showUrl) {
  return [...document.querySelectorAll('.setCard')].find((card) => card.dataset.showUrl === showUrl) || null;
}

function pauseOtherPlayers(exceptIframe) {
  for (const iframe of document.querySelectorAll('.mixcloudFrame')) {
    if (iframe === exceptIframe) continue;
    iframe.src = 'about:blank';
  }
}

function playShow(showUrl) {
  const card = findSetCard(showUrl);
  const iframe = card?.querySelector('.mixcloudFrame');
  if (!iframe) return;

  pauseOtherPlayers(iframe);
  iframe.src = mixcloudEmbedSrc(showUrl, true);
  iframe.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function bindSetCardsToPlayer() {
  const root = document.getElementById('mixcloudSets');
  if (!root) return;

  root.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-show-url]');
    if (!trigger || e.target.closest('.mixcloudFrame')) return;
    e.preventDefault();
    playShow(trigger.dataset.showUrl);
  });
}

function tryAutoplayFeatured() {
  const kick = () => playShow(FEATURED_SHOW.url);

  const unlock = () => {
    kick();
    document.removeEventListener('pointerdown', unlock);
    document.removeEventListener('keydown', unlock);
    document.removeEventListener('touchstart', unlock);
  };

  document.addEventListener('pointerdown', unlock, { once: true });
  document.addEventListener('keydown', unlock, { once: true });
  document.addEventListener('touchstart', unlock, { once: true, passive: true });
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

    if (show.art) {
      const coverBtn = document.createElement('button');
      coverBtn.type = 'button';
      coverBtn.className = 'setCover';
      coverBtn.dataset.showUrl = show.url;
      coverBtn.setAttribute('aria-label', `Play ${show.title}`);

      const art = document.createElement('img');
      art.className = 'setArt';
      art.src = show.art;
      art.alt = show.title;
      art.loading = 'lazy';
      art.decoding = 'async';

      coverBtn.appendChild(art);
      card.appendChild(coverBtn);
    }

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

    const iframe = document.createElement('iframe');
    iframe.className = 'mixcloudFrame';
    iframe.allow = 'autoplay';
    iframe.loading = 'lazy';
    iframe.src = mixcloudEmbedSrc(show.url);
    iframe.title = `${show.title} player`;
    card.appendChild(iframe);

    frag.appendChild(card);
  }

  root.innerHTML = '';
  root.appendChild(frag);

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
  renderShows();
  bindSetCardsToPlayer();
  tryAutoplayFeatured();
  initContactBubble();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}