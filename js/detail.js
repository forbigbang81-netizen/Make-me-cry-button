/* ═══════════════════════════════════════════
   DETAIL.JS — Detail page logic
   Fetches anime info + handles cry modal
═══════════════════════════════════════════ */

const EDGERUNNERS_ID = 42310;
const JIKAN_BASE = 'https://api.jikan.moe/v4';

/* ── Cry content ─────────────────────────── */
const CRY_MOMENTS = [
  {
    ep: 'EPISODE 10 — SPOILER WARNING',
    title: 'THIS IS WHY WE SUFFER',
    quote: '"I love you, Lucy. I love you, choom."',
    body: [
      'He made it. For one impossible moment — David Martinez made it to the Moon.',
      'But Night City doesn\'t give you happy endings. It takes the ones who burn brightest and it doesn\'t stop until there\'s nothing left.',
      'Maine warned him. Lucy begged him. Everyone who loved him watched him dissolve into chrome and ruin. And still — he smiled.',
    ],
  },
  {
    ep: 'EPISODE 8 — THE FALL BEGINS',
    title: 'EVERYONE WARNED YOU',
    quote: '"Being an Edgerunner is a death sentence. You know that, right?"',
    body: [
      'You watched it happen in slow motion. The cyberpsychosis. The implants. The way he kept pushing past every limit because he thought love was enough armor.',
      'It was never going to be enough.',
      'That\'s what makes it hurt so much — you knew, and you watched anyway.',
    ],
  },
  {
    ep: 'THE WHOLE SERIES',
    title: 'NIGHT CITY NEVER CHANGES',
    quote: '"The city has a way of getting inside you. Changing you."',
    body: [
      '10 episodes. They gave you 10 episodes to fall completely in love with every single one of them.',
      'The city didn\'t care. The city never cares. And somehow that\'s the most honest thing about it.',
      'David went from a kid eating a sandwich on the NCRPD transport to a legend. A ghost. A reason people still say his name in hushed tones.',
      'It was worth it. It always is. That\'s the curse.',
    ],
  },
];

let currentMoment = 0;

function openCryModal() {
  const modal    = document.getElementById('cryModal');
  const backdrop = document.getElementById('modalBackdrop');
  const content  = document.getElementById('modalContent');

  // Cycle through moments
  const moment = CRY_MOMENTS[currentMoment % CRY_MOMENTS.length];
  currentMoment++;

  content.innerHTML = `
    <div class="modal-ep-tag">${moment.ep}</div>
    <div class="modal-title">${moment.title}</div>
    <blockquote class="modal-quote">${moment.quote}</blockquote>
    <div class="modal-body">
      ${moment.body.map(p => `<p>${p}</p>`).join('')}
    </div>
  `;

  modal.classList.add('active');
  backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCryModal() {
  const modal    = document.getElementById('cryModal');
  const backdrop = document.getElementById('modalBackdrop');
  modal.classList.remove('active');
  backdrop.classList.remove('active');
  document.body.style.overflow = '';
}

/* ── Fetch & render anime info ───────────── */
async function fetchAndRender() {
  try {
    // Small delay to respect Jikan rate limits
    await new Promise(r => setTimeout(r, 400));

    const res = await fetch(`${JIKAN_BASE}/anime/${EDGERUNNERS_ID}`);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    const anime = json.data;

    // Poster
    const poster = document.getElementById('animePoster');
    if (poster) {
      poster.src = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
      poster.alt = anime.title_english || anime.title;
    }

    // Title
    const titleEl = document.getElementById('seriesTitle');
    if (titleEl) {
      titleEl.textContent = (anime.title_english || anime.title).toUpperCase();
    }

    // Meta tags
    const eps    = document.getElementById('metaEps');
    const score  = document.getElementById('metaScore');
    const year   = document.getElementById('metaYear');
    const studio = document.getElementById('metaStudio');

    if (eps)    eps.textContent    = anime.episodes ? `${anime.episodes} EPISODES` : 'COMPLETE';
    if (score)  score.textContent  = anime.score    ? `★ ${anime.score} / 10`     : '★ —';
    if (year)   year.textContent   = anime.year     ? `${anime.year}`              : '2022';
    if (studio) studio.textContent = anime.studios?.[0]?.name?.toUpperCase()       || 'TRIGGER';

    // Synopsis
    const synopsisEl = document.getElementById('seriesSynopsis');
    if (synopsisEl && anime.synopsis) {
      // Trim and strip the (Source: ...) bit
      const clean = anime.synopsis
        .replace(/\[Written by.*?\]/gi, '')
        .replace(/\(Source:.*?\)/gi, '')
        .trim();
      synopsisEl.textContent = clean;
    }
  } catch (err) {
    console.error('Failed to fetch anime data:', err);
    // Fallback static data
    const titleEl = document.getElementById('seriesTitle');
    if (titleEl) titleEl.textContent = 'CYBERPUNK: EDGERUNNERS';

    const synopsisEl = document.getElementById('seriesSynopsis');
    if (synopsisEl) {
      synopsisEl.textContent =
        'In a dystopian Night City, a street kid struggles to survive after losing his family to tragedy. Determined to fulfill his mother\'s wish, he turns to a life of crime as an Edgerunner — a mercenary outlaw. But Night City has a price for everything.';
    }

    const eps    = document.getElementById('metaEps');
    const score  = document.getElementById('metaScore');
    const year   = document.getElementById('metaYear');
    const studio = document.getElementById('metaStudio');

    if (eps)    eps.textContent    = '10 EPISODES';
    if (score)  score.textContent  = '★ 8.71 / 10';
    if (year)   year.textContent   = '2022';
    if (studio) studio.textContent = 'TRIGGER';
  }
}

/* ── Init ────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  fetchAndRender();

  // Cry button
  const cryBtn = document.getElementById('cryBtn');
  if (cryBtn) cryBtn.addEventListener('click', openCryModal);

  // Close modal
  const closeBtn = document.getElementById('modalClose');
  if (closeBtn) closeBtn.addEventListener('click', closeCryModal);

  const backdrop = document.getElementById('modalBackdrop');
  if (backdrop) backdrop.addEventListener('click', closeCryModal);

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCryModal();
  });
});
