/* ═══════════════════════════════════════════
   DETAIL.JS — Detail page logic
   PS browser compatible: XHR, no async/await,
   no optional chaining
═══════════════════════════════════════════ */

var EDGERUNNERS_ID = 42310;
var JIKAN_BASE = 'https://api.jikan.moe/v4';

/* ── Fallback static data ────────────────── */
var FALLBACK = {
  title: 'CYBERPUNK: EDGERUNNERS',
  score: '8.71',
  episodes: '10',
  year: '2022',
  studio: 'TRIGGER',
  image: 'https://cdn.myanimelist.net/images/anime/1818/126435l.jpg',
  synopsis: 'In a dystopian Night City, a street kid struggles to survive after losing his family to tragedy. Determined to fulfill his mother\'s wish, he turns to a life of crime as an Edgerunner — a mercenary outlaw. But Night City always takes more than it gives.'
};

/* ── Cry content ─────────────────────────── */
var CRY_MOMENTS = [
  {
    ep: 'EPISODE 10 \u2014 SPOILER WARNING',
    title: 'THIS IS WHY WE SUFFER',
    quote: '\u201cI love you, Lucy. I love you, choom.\u201d',
    body: [
      'He made it. For one impossible moment \u2014 David Martinez made it to the Moon.',
      'But Night City doesn\'t give you happy endings. It takes the ones who burn brightest and doesn\'t stop until there\'s nothing left.',
      'Maine warned him. Lucy begged him. Everyone who loved him watched him dissolve into chrome and ruin. And still \u2014 he smiled.'
    ]
  },
  {
    ep: 'EPISODE 8 \u2014 THE FALL BEGINS',
    title: 'EVERYONE WARNED YOU',
    quote: '\u201cBeing an Edgerunner is a death sentence. You know that, right?\u201d',
    body: [
      'You watched it happen in slow motion. The cyberpsychosis. The implants. The way he kept pushing past every limit because he thought love was enough armor.',
      'It was never going to be enough.',
      'That\'s what makes it hurt so much \u2014 you knew, and you watched anyway.'
    ]
  },
  {
    ep: 'THE WHOLE SERIES',
    title: 'NIGHT CITY NEVER CHANGES',
    quote: '\u201cThe city has a way of getting inside you. Changing you.\u201d',
    body: [
      '10 episodes. They gave you 10 episodes to fall completely in love with every single one of them.',
      'The city didn\'t care. The city never cares. And somehow that\'s the most honest thing about it.',
      'David went from a kid on the transport to a legend. A ghost. A reason people still say his name in hushed tones.',
      'It was worth it. It always is. That\'s the curse.'
    ]
  }
];

var currentMoment = 0;

function openCryModal() {
  var modal    = document.getElementById('cryModal');
  var backdrop = document.getElementById('modalBackdrop');
  var content  = document.getElementById('modalContent');

  var moment = CRY_MOMENTS[currentMoment % CRY_MOMENTS.length];
  currentMoment++;

  var bodyHTML = '';
  for (var i = 0; i < moment.body.length; i++) {
    bodyHTML += '<p>' + moment.body[i] + '</p>';
  }

  content.innerHTML =
    '<div class="modal-ep-tag">' + moment.ep + '</div>' +
    '<div class="modal-title">' + moment.title + '</div>' +
    '<blockquote class="modal-quote">' + moment.quote + '</blockquote>' +
    '<div class="modal-body">' + bodyHTML + '</div>';

  modal.className    = 'cry-modal active';
  backdrop.className = 'modal-backdrop active';
  document.body.style.overflow = 'hidden';
}

function closeCryModal() {
  var modal    = document.getElementById('cryModal');
  var backdrop = document.getElementById('modalBackdrop');
  modal.className    = 'cry-modal';
  backdrop.className = 'modal-backdrop';
  document.body.style.overflow = '';
}

/* ── Apply data to page ──────────────────── */
function applyAnimeData(anime) {
  var title    = (anime && (anime.title_english || anime.title)) || FALLBACK.title;
  var scoreVal = (anime && anime.score)                          || FALLBACK.score;
  var eps      = (anime && anime.episodes)                       || FALLBACK.episodes;
  var year     = (anime && anime.year)                           || FALLBACK.year;
  var synopsis = (anime && anime.synopsis)                       || FALLBACK.synopsis;

  var studio = FALLBACK.studio;
  if (anime && anime.studios && anime.studios.length > 0 && anime.studios[0].name) {
    studio = anime.studios[0].name.toUpperCase();
  }

  var image = FALLBACK.image;
  if (anime && anime.images && anime.images.jpg) {
    image = anime.images.jpg.large_image_url || anime.images.jpg.image_url || FALLBACK.image;
  }

  // Poster
  var poster = document.getElementById('animePoster');
  if (poster) { poster.src = image; poster.alt = title; }

  // Title
  var titleEl = document.getElementById('seriesTitle');
  if (titleEl) titleEl.textContent = title.toUpperCase();

  // Meta
  var metaEps    = document.getElementById('metaEps');
  var metaScore  = document.getElementById('metaScore');
  var metaYear   = document.getElementById('metaYear');
  var metaStudio = document.getElementById('metaStudio');

  if (metaEps)    metaEps.textContent    = eps + ' EPISODES';
  if (metaScore)  metaScore.textContent  = '\u2605 ' + scoreVal + ' / 10';
  if (metaYear)   metaYear.textContent   = String(year);
  if (metaStudio) metaStudio.textContent = studio;

  // Synopsis — strip source notes
  var cleanSynopsis = synopsis
    .replace(/\[Written by[^\]]*\]/gi, '')
    .replace(/\(Source:[^)]*\)/gi, '')
    .trim();

  var synopsisEl = document.getElementById('seriesSynopsis');
  if (synopsisEl) synopsisEl.textContent = cleanSynopsis;
}

/* ── Fetch via XHR ───────────────────────── */
function fetchAndRender() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', JIKAN_BASE + '/anime/' + EDGERUNNERS_ID, true);
  xhr.timeout = 8000;

  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        var data = JSON.parse(xhr.responseText);
        applyAnimeData(data.data || null);
      } catch (e) {
        applyAnimeData(null);
      }
    } else {
      applyAnimeData(null);
    }
  };

  xhr.ontimeout = function () { applyAnimeData(null); };
  xhr.onerror   = function () { applyAnimeData(null); };

  try {
    xhr.send();
  } catch (e) {
    applyAnimeData(null);
  }
}

/* ── Init ────────────────────────────────── */
function init() {
  fetchAndRender();

  var cryBtn = document.getElementById('cryBtn');
  if (cryBtn) cryBtn.onclick = openCryModal;

  var closeBtn = document.getElementById('modalClose');
  if (closeBtn) closeBtn.onclick = closeCryModal;

  var backdrop = document.getElementById('modalBackdrop');
  if (backdrop) backdrop.onclick = closeCryModal;

  document.onkeydown = function (e) {
    if (e && (e.key === 'Escape' || e.keyCode === 27)) closeCryModal();
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
