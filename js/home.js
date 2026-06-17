/* ═══════════════════════════════════════════
   HOME.JS — Fetch Edgerunners via Jikan API
   PS browser compatible: no async/await,
   no optional chaining, no arrow fn defaults
═══════════════════════════════════════════ */

var EDGERUNNERS_ID = 42310;
var JIKAN_BASE = 'https://api.jikan.moe/v4';

/* ── Fallback static data (always works) ─── */
var FALLBACK = {
  title_english: 'Cyberpunk: Edgerunners',
  title: 'Cyberpunk: Edgerunners',
  score: 8.71,
  episodes: 10,
  year: 2022,
  studio: 'Trigger',
  image: 'https://cdn.myanimelist.net/images/anime/1818/126435l.jpg'
};

function getImage(anime) {
  if (!anime) return FALLBACK.image;
  if (anime.images && anime.images.jpg) {
    return anime.images.jpg.large_image_url || anime.images.jpg.image_url || FALLBACK.image;
  }
  return FALLBACK.image;
}

function getStudio(anime) {
  if (!anime) return FALLBACK.studio;
  if (anime.studios && anime.studios.length > 0 && anime.studios[0].name) {
    return anime.studios[0].name;
  }
  return FALLBACK.studio;
}

function getYear(anime) {
  if (!anime) return FALLBACK.year;
  if (anime.year) return anime.year;
  if (anime.aired && anime.aired.from) {
    return new Date(anime.aired.from).getFullYear();
  }
  return FALLBACK.year;
}

function buildCard(anime) {
  var title    = (anime && (anime.title_english || anime.title)) || FALLBACK.title_english;
  var image    = getImage(anime);
  var score    = (anime && anime.score) ? '\u2605 ' + anime.score : '\u2605 ' + FALLBACK.score;
  var episodes = (anime && anime.episodes) ? anime.episodes + ' EPS' : FALLBACK.episodes + ' EPS';
  var year     = getYear(anime);
  var studio   = getStudio(anime);

  var card = document.createElement('a');
  card.className = 'anime-card';
  card.href = 'pages/edgerunners.html';
  card.setAttribute('aria-label', 'View ' + title);

  card.innerHTML =
    '<div class="card-img-wrap">' +
      '<img src="' + image + '" alt="' + title + ' key visual" />' +
      '<div class="card-img-overlay"></div>' +
      '<div class="card-corner-tag">FEATURED</div>' +
    '</div>' +
    '<div class="card-body">' +
      '<div class="card-score">' + score + ' &nbsp;&middot;&nbsp; <span class="accent-gold">' + year + '</span></div>' +
      '<div class="card-title">' + title.toUpperCase() + '</div>' +
      '<div class="card-meta">' +
        '<span>' + episodes + '</span>' +
        '<span>' + studio + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="card-cta">ENTER FILE &#9654;</div>';

  return card;
}

function renderCard(anime) {
  var grid = document.getElementById('cardGrid');
  grid.innerHTML = '';
  grid.appendChild(buildCard(anime));
}

function renderFallback() {
  var grid = document.getElementById('cardGrid');
  grid.innerHTML = '';
  grid.appendChild(buildCard(null));
}

function init() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', JIKAN_BASE + '/anime/' + EDGERUNNERS_ID, true);
  xhr.timeout = 8000;

  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        var data = JSON.parse(xhr.responseText);
        renderCard(data.data || null);
      } catch (e) {
        renderFallback();
      }
    } else {
      renderFallback();
    }
  };

  xhr.ontimeout = function () { renderFallback(); };
  xhr.onerror   = function () { renderFallback(); };

  try {
    xhr.send();
  } catch (e) {
    renderFallback();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
