/* ═══════════════════════════════════════════
   PLAYER.JS — Custom YouTube player controller
   PS browser compatible: no async/await,
   no optional chaining, XHR-safe
═══════════════════════════════════════════ */

var ytPlayer         = null;
var isPlaying        = false;
var progressInterval = null;

/* ── Load YT IFrame API ──────────────────── */
function loadYTAPI() {
  var tag  = document.createElement('script');
  tag.src  = 'https://www.youtube.com/iframe_api';
  var first = document.getElementsByTagName('script')[0];
  first.parentNode.insertBefore(tag, first);
}

/* ── Called by YT when API is ready ─────── */
window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player('ytPlayer', {
    events: {
      onReady:       onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
};

function onPlayerReady(event) {
  var slider = document.getElementById('volumeSlider');
  if (slider && ytPlayer && ytPlayer.getVolume) {
    slider.value = ytPlayer.getVolume();
  }
}

function onPlayerStateChange(event) {
  var playIcon = document.getElementById('playIcon');
  var overlay  = document.getElementById('videoOverlay');

  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    if (playIcon) playIcon.textContent = '\u23F8';
    if (overlay)  overlay.className = 'video-overlay hidden';
    startProgressPoll();
  } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
    isPlaying = false;
    if (playIcon) playIcon.textContent = '\u25B6';
    stopProgressPoll();
  }
}

/* ── Progress polling ────────────────────── */
function startProgressPoll() {
  stopProgressPoll();
  progressInterval = setInterval(updateProgress, 500);
}

function stopProgressPoll() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

function updateProgress() {
  if (!ytPlayer || !ytPlayer.getCurrentTime) return;

  var current  = ytPlayer.getCurrentTime();
  var duration = ytPlayer.getDuration();
  var pct      = (duration > 0) ? (current / duration) * 100 : 0;

  var fill    = document.getElementById('progressFill');
  var thumb   = document.getElementById('progressThumb');
  var timeCur = document.getElementById('timeCurrent');
  var timeDur = document.getElementById('timeDuration');

  if (fill)    fill.style.width  = pct + '%';
  if (thumb)   thumb.style.left  = pct + '%';
  if (timeCur) timeCur.textContent = formatTime(current);
  if (timeDur) timeDur.textContent = formatTime(duration);
}

function formatTime(secs) {
  if (isNaN(secs) || secs < 0) return '0:00';
  var m = Math.floor(secs / 60);
  var s = Math.floor(secs % 60);
  return m + ':' + (s < 10 ? '0' + s : s);
}

/* ── Orientation lock ────────────────────── */
function lockLandscape() {
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').then(function () {}).catch(function () {});
  }
}

function unlockOrientation() {
  if (screen.orientation && screen.orientation.unlock) {
    screen.orientation.unlock();
  }
}

/* ── Bind all controls ───────────────────── */
function bindControls() {

  /* Play/Pause button */
  var playPauseBtn = document.getElementById('playPauseBtn');
  if (playPauseBtn) {
    playPauseBtn.onclick = function () {
      if (!ytPlayer) return;
      if (isPlaying) { ytPlayer.pauseVideo(); }
      else           { ytPlayer.playVideo();  }
    };
  }

  /* Big play overlay button */
  var bigPlayBtn = document.getElementById('bigPlayBtn');
  if (bigPlayBtn) {
    bigPlayBtn.onclick = function () {
      if (ytPlayer) ytPlayer.playVideo();
    };
  }

  /* Click overlay background to play */
  var videoOverlay = document.getElementById('videoOverlay');
  if (videoOverlay) {
    videoOverlay.onclick = function (e) {
      if (e.target === videoOverlay && ytPlayer) ytPlayer.playVideo();
    };
  }

  /* Mute button */
  var muteBtn  = document.getElementById('muteBtn');
  var muteIcon = document.getElementById('muteIcon');
  if (muteBtn) {
    muteBtn.onclick = function () {
      if (!ytPlayer) return;
      if (ytPlayer.isMuted()) {
        ytPlayer.unMute();
        if (muteIcon) muteIcon.textContent = '\uD83D\uDD0A';
      } else {
        ytPlayer.mute();
        if (muteIcon) muteIcon.textContent = '\uD83D\uDD07';
      }
    };
  }

  /* Volume slider */
  var volumeSlider = document.getElementById('volumeSlider');
  if (volumeSlider) {
    volumeSlider.oninput = function () {
      if (!ytPlayer) return;
      var vol = Number(volumeSlider.value);
      ytPlayer.setVolume(vol);
      var muteIconEl = document.getElementById('muteIcon');
      if (muteIconEl) muteIconEl.textContent = vol === 0 ? '\uD83D\uDD07' : '\uD83D\uDD0A';
    };
  }

  /* Progress bar seek */
  var progressTrack = document.querySelector('.progress-track');
  if (progressTrack) {
    progressTrack.onclick = function (e) {
      if (!ytPlayer || !ytPlayer.getDuration) return;
      var rect = progressTrack.getBoundingClientRect();
      var pct  = (e.clientX - rect.left) / rect.width;
      ytPlayer.seekTo(pct * ytPlayer.getDuration(), true);
      updateProgress();
    };
  }

  /* Fullscreen + landscape lock */
  var fullscreenBtn  = document.getElementById('fullscreenBtn');
  var videoContainer = document.getElementById('videoContainer');

  if (fullscreenBtn && videoContainer) {
    fullscreenBtn.onclick = function () {
      if (!document.fullscreenElement) {
        if (videoContainer.requestFullscreen) {
          videoContainer.requestFullscreen().then(function () {}).catch(function (err) {
            console.warn('Fullscreen error:', err);
          });
        } else if (videoContainer.webkitRequestFullscreen) {
          /* Safari / older WebKit */
          videoContainer.webkitRequestFullscreen();
        } else if (videoContainer.mozRequestFullScreen) {
          videoContainer.mozRequestFullScreen();
        }
      } else {
        if (document.exitFullscreen)       document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.mozCancelFullScreen)  document.mozCancelFullScreen();
      }
    };

    /* Lock landscape on fullscreen enter, unlock on exit */
    function onFullscreenChange() {
      var fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;
      if (fsEl === videoContainer) {
        lockLandscape();
      } else {
        unlockOrientation();
      }
    }

    document.addEventListener('fullscreenchange',       onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange',    onFullscreenChange);
  }
}

/* ── Init ────────────────────────────────── */
function initPlayer() {
  loadYTAPI();
  bindControls();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlayer);
} else {
  initPlayer();
}
