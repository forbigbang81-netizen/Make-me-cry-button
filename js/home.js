/* ═══════════════════════════════════════════
   HOME.JS — Fetch Edgerunners via Jikan API
   MAL ID: 42310 (Cyberpunk: Edgerunners)
═══════════════════════════════════════════ */

const EDGERUNNERS_ID = 42310;
const JIKAN_BASE = 'https://api.jikan.moe/v4';

async function fetchEdgerunners() {
  try {
    const res = await fetch(`${JIKAN_BASE}/anime/${EDGERUNNERS_ID}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Failed to fetch from Jikan:', err);
    return null;
  }
}

function buildCard(anime) {
  const title = anime.title_english || anime.title;
  const image = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const score = anime.score ? `★ ${anime.score}` : '★ N/A';
  const episodes = anime.episodes ? `${anime.episodes} EPS` : 'ONGOING';
  const year = anime.year || (anime.aired?.from ? new Date(anime.aired.from).getFullYear() : '—');
  const studio = anime.studios?.[0]?.name || 'UNKNOWN';

  const card = document.createElement('a');
  card.className = 'anime-card';
  card.href = 'pages/edgerunners.html';
  card.setAttribute('aria-label', `View ${title}`);

  card.innerHTML = `
    <div class="card-img-wrap">
      <img src="${image}" alt="${title} key visual" loading="lazy" />
      <div class="card-img-overlay"></div>
      <div class="card-corner-tag">FEATURED</div>
    </div>
    <div class="card-body">
      <div class="card-score">${score} &nbsp;·&nbsp; <span class="accent-gold">${year}</span></div>
      <div class="card-title">${title.toUpperCase()}</div>
      <div class="card-meta">
        <span>${episodes}</span>
        <span>${studio}</span>
      </div>
    </div>
    <div class="card-cta">ENTER FILE ▶</div>
  `;

  return card;
}

async function init() {
  const grid = document.getElementById('cardGrid');
  const anime = await fetchEdgerunners();

  // Remove skeleton
  grid.innerHTML = '';

  if (!anime) {
    grid.innerHTML = `
      <div style="color:var(--dimtext); font-size:0.8rem; letter-spacing:0.1em; padding:2rem 0;">
        [ NEURAL FEED OFFLINE — API UNREACHABLE ]
      </div>`;
    return;
  }

  const card = buildCard(anime);
  grid.appendChild(card);
}

document.addEventListener('DOMContentLoaded', init);
