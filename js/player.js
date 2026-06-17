/* ═══════════════════════════════════════════
   PLAYER.JS — Custom YouTube player controller
   Uses YouTube IFrame Player API
═══════════════════════════════════════════ */

let ytPlayer = null;
let isPlaying = false;
let progressInterval = null;

// Load YT IFrame API
function loadYTAPI() {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

// Called by YT API when ready
window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player('ytPlayer', {
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
};

function onPlayerReady(event) {
  const slider = document.getElementById('volumeSlider');
  if (slider) {
    slider.value = ytPlayer.getVolume();
  }
}

function onPlayerStateChange(event) {
  const playIcon = document.getElementById('playIcon');
  const overlay  = document.getElementById('videoOverlay');

  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    if (playIcon) playIcon.textContent = '⏸';
    if (overlay) overlay.classList.add('hidden');
    startProgressPoll();
  } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
    isPlaying = false;
    if (playIcon) playIcon.textContent = '▶';
    stopProgressPoll();
  }
}

/* ── Progress polling ────────────────────── */
function startProgressPoll() {
  stopProgressPoll();
  progressInterval = setInterval(updateProgress, 500);
}

function stopProgressPoll() {
  if (progressInterval) clearInterval(progressInterval);
}

function updateProgress() {
  if (!ytPlayer || !ytPlayer.getCurrentTime) return;

  const current  = ytPlayer.getCurrentTime();
  const duration = ytPlayer.getDuration();
  const pct      = duration > 0 ? (current / duration) * 100 : 0;

  const fill   = document.getElementById('progressFill');
  const thumb  = document.getElementById('progressThumb');
  const timeCur = document.getElementById('timeCurrent');
  const timeDur  = document.getElementById('timeDuration');

  if (fill)   fill.style.width = `${pct}%`;
  if (thumb)  thumb.style.left  = `${pct}%`;
  if (timeCur) timeCur.textContent = formatTime(current);
  if (timeDur) timeDur.textContent = formatTime(duration);
}

function formatTime(secs) {
  if (isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ── Control event bindings ──────────────── */
function bindControls() {
  /* Play/Pause button */
  const playPauseBtn = document.getElementById('playPauseBtn');
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      if (!ytPlayer) return;
      if (isPlaying) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    });
  }

  /* Big play overlay button */
  const bigPlayBtn = document.getElementById('bigPlayBtn');
  if (bigPlayBtn) {
    bigPlayBtn.addEventListener('click', () => {
      if (!ytPlayer) return;
      ytPlayer.playVideo();
    });
  }

  /* Click overlay to play */
  const videoOverlay = document.getElementById('videoOverlay');
  if (videoOverlay) {
    videoOverlay.addEventListener('click', (e) => {
      if (e.target === videoOverlay) {
        if (!ytPlayer) return;
        ytPlayer.playVideo();
      }
    });
  }

  /* Mute button */
  const muteBtn  = document.getElementById('muteBtn');
  const muteIcon = document.getElementById('muteIcon');
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      if (!ytPlayer) return;
      if (ytPlayer.isMuted()) {
        ytPlayer.unMute();
        if (muteIcon) muteIcon.textContent = '🔊';
      } else {
        ytPlayer.mute();
        if (muteIcon) muteIcon.textContent = '🔇';
      }
    });
  }

  /* Volume slider */
  const volumeSlider = document.getElementById('volumeSlider');
  if (volumeSlider) {
    volumeSlider.addEventListener('input', () => {
      if (!ytPlayer) return;
      ytPlayer.setVolume(Number(volumeSlider.value));
      const muteIconEl = document.getElementById('muteIcon');
      if (muteIconEl) muteIconEl.textContent = Number(volumeSlider.value) === 0 ? '🔇' : '🔊';
    });
  }

  /* Progress bar seek */
  const progressTrack = document.querySelector('.progress-track');
  if (progressTrack) {
    progressTrack.addEventListener('click', (e) => {
      if (!ytPlayer || !ytPlayer.getDuration) return;
      const rect = progressTrack.getBoundingClientRect();
      const pct  = (e.clientX - rect.left) / rect.width;
      const time = pct * ytPlayer.getDuration();
      ytPlayer.seekTo(time, true);
      updateProgress();
    });
  }

  /* Fullscreen */
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const videoContainer = document.getElementById('videoContainer');
  if (fullscreenBtn && videoContainer) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        videoContainer.requestFullscreen().catch(err => {
          console.warn('Fullscreen error:', err);
        });
      } else {
        document.exitFullscreen();
      }
    });
  }
}

/* ── Init ────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadYTAPI();
  bindControls();
});
