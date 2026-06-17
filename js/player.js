/* ═══════════════════════════════════════════
   PLAYER.JS — Custom YouTube player controller
   PS browser compatible.
   onDetailReady() called by detail.js to
   trigger play + fullscreen after gate.
═══════════════════════════════════════════ */

var ytPlayer         = null;
var ytReady          = false;
var isPlaying        = false;
var progressInterval = null;
var volLevel         = 80;   /* 0-100, step 10 via buttons */
var PIP_COUNT        = 10;
var isFullscreen     = false;

/* ── Load YT IFrame API ──────────────────── */
function loadYTAPI() {
  var tag   = document.createElement('script');
  tag.src   = 'https://www.youtube.com/iframe_api';
  var first = document.getElementsByTagName('script')[0];
  first.parentNode.insertBefore(tag, first);
}

window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player('ytPlayer', {
    events: {
      onReady:       onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
};

function onPlayerReady() {
  ytReady = true;
  ytPlayer.setVolume(volLevel);
  renderPips();
}

function onPlayerStateChange(event) {
  var pbBtn  = document.getElementById('playPauseBtn');
  var status = document.getElementById('titlebarStatus');

  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    if (pbBtn)  { pbBtn.textContent = 'PAUSE'; pbBtn.className = 'ctrl-text-btn active'; }
    if (status) { status.textContent = 'PLAYING'; status.className = 'titlebar-status playing'; }
    startProgressPoll();
  } else {
    isPlaying = false;
    if (pbBtn)  { pbBtn.textContent = 'PLAY'; pbBtn.className = 'ctrl-text-btn'; }
    if (status) { status.textContent = event.data === YT.PlayerState.ENDED ? 'ENDED' : 'PAUSED'; status.className = 'titlebar-status'; }
    if (event.data !== YT.PlayerState.BUFFERING) stopProgressPoll();
  }
}

/* ── Called by detail.js after gate ─────── */
function onDetailReady() {
  function tryPlay() {
    if (ytReady && ytPlayer && ytPlayer.playVideo) {
      ytPlayer.playVideo();
      setTimeout(function () { enterFullscreen(); }, 400);
    } else {
      setTimeout(tryPlay, 200);
    }
  }
  tryPlay();
}

/* ── Progress polling ────────────────────── */
function startProgressPoll() {
  stopProgressPoll();
  progressInterval = setInterval(updateProgress, 500);
}

function stopProgressPoll() {
  if (progressInterval) { clearInterval(progressInterval); progressInterval = null; }
}

function updateProgress() {
  if (!ytPlayer || !ytPlayer.getCurrentTime) return;
  var current  = ytPlayer.getCurrentTime();
  var duration = ytPlayer.getDuration();
  var pct      = duration > 0 ? (current / duration) * 100 : 0;

  var fill  = document.getElementById('scrubberFill');
  var head  = document.getElementById('scrubberHead');
  var tCur  = document.getElementById('timeCurrent');
  var tDur  = document.getElementById('timeDuration');

  if (fill) fill.style.width = pct + '%';
  if (head) head.style.left  = pct + '%';
  if (tCur) tCur.textContent = fmtTime(current);
  if (tDur) tDur.textContent = fmtTime(duration);
}

function fmtTime(s) {
  if (isNaN(s) || s < 0) return '0:00';
  var m = Math.floor(s / 60);
  var sec = Math.floor(s % 60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

/* ── Volume pips ─────────────────────────── */
function renderPips() {
  var wrap = document.getElementById('volPips');
  if (!wrap) return;

  if (wrap.children.length === 0) {
    for (var i = 0; i < PIP_COUNT; i++) {
      var pip = document.createElement('div');
      pip.className = 'vol-pip';
      wrap.appendChild(pip);
    }
  }

  var litCount = Math.round((volLevel / 100) * PIP_COUNT);
  var pips = wrap.children;
  for (var j = 0; j < PIP_COUNT; j++) {
    pips[j].className = j < litCount ? 'vol-pip lit' : 'vol-pip';
  }

  var numEl = document.getElementById('volNum');
  if (numEl) numEl.textContent = volLevel;
}

function setVolume(v) {
  volLevel = Math.max(0, Math.min(100, v));
  if (ytPlayer && ytPlayer.setVolume) ytPlayer.setVolume(volLevel);
  renderPips();
}

/* ── Fullscreen + landscape ──────────────── */
function enterFullscreen() {
  var vc = document.getElementById('videoContainer');
  if (!vc) return;
  if (vc.requestFullscreen)            vc.requestFullscreen().then(function(){}).catch(function(){});
  else if (vc.webkitRequestFullscreen) vc.webkitRequestFullscreen();
  else if (vc.mozRequestFullScreen)    vc.mozRequestFullScreen();
}

function exitFullscreen() {
  if (document.exitFullscreen)            document.exitFullscreen();
  else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  else if (document.mozCancelFullScreen)  document.mozCancelFullScreen();
}

function lockLandscape() {
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').then(function(){}).catch(function(){});
  }
}

function unlockOrientation() {
  if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
}

function onFsChange() {
  var vc  = document.getElementById('videoContainer');
  var fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;
  
  if (fsEl === vc) { 
    isFullscreen = true;
    lockLandscape();
    createFsExitOverlay();
  } else { 
    isFullscreen = false;
    unlockOrientation();
    removeFsExitOverlay();
  }
}

/* ── Fullscreen exit overlay (click anywhere to exit) ─── */
function createFsExitOverlay() {
  var existing = document.getElementById('fsExitOverlay');
  if (existing) return;
  
  var overlay = document.createElement('div');
  overlay.id = 'fsExitOverlay';
  overlay.className = 'fs-exit-overlay';
  overlay.onclick = exitFullscreen;
  
  var vc = document.getElementById('videoContainer');
  if (vc) {
    vc.parentNode.appendChild(overlay);
  }
}

function removeFsExitOverlay() {
  var overlay = document.getElementById('fsExitOverlay');
  if (overlay) overlay.remove();
}

/* ── Block YouTube's native UI overlay ───── */
function createYTBlocker() {
  var blocker = document.getElementById('ytBlocker');
  if (blocker) return;
  
  blocker = document.createElement('div');
  blocker.id = 'ytBlocker';
  blocker.className = 'yt-blocker';
  
  var vc = document.getElementById('videoContainer');
  if (vc) {
    vc.appendChild(blocker);
  }
}

/* ── Keyboard handler for fullscreen exit ── */
function handleKeyDown(e) {
  if (e.key === 'Escape' && isFullscreen) {
    exitFullscreen();
  }
}

/* ── Bind controls ───────────────────────── */
function bindControls() {
  /* Play/Pause */
  var pbBtn = document.getElementById('playPauseBtn');
  if (pbBtn) {
    pbBtn.onclick = function () {
      if (!ytPlayer) return;
      if (isPlaying) ytPlayer.pauseVideo();
      else           ytPlayer.playVideo();
    };
  }

  /* Volume buttons */
  var vd = document.getElementById('volDown');
  var vu = document.getElementById('volUp');
  if (vd) vd.onclick = function () { setVolume(volLevel - 10); };
  if (vu) vu.onclick = function () { setVolume(volLevel + 10); };

  /* Scrubber seek */
  var track = document.getElementById('scrubberTrack');
  if (track) {
    track.onclick = function (e) {
      if (!ytPlayer || !ytPlayer.getDuration) return;
      var rect = track.getBoundingClientRect();
      var pct  = (e.clientX - rect.left) / rect.width;
      ytPlayer.seekTo(pct * ytPlayer.getDuration(), true);
      updateProgress();
    };
  }

  /* Fullscreen button */
  var fsBtn = document.getElementById('fullscreenBtn');
  if (fsBtn) {
    fsBtn.onclick = function () {
      var vc = document.getElementById('videoContainer');
      if (!vc) return;
      var isFs = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;
      if (!isFs) {
        enterFullscreen();
      } else {
        exitFullscreen();
      }
    };
  }

  /* Fullscreen change listeners */
  document.addEventListener('fullscreenchange',       onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);
  document.addEventListener('mozfullscreenchange',    onFsChange);
  
  /* Keyboard listener for ESC key */
  document.addEventListener('keydown', handleKeyDown);
}

/* ── Init ────────────────────────────────── */
function initPlayer() {
  loadYTAPI();
  bindControls();
  renderPips();
  createYTBlocker();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlayer);
} else {
  initPlayer();
}
