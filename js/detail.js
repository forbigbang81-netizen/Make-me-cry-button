/* ═══════════════════════════════════════════
   DETAIL.JS
   Flow:
     1. Page loads → gate screen shown
     2. Jikan fetch runs in background
     3. User clicks MAKE ME CRY
     4. Cry panel fades in over gate
     5. User clicks anywhere → gate fades out,
        video page reveals, video plays + fullscreen
═══════════════════════════════════════════ */

var EDGERUNNERS_ID = 42310;
var JIKAN_BASE     = 'https://api.jikan.moe/v4';

var FALLBACK = {
  title:    'CYBERPUNK: EDGERUNNERS',
  score:    '8.71',
  episodes: '10',
  year:     '2022',
  studio:   'TRIGGER',
  image:    'https://cdn.myanimelist.net/images/anime/1818/126435l.jpg',
  synopsis: 'In a dystopian Night City, a street kid struggles to survive after losing his family to tragedy. Determined to fulfil his mother\'s wish, he turns to a life of crime as an Edgerunner \u2014 a mercenary outlaw. But Night City always takes more than it gives.'
};

var CRY_MOMENTS = [
  {
    ep:    'EPISODE 10 \u2014 SPOILER WARNING',
    title: 'THIS IS WHY WE SUFFER',
    quote: '\u201cI love you, Lucy. I love you, choom.\u201d',
    body: [
      'He made it. For one impossible moment \u2014 David Martinez made it to the Moon.',
      'But Night City doesn\u2019t give you happy endings. It takes the ones who burn brightest and doesn\u2019t stop until there\u2019s nothing left.',
      'Maine warned him. Lucy begged him. Everyone who loved him watched him dissolve into chrome and ruin. And still \u2014 he smiled.'
    ]
  },
  {
    ep:    'EPISODE 8 \u2014 THE FALL BEGINS',
    title: 'EVERYONE WARNED YOU',
    quote: '\u201cBeing an Edgerunner is a death sentence. You know that, right?\u201d',
    body: [
      'You watched it happen in slow motion. The cyberpsychosis. The implants. The way he kept pushing past every limit because he thought love was enough armor.',
      'It was never going to be enough.',
      'That\u2019s what makes it hurt so much \u2014 you knew, and you watched anyway.'
    ]
  },
  {
    ep:    'THE WHOLE SERIES',
    title: 'NIGHT CITY NEVER CHANGES',
    quote: '\u201cThe city has a way of getting inside you. Changing you.\u201d',
    body: [
      '10 episodes. They gave you 10 episodes to fall completely in love with every single one of them.',
      'The city didn\u2019t care. The city never cares. And somehow that\u2019s the most honest thing about it.',
      'David went from a kid on the transport to a legend. A ghost. A reason people still say his name in hushed tones.'
    ]
  }
];

var currentMoment  = 0;
var cryPanelShown  = false;
var animeData      = null;

/* ── Utility ─────────────────────────────── */
function el(id) { return document.getElementById(id); }

/* ── Apply fetched data ──────────────────── */
function applyData(anime) {
  var title    = (anime && (anime.title_english || anime.title)) || FALLBACK.title;
  var score    = (anime && anime.score)    || FALLBACK.score;
  var eps      = (anime && anime.episodes) || FALLBACK.episodes;
  var year     = (anime && anime.year)     || FALLBACK.year;
  var synopsis = (anime && anime.synopsis) || FALLBACK.synopsis;

  var studio = FALLBACK.studio;
  if (anime && anime.studios && anime.studios.length > 0 && anime.studios[0].name) {
    studio = anime.studios[0].name.toUpperCase();
  }

  var image = FALLBACK.image;
  if (anime && anime.images && anime.images.jpg) {
    image = anime.images.jpg.large_image_url || anime.images.jpg.image_url || FALLBACK.image;
  }

  /* Gate background */
  var gateBg = el('gateBg');
  if (gateBg) gateBg.style.backgroundImage = 'url(' + image + ')';

  /* Gate meta */
  var gm = el('gateMeta');
  if (gm) {
    var gEps   = el('gMetaEps');
    var gScore = el('gMetaScore');
    var gYear  = el('gMetaYear');
    if (gEps)   gEps.textContent   = eps + ' EPS';
    if (gScore) gScore.textContent = '\u2605 ' + score;
    if (gYear)  gYear.textContent  = String(year);
  }

  /* Video page info */
  var poster = el('animePoster');
  if (poster) { poster.src = image; poster.alt = title; }

  var titleEl = el('seriesTitle');
  if (titleEl) titleEl.textContent = title.toUpperCase();

  var metaEps    = el('metaEps');
  var metaScore  = el('metaScore');
  var metaYear   = el('metaYear');
  var metaStudio = el('metaStudio');
  if (metaEps)    metaEps.textContent    = eps + ' EPISODES';
  if (metaScore)  metaScore.textContent  = '\u2605 ' + score + ' / 10';
  if (metaYear)   metaYear.textContent   = String(year);
  if (metaStudio) metaStudio.textContent = studio;

  var synEl = el('seriesSynopsis');
  if (synEl) {
    var clean = synopsis
      .replace(/\[Written by[^\]]*\]/gi, '')
      .replace(/\(Source:[^)]*\)/gi, '')
      .trim();
    synEl.textContent = clean;
  }
}

/* ── Fetch ───────────────────────────────── */
function fetchData() {
  var xhr   = new XMLHttpRequest();
  xhr.open('GET', JIKAN_BASE + '/anime/' + EDGERUNNERS_ID, true);
  xhr.timeout = 8000;

  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        var d = JSON.parse(xhr.responseText);
        animeData = d.data || null;
        applyData(animeData);
      } catch (e) { applyData(null); }
    } else { applyData(null); }
  };

  xhr.ontimeout = function () { applyData(null); };
  xhr.onerror   = function () { applyData(null); };
  try { xhr.send(); } catch (e) { applyData(null); }
}

/* ── Launch video + fullscreen ───────────── */
function launchVideo() {
  /* Hide gate */
  var gate = el('gateScreen');
  if (gate) {
    gate.style.transition = 'opacity 0.6s ease';
    gate.style.opacity = '0';
    setTimeout(function () {
      gate.style.display = 'none';
    }, 650);
  }

  /* Show video page */
  var vp = el('videoPage');
  if (vp) vp.className = 'video-page';

  /* Tell player to play + go fullscreen */
  if (typeof onDetailReady === 'function') onDetailReady();
}

/* ── Cry panel ───────────────────────────── */
function showCryPanel() {
  if (cryPanelShown) return;
  cryPanelShown = true;

  var moment = CRY_MOMENTS[currentMoment % CRY_MOMENTS.length];
  currentMoment++;

  var bodyHTML = '';
  for (var i = 0; i < moment.body.length; i++) {
    bodyHTML += '<p>' + moment.body[i] + '</p>';
  }

  var inner = el('gcpInner');
  if (inner) {
    inner.innerHTML =
      '<div class="gcp-ep">'    + moment.ep    + '</div>' +
      '<div class="gcp-title">' + moment.title + '</div>' +
      '<blockquote class="gcp-quote">' + moment.quote + '</blockquote>' +
      '<div class="gcp-body">'  + bodyHTML + '</div>';
  }

  var panel = el('gateCryPanel');
  if (panel) panel.className = 'gate-cry-panel visible';

  /* Click anywhere on panel to continue */
  if (panel) {
    panel.onclick = function () { launchVideo(); };
  }
}

/* ── Init ────────────────────────────────── */
function init() {
  /* Apply fallback immediately so gate BG isn't blank */
  applyData(null);
  /* Then fetch real data */
  fetchData();

  var cryBtn = el('gateCryBtn');
  if (cryBtn) cryBtn.onclick = showCryPanel;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
