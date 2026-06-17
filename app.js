// Global State Engine & Target Configuration Asset Setup
const TARGET_ANIME_ID = 42310; 
let nativePlayer = null;
let isPlayerReady = false;
let isControlsLocked = false;
let controlsTimeout = null;
let activePopup = null;
let currentSubtitleTrack = 'off';
let castContext = null;
let isCasting = false;

// Tutorial State Metrics
let tutorialStep = 0;

// Document Object Model Element Array Mapping 
const elements = {
    homepageBg: document.getElementById('homepage-bg'),
    loadingPanel: document.getElementById('loading-panel'),
    animeCard: document.getElementById('anime-card'),
    apiImage: document.getElementById('api-image'),
    cardTitle: document.getElementById('card-title'),
    cardDesc: document.getElementById('card-desc'),
    subpage: document.getElementById('details-subpage'),
    subpageTitle: document.getElementById('subpage-title'),
    cryActionBtn: document.getElementById('cry-action-btn'),
    playerWrapper: document.getElementById('playerWrapper'),
    videoContainer: document.getElementById('videoContainer'),
    iframe: document.getElementById('yt-iframe'),
    clickOverlay: document.getElementById('clickOverlay'),
    topBar: document.getElementById('topBar'),
    controlsBar: document.getElementById('controls-bar'),
    playerTitle: document.getElementById('player-title'),
    btnPlayPause: document.getElementById('btnPlayPause'),
    btnLock: document.getElementById('btnLock'),
    lockOverlay: document.getElementById('lockOverlay'),
    lockToast: document.getElementById('lockToast'),
    timeLabelLeft: document.getElementById('timeLabelLeft'),
    timeLabelRight: document.getElementById('timeLabelRight'),
    progressWrap: document.getElementById('progressWrap'),
    progressBuffer: document.getElementById('progressBuffer'),
    progressFill: document.getElementById('progressFill'),
    progressThumb: document.getElementById('progressThumb'),
    volSlider: document.getElementById('volSlider'),
    btnMute: document.getElementById('btnMute'),
    subPopup: document.getElementById('subPopup'),
    castPopup: document.getElementById('castPopup'),
    btnCast: document.getElementById('btnCast'),
    castDeviceList: document.getElementById('castDeviceList'),
    castStatusText: document.getElementById('castStatusText'),
    flashLeft: document.getElementById('flashLeft'),
    flashRight: document.getElementById('flashRight'),
    centerFlash: document.getElementById('centerFlash'),
    cfPlay: document.getElementById('cfPlay'),
    cfPause: document.getElementById('cfPause'),
    toast: document.getElementById('toast'),
    tutOverlay: document.getElementById('tutorialOverlay'),
    tutPrompt: document.getElementById('tutorialPrompt'),
    tutBubble: document.getElementById('tutorialBubble'),
    tutText: document.getElementById('tutorialText'),
    tutSkipBtn: document.getElementById('tutorialSkip')
};

// Initialize Portal and Local Player Environment
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. CLEAN AND INJECT THE ANIMATED SPACE BACKGROUND SAFELY
    initAnimatedSpaceBackground();

    // 2. FORCE RECOVERY OF MISSING HERO CARD AND INTERACTIVE UTILITIES
    if (elements.loadingPanel) {
        elements.loadingPanel.style.setProperty('display', 'none', 'important');
        elements.loadingPanel.style.opacity = '0';
        elements.loadingPanel.style.pointerEvents = 'none';
    }

    // Eliminate any lingering raw database connecting text blocks
    const textNodes = document.querySelectorAll('div, p, span');
    textNodes.forEach(el => {
        if (el.textContent && el.textContent.includes('Connecting to database')) {
            el.style.setProperty('display', 'none', 'important');
        }
    });

    // Enforce high-visibility stacking context for the anime hero card layout
    if (elements.animeCard) {
        elements.animeCard.style.setProperty('display', 'block', 'important');
        elements.animeCard.style.setProperty('visibility', 'visible', 'important');
        elements.animeCard.style.setProperty('opacity', '1', 'important');
        elements.animeCard.style.setProperty('position', 'relative', 'important');
        elements.animeCard.style.setProperty('z-index', '10', 'important');
    }

    // Restore text strings and fallback visual posters instantly
    if (elements.apiImage) elements.apiImage.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=500";
    if (elements.cardTitle) elements.cardTitle.textContent = "Cyberpunk: Edgerunners";
    if (elements.subpageTitle) elements.subpageTitle.textContent = "Cyberpunk: Edgerunners";
    if (elements.playerTitle) elements.playerTitle.textContent = "Cyberpunk: Edgerunners";

    // Launch onboarding UI sequencing safely
    setTimeout(() => {
        if (elements.tutOverlay) {
            elements.tutOverlay.style.setProperty('display', 'flex', 'important');
            elements.tutOverlay.style.setProperty('z-index', '100', 'important');
        }
    }, 800);

    // 3. RUN CORE STREAMS
    fetchAnimeMetadata();
    initNativePlayer();
    initCastFramework();
    setupInteractiveEventListeners();
});

// Creates an isolated space starfield layout that will never swallow or wipe out your HTML elements
function initAnimatedSpaceBackground() {
    // Look for background wrapper container; if missing, build on document container base layer
    let container = elements.homepageBg || document.body;

    // Create a standalone canvas element dynamically
    const spaceCanvas = document.createElement('canvas');
    spaceCanvas.id = "dynamic-space-canvas";
    spaceCanvas.style.position = 'fixed';
    spaceCanvas.style.top = '0';
    spaceCanvas.style.left = '0';
    spaceCanvas.style.width = '100vw';
    spaceCanvas.style.height = '100vh';
    spaceCanvas.style.zIndex = '-1'; // Pushes it directly behind all cards and wrappers
    spaceCanvas.style.backgroundColor = '#07070c';
    spaceCanvas.style.pointerEvents = 'none';

    // Safely insert it as the first background item rather than wiping the innerHTML container clean
    document.body.prepend(spaceCanvas);

    const ctx = spaceCanvas.getContext('2d');
    let stars = [];
    const starCount = 100;

    function resizeCanvas() {
        spaceCanvas.width = window.innerWidth;
        spaceCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate coordinate properties for space matrix items
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            radius: Math.random() * 1.5 + 0.3,
            velocity: Math.random() * 0.3 + 0.05,
            opacity: Math.random() * 0.8 + 0.2,
            fadeDirection: Math.random() > 0.5 ? 1 : -1
        });
    }

    // High performance animation loop
    function animateSpace() {
        ctx.clearRect(0, 0, spaceCanvas.width, spaceCanvas.height);
        
        for (let i = 0; i < starCount; i++) {
            let s = stars[i];
            
            // Apply floating drift velocity upward
            s.y -= s.velocity;
            if (s.y < 0) {
                s.y = spaceCanvas.height;
                s.x = Math.random() * spaceCanvas.width;
            }

            // Simulates smooth shimmering star glows
            s.opacity += 0.008 * s.fadeDirection;
            if (s.opacity > 0.95 || s.opacity < 0.15) {
                s.fadeDirection *= -1;
            }

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
            ctx.fill();
        }
        requestAnimationFrame(animateSpace);
    }
    animateSpace();
}

// Fetches background backups as fallback layers seamlessly
async function fetchAnimeMetadata() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
        const randomPage = Math.floor(Math.random() * 5) + 1;
        const response = await fetch(`https://api.jikan.moe/v4/top/anime?page=${randomPage}&limit=10`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('Pipeline fallback stream closed');
        const { data } = await response.json();

        if (data && data.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.length);
            console.log(`Async asset core parsed content match: ${data[randomIndex].title}`);
        }
    } catch (err) {
        clearTimeout(timeoutId);
        console.warn("Keeping active runtime animated space canvas intact.");
    }
}

function handleTutorialChoice(wantsTutorial) {
    if (elements.tutPrompt) elements.tutPrompt.style.display = 'none';
    if (wantsTutorial) {
        if (elements.tutOverlay) elements.tutOverlay.style.display = 'initial';
        startTutorialSequence();
    } else {
        terminateTutorial();
    }
}

function startTutorialSequence() {
    tutorialStep = 1;
    if (elements.tutBubble) {
        elements.tutBubble.style.display = 'block';
        elements.tutBubble.style.zIndex = '150';
    }
    if (elements.tutText) elements.tutText.textContent = "Click the card";
    if (elements.tutSkipBtn) elements.tutSkipBtn.style.display = 'none';
    
    positionTutorialBubble();
    if (elements.animeCard) elements.animeCard.classList.add('tutorial-spotlight');
}

function positionTutorialBubble() {
    if (!elements.tutBubble) return;
    if (tutorialStep === 1 && elements.animeCard) {
        const cardRect = elements.animeCard.getBoundingClientRect();
        const bubbleWidth = 280;
        let left = cardRect.left + (cardRect.width / 2) - (bubbleWidth / 2);
        let top = cardRect.top - 70;
        if (left < 10) left = 10;
        if (top < 10) top = 10;
        elements.tutBubble.style.top = `${top + window.scrollY}px`;
        elements.tutBubble.style.left = `${left}px`;
    } else if (tutorialStep === 2) {
        const bubbleWidth = 280;
        let left = (window.innerWidth / 2) - (bubbleWidth / 2);
        if (left < 10) left = 10;
        elements.tutBubble.style.top = `75px`;
        elements.tutBubble.style.left = `${left}px`;
    }
}

function terminateTutorial() {
    tutorialStep = 0;
    if (elements.tutOverlay) elements.tutOverlay.style.display = 'none';
    if (elements.tutPrompt) elements.tutPrompt.style.display = 'block'; 
    if (elements.tutBubble) elements.tutBubble.style.display = 'none';
    if (elements.animeCard) elements.animeCard.classList.remove('tutorial-spotlight');
    if (elements.cryActionBtn) elements.cryActionBtn.classList.remove('tutorial-spotlight');
}

function initNativePlayer() {
    nativePlayer = elements.iframe;
    isPlayerReady = true;
    if (!nativePlayer) return;

    nativePlayer.addEventListener('play', () => {
        updatePlayPauseButton(true);
        resetControlsTimeout();
    });
    nativePlayer.addEventListener('pause', () => {
        updatePlayPauseButton(false);
        showControlsBar(); 
    });
    if (elements.volSlider) nativePlayer.volume = elements.volSlider.value / 100;
    startTrackingProgressLoop();
}

function openSubpage() {
    if (elements.subpage) {
        elements.subpage.style.setProperty('display', 'block', 'important');
        elements.subpage.style.setProperty('z-index', '50', 'important');
    }
    document.body.style.overflow = 'hidden';

    if (tutorialStep === 1) {
        if (elements.animeCard) elements.animeCard.classList.remove('tutorial-spotlight');
        tutorialStep = 2;
        if (elements.tutText) elements.tutText.textContent = "Click make me cry button and cry!";
        if (elements.tutSkipBtn) elements.tutSkipBtn.style.display = 'inline-block';
        if (elements.tutOverlay) elements.tutOverlay.style.display = 'block';
        
        setTimeout(() => {
            positionTutorialBubble();
            if (elements.tutOverlay) elements.tutOverlay.style.display = 'initial';
            if (elements.cryActionBtn) elements.cryActionBtn.classList.add('tutorial-spotlight');
        }, 350);
    }
}

function closeSubpage() {
    if (nativePlayer && isPlayerReady && typeof nativePlayer.pause === 'function') {
        nativePlayer.pause();
    }
    if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
    if (elements.playerWrapper) elements.playerWrapper.style.display = 'none';
    if (elements.cryActionBtn) elements.cryActionBtn.style.display = 'inline-block';
    if (elements.subpage) elements.subpage.style.display = 'none';
    document.body.style.overflow = 'auto';
    if (tutorialStep > 0) terminateTutorial();
}

function playCleanVideo() {
    if (elements.cryActionBtn) elements.cryActionBtn.style.display = 'none';
    if (elements.playerWrapper) elements.playerWrapper.style.display = 'block';
    
    if (isPlayerReady && nativePlayer && typeof nativePlayer.play === 'function') {
        nativePlayer.play();
        triggerCenterFlash('play');
        resetControlsTimeout();
    }

    if (tutorialStep === 2) {
        if (elements.cryActionBtn) elements.cryActionBtn.classList.remove('tutorial-spotlight');
        terminateTutorial();
        setTimeout(() => { showToast("🎉 Tutorial Completed Successfully!"); }, 500);
    }
}

function startTrackingProgressLoop() {
    setInterval(() => {
        if (!isPlayerReady || !nativePlayer || isCasting) return;
        
        const current = nativePlayer.currentTime || 0;
        const duration = nativePlayer.duration || 0;
        
        let bufferedEnd = 0;
        if (nativePlayer.buffered && nativePlayer.buffered.length > 0) {
            bufferedEnd = nativePlayer.buffered.end(nativePlayer.buffered.length - 1);
        }

        if (elements.timeLabelLeft) elements.timeLabelLeft.textContent = formatTime(current);
        if (elements.timeLabelRight) elements.timeLabelRight.textContent = formatTime(duration - current);

        if (duration > 0) {
            const pct = (current / duration) * 100;
            if (elements.progressFill) elements.progressFill.style.width = `${pct}%`;
            if (elements.progressThumb) elements.progressThumb.style.left = `${pct}%`;
            if (elements.progressBuffer) elements.progressBuffer.style.width = `${(bufferedEnd / duration) * 100}%`;
        }
    }, 200);
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const pad = (num) => String(num).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function handleVolumeSlider(e) {
    const vol = parseInt(e.target.value);
    if (nativePlayer && isPlayerReady) {
        nativePlayer.volume = vol / 100;
        nativePlayer.muted = (vol === 0);
    }
    updateVolumeIcon(vol, vol === 0);
}

function toggleMuteState() {
    if (!isPlayerReady || !nativePlayer) return;
    nativePlayer.muted = !nativePlayer.muted;
    
    if (nativePlayer.muted) {
        if (elements.volSlider) elements.volSlider.value = 0;
        updateVolumeIcon(0, true);
        showToast("Audio Muted");
    } else {
        const currentVol = Math.round(nativePlayer.volume * 100) || 50;
        if (elements.volSlider) elements.volSlider.value = currentVol;
        updateVolumeIcon(currentVol, false);
        showToast("Audio Unmuted");
    }
}

function updateVolumeIcon(vol, isMuted) {
    if (!elements.btnMute) return;
    let svgContent = '';
    if (isMuted || vol === 0) {
        svgContent = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM4 9v6h4l5 5V4L8 9H4zm15.5 3c0 3.12-1.93 5.79-4.7 6.88v2.1c3.89-1.16 6.7-4.75 6.7-9s-2.81-7.84-6.7-9v2.1c2.77 1.09 4.7 3.76 4.7 6.88z" fill="white"/><line x1="3" y1="3" x2="21" y2="21" stroke="white" stroke-width="2"/>';
    } else if (vol < 50) {
        svgContent = '<path d="M14.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" fill="white"/>';
    } else {
        svgContent = '<path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-3-1.23L6 7H2v10h4l5 5V2zm1.5 10c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" fill="white"/>';
    }
    elements.btnMute.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">${svgContent}</svg>`;
}

function togglePlayPause() {
    if (!isPlayerReady || !nativePlayer) return;
    if (nativePlayer.paused) {
        if (typeof nativePlayer.play === 'function') nativePlayer.play();
        triggerCenterFlash('play');
    } else {
        if (typeof nativePlayer.pause === 'function') nativePlayer.pause();
        triggerCenterFlash('pause');
    }
}

function updatePlayPauseButton(isPlaying) {
    if (!elements.btnPlayPause) return;
    let path = isPlaying ? 
        '<rect x="6" y="4" width="4" height="16" rx="1" fill="white"/><rect x="14" y="4" width="4" height="16" rx="1" fill="white"/>' : 
        '<path d="M8 5v14l11-7z" fill="white"/>';
    elements.btnPlayPause.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24">${path}</svg>`;
}

function handleProgressScrub(e) {
    if (!isPlayerReady || !nativePlayer || isControlsLocked || !elements.progressWrap) return;
    const rect = elements.progressWrap.getBoundingClientRect();
    const clickX = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const duration = nativePlayer.duration || 0;
    if (duration > 0) {
        nativePlayer.currentTime = percentage * duration;
    }
}

function toggleInterfaceLock() {
    isControlsLocked = !isControlsLocked;
    if (!elements.btnLock || !elements.lockOverlay) return;
    if (isControlsLocked) {
        elements.btnLock.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
        elements.lockOverlay.classList.add('active');
        hideControlsBar();
        showLockToast("Controls Locked");
    } else {
        elements.btnLock.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`;
        elements.lockOverlay.classList.remove('active');
        showControlsBar();
        showLockToast("Controls Unlocked");
    }
}

function handleLockedOverlayClick() {
    if (!isControlsLocked) return;
    showLockToast("Controls Are Currently Locked");
}

function showLockToast(msg) {
    if (!elements.lockToast) return;
    elements.lockToast.textContent = msg;
    elements.lockToast.classList.add('show');
    setTimeout(() => elements.lockToast.classList.remove('show'), 2000);
}

// Popup systems metrics
function toggleSubPopup() {
    if (!elements.subPopup) return;
    closeActivePopups(elements.subPopup);
    elements.subPopup.classList.toggle('visible');
    trackActivePopup(elements.subPopup);
}

function selectSubtitle(track) {
    currentSubtitleTrack = track;
    document.querySelectorAll('#subPopup .popup-row').forEach(row => {
        row.classList.remove('active');
    });
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
    showToast(`Subtitles set to: ${track.toUpperCase()}`);
    if (elements.subPopup) elements.subPopup.classList.remove('visible');
}

function initCastFramework() {
    window.__onGCastApiAvailable = function(isAvailable) {
        if (isAvailable && window.cast) {
            castContext = cast.framework.CastContext.getInstance();
            castContext.setOptions({
                receiverApplication            castContext.setOptions({
                receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
            });
        }
    };
}

function toggleCastPopup() {
    if (!elements.castPopup) return;
    closeActivePopups(elements.castPopup);
    elements.castPopup.classList.toggle('visible');
    trackActivePopup(elements.castPopup);
    if (elements.castPopup.classList.contains('visible')) {
        renderMockCastDevices();
    }
}

function renderMockCastDevices() {
    if (elements.castDeviceList) {
        elements.castDeviceList.innerHTML = `
            <div class="popup-row" onclick="connectToMockDevice('Living Room TV')">Living Room Display Screen</div>
            <div class="popup-row" onclick="connectToMockDevice('Cyber Deck Screen')">Cybernetic Deck Matrix Terminal</div>
        `;
    }
    if (elements.castStatusText) elements.castStatusText.textContent = "Select target cast asset vector link";
}

function connectToMockDevice(deviceName) {
    isCasting = true;
    if (elements.btnCast) elements.btnCast.classList.add('casting');
    if (elements.castPopup) elements.castPopup.classList.remove('visible');
    if (nativePlayer && isPlayerReady && typeof nativePlayer.pause === 'function') nativePlayer.pause();
    showToast(`Casting connection initialized -> ${deviceName}`);
}

function trackActivePopup(pop) {
    activePopup = pop.classList.contains('visible') ? pop : null;
}

// Global active element controller closures
function closeActivePopups(exclude = null) {
    if (activePopup && activePopup !== exclude) {
        activePopup.classList.remove('visible');
        activePopup = null;
    }
}

function showToast(msg) {
    if (!elements.toast) return;
    elements.toast.textContent = msg;
    elements.toast.style.opacity = '1';
    setTimeout(() => { elements.toast.style.opacity = '0'; }, 3000);
}

let lastTapTimestamp = 0;
function handleOverlayClickGesture(e) {
    if (isControlsLocked) {
        handleLockedOverlayClick();
        return;
    }
    closeActivePopups();

    const timestamp = new Date().getTime();
    const tapDelay = timestamp - lastTapTimestamp;
    const containerWidth = elements.videoContainer ? elements.videoContainer.clientWidth : window.innerWidth;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clickX = clientX - (elements.videoContainer ? elements.videoContainer.getBoundingClientRect().left : 0);

    if (tapDelay < 300 && tapDelay > 0) {
        if (clickX < containerWidth / 2) {
            performDoubleTapSeek('left');
        } else {
            performDoubleTapSeek('right');
        }
        lastTapTimestamp = 0;
    } else {
        lastTapTimestamp = timestamp;
        setTimeout(() => {
            if (lastTapTimestamp === timestamp) {
                toggleControlsBarVisibility();
            }
        }, 300);
    }
}

function performDoubleTapSeek(direction) {
    if (!isPlayerReady || !nativePlayer) return;
    const currentTime = nativePlayer.currentTime || 0;
    if (direction === 'left') {
        nativePlayer.currentTime = Math.max(0, currentTime - 10);
        animateSeekFlash(elements.flashLeft);
    } else {
        nativePlayer.currentTime = Math.min(nativePlayer.duration || 0, currentTime + 10);
        animateSeekFlash(elements.flashRight);
    }
}

function animateSeekFlash(el) {
    if (!el) return;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 650);
}

function triggerCenterFlash(type) {
    if (!elements.centerFlash || !elements.cfPlay || !elements.cfPause) return;
    if (type === 'play') {
        elements.cfPlay.style.display = 'block';
        elements.cfPause.style.display = 'none';
    } else {
        elements.cfPlay.style.display = 'none';
        elements.cfPause.style.display = 'block';
    }
    elements.centerFlash.classList.add('show');
    setTimeout(() => elements.centerFlash.classList.remove('show'), 500);
}

function toggleControlsBarVisibility() {
    if (!elements.videoContainer) return;
    if (elements.videoContainer.classList.contains('controls-hidden')) {
        showControlsBar();
    } else {
        hideControlsBar();
    }
}

function showControlsBar() {
    if (elements.videoContainer) elements.videoContainer.classList.remove('controls-hidden');
    resetControlsTimeout();
}

function hideControlsBar() {
    if (elements.videoContainer && isPlayerReady && nativePlayer && !nativePlayer.paused) {
        elements.videoContainer.classList.add('controls-hidden');
        closeActivePopups();
    }
}

function resetControlsTimeout() {
    clearTimeout(controlsTimeout);
    if (isControlsLocked) return;
    controlsTimeout = setTimeout(() => {
        hideControlsBar();
    }, 3500);
}

function toggleFullscreen() {
    if (!elements.playerWrapper) return;
    if (!document.fullscreenElement) {
        elements.playerWrapper.requestFullscreen().catch(err => {
            showToast("Error establishing fullscreen environment");
        });
    } else {
        document.exitFullscreen();
    }
}

function setupInteractiveEventListeners() {
    if (elements.clickOverlay) elements.clickOverlay.addEventListener('click', handleOverlayClickGesture);
    if (elements.volSlider) elements.volSlider.addEventListener('input', handleVolumeSlider);
    if (elements.animeCard) elements.animeCard.addEventListener('click', openSubpage);
    if (elements.cryActionBtn) elements.cryActionBtn.addEventListener('click', playCleanVideo);
    if (elements.btnPlayPause) elements.btnPlayPause.addEventListener('click', togglePlayPause);
    if (elements.btnMute) elements.btnMute.addEventListener('click', toggleMuteState);
    if (elements.btnLock) elements.btnLock.addEventListener('click', toggleInterfaceLock);
    
    let isDraggingScrub = false;
    const startScrub = (e) => {
        if (isControlsLocked) return;
        isDraggingScrub = true;
        handleProgressScrub(e);
    };
    const moveScrub = (e) => {
        if (isDraggingScrub) handleProgressScrub(e);
    };
    const endScrub = () => { isDraggingScrub = false; };

    if (elements.progressWrap) {
        elements.progressWrap.addEventListener('mousedown', startScrub);
        elements.progressWrap.addEventListener('touchstart', startScrub, {passive: true});
    }
    window.addEventListener('mousemove', moveScrub);
    window.addEventListener('mouseup', endScrub);
    window.addEventListener('touchmove', moveScrub, {passive: true});
    window.addEventListener('touchend', endScrub);

    window.addEventListener('resize', () => {
        if (tutorialStep > 0) positionTutorialBubble();
    });

    window.addEventListener('keydown', (e) => {
        if (!elements.subpage || elements.subpage.style.display !== 'block') return;
        if (isControlsLocked && e.key.toLowerCase() !== 'l') return;

        switch(e.key.toLowerCase()) {
            case ' ':
            case 'k':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'f':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'm':
                e.preventDefault();
                toggleMuteState();
                break;
            case 'l':
                e.preventDefault();
                toggleInterfaceLock();
                break;
            case 'arrowleft':
            case 'j':
                e.preventDefault();
                performDoubleTapSeek('left');
                showControlsBar();
                break;
            case 'arrowright':
                e.preventDefault();
                performDoubleTapSeek('right');
                showControlsBar();
                break;
        }
    });
}
