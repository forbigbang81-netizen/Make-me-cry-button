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
    // 1. INSTANT LOADING & PURGE STUCK TEXT
    // Kill the visual blocking panel immediately so it cannot trap the interface
    if (elements.loadingPanel) {
        elements.loadingPanel.style.display = 'none';
        elements.loadingPanel.style.opacity = '0';
        elements.loadingPanel.style.pointerEvents = 'none';
    }

    // Scan for and eliminate any raw lingering text nodes saying "Connecting to database..."
    const textNodes = document.querySelectorAll('div, p, span');
    textNodes.forEach(el => {
        if (el.textContent && el.textContent.includes('Connecting to database')) {
            el.style.display = 'none';
        }
    });

    // Bring up the primary content card frame automatically
    if (elements.animeCard) elements.animeCard.style.display = 'block';

    // Seed robust initial UI visuals instantly while network requests resolve
    elements.apiImage.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=500";
    elements.cardTitle.textContent = "Cyberpunk: Edgerunners";
    elements.subpageTitle.textContent = "Cyberpunk: Edgerunners";
    elements.playerTitle.textContent = "Cyberpunk: Edgerunners";

    // Launch onboarding UI sequencing after window configuration stabilizes
    setTimeout(() => {
        if (elements.tutOverlay) elements.tutOverlay.style.display = 'flex';
    }, 800);

    // 2. DISPATCH BACKGROUND ASYNC CORE OPERATIONS
    fetchAnimeMetadata();
    initNativePlayer();
    initCastFramework();
    setupInteractiveEventListeners();
});

// Fetches asset metrics and pulls a randomized background from the top anime listings
async function fetchAnimeMetadata() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 Second total abort threshold

    try {
        // Query a random page out of the top anime list to vary backgrounds
        const randomPage = Math.floor(Math.random() * 5) + 1;
        const response = await fetch(`https://api.jikan.moe/v4/top/anime?page=${randomPage}&limit=10`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('Network pipeline stream asset error');
        const { data } = await response.json();

        if (data && data.length > 0) {
            // Pick a random index item from our fetched dataset array
            const randomIndex = Math.floor(Math.random() * data.length);
            const randomAnime = data[randomIndex];
            
            // Extract the high-res image URL vector link
            const newBgUrl = randomAnime.images.jpg.large_image_url;

            // Apply the randomized image directly to your background canvas element
            if (elements.homepageBg) {
                elements.homepageBg.style.backgroundImage = `url('${newBgUrl}')`;
                elements.homepageBg.style.backgroundSize = 'cover';
                elements.homepageBg.style.backgroundPosition = 'center';
            }
            console.log(`Successfully mapped randomized background matrix: ${randomAnime.title}`);
        }
    } catch (err) {
        clearTimeout(timeoutId);
        console.warn("Jikan API rate limit hit or pipeline closed. Keeping base layout visuals intact.", err);
    }
}

/* Handles initial Yes/No choices for onboarding walkthrough */
function handleTutorialChoice(wantsTutorial) {
    elements.tutPrompt.style.display = 'none';
    if (wantsTutorial) {
        elements.tutOverlay.style.display = 'initial';
        startTutorialSequence();
    } else {
        terminateTutorial();
    }
}

function startTutorialSequence() {
    tutorialStep = 1;
    elements.tutBubble.style.display = 'block';
    elements.tutText.textContent = "Click the card";
    elements.tutSkipBtn.style.display = 'none';
    
    positionTutorialBubble();
    elements.animeCard.classList.add('tutorial-spotlight');
}

// Places the tutorial box perfectly aligned with target interface nodes
function positionTutorialBubble() {
    if (tutorialStep === 1) {
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
    elements.tutOverlay.style.display = 'none';
    elements.tutPrompt.style.display = 'block'; 
    elements.tutBubble.style.display = 'none';
    elements.animeCard.classList.remove('tutorial-spotlight');
    elements.cryActionBtn.classList.remove('tutorial-spotlight');
}

function initNativePlayer() {
    nativePlayer = elements.iframe;
    isPlayerReady = true;

    nativePlayer.addEventListener('play', () => {
        updatePlayPauseButton(true);
        resetControlsTimeout();
    });

    nativePlayer.addEventListener('pause', () => {
        updatePlayPauseButton(false);
        showControlsBar(); 
    });

    nativePlayer.volume = elements.volSlider.value / 100;
    startTrackingProgressLoop();
}

function openSubpage() {
    elements.subpage.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    if (elements.homepageBg) elements.homepageBg.style.opacity = '0';

    if (tutorialStep === 1) {
        elements.animeCard.classList.remove('tutorial-spotlight');
        tutorialStep = 2;
        elements.tutText.textContent = "Click make me cry button and cry!";
        elements.tutSkipBtn.style.display = 'inline-block';
        elements.tutOverlay.style.display = 'block';
        
        setTimeout(() => {
            positionTutorialBubble();
            elements.tutOverlay.style.display = 'initial';
            elements.cryActionBtn.classList.add('tutorial-spotlight');
        }, 350);
    }
}

function closeSubpage() {
    if (nativePlayer && isPlayerReady) {
        nativePlayer.pause();
    }
    if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
    elements.playerWrapper.style.display = 'none';
    elements.cryActionBtn.style.display = 'inline-block';
    elements.subpage.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    if (elements.homepageBg) elements.homepageBg.style.opacity = '0.35';
    if (tutorialStep > 0) terminateTutorial();
}

function playCleanVideo() {
    elements.cryActionBtn.style.display = 'none';
    elements.playerWrapper.style.display = 'block';
    
    if (isPlayerReady && nativePlayer) {
        nativePlayer.play();
        triggerCenterFlash('play');
        resetControlsTimeout();
    }

    if (tutorialStep === 2) {
        elements.cryActionBtn.classList.remove('tutorial-spotlight');
        terminateTutorial();
        setTimeout(() => {
            showToast("🎉 Tutorial Completed Successfully!");
        }, 500);
    }
}

function startTrackingProgressLoop() {
    setInterval(() => {
        if (!isPlayerReady || !nativePlayer || isCasting) return;
        
        const current = nativePlayer.currentTime || 0;
        const duration = nativePlayer.duration || 0;
        
        let bufferedEnd = 0;
        if (nativePlayer.buffered.length > 0) {
            bufferedEnd = nativePlayer.buffered.end(nativePlayer.buffered.length - 1);
        }

        elements.timeLabelLeft.textContent = formatTime(current);
        elements.timeLabelRight.textContent = formatTime(duration - current);

        if (duration > 0) {
            const pct = (current / duration) * 100;
            elements.progressFill.style.width = `${pct}%`;
            elements.progressThumb.style.left = `${pct}%`;
            elements.progressBuffer.style.width = `${(bufferedEnd / duration) * 100}%`;
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

// Controls visual states modifications for muting audio elements
function toggleMuteState() {
    if (!isPlayerReady || !nativePlayer) return;
    nativePlayer.muted = !nativePlayer.muted;
    
    if (nativePlayer.muted) {
        elements.volSlider.value = 0;
        updateVolumeIcon(0, true);
        showToast("Audio Muted");
    } else {
        const currentVol = Math.round(nativePlayer.volume * 100) || 50;
        elements.volSlider.value = currentVol;
        updateVolumeIcon(currentVol, false);
        showToast("Audio Unmuted");
    }
}

function updateVolumeIcon(vol, isMuted) {
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
        nativePlayer.play();
        triggerCenterFlash('play');
    } else {
        nativePlayer.pause();
        triggerCenterFlash('pause');
    }
}

function updatePlayPauseButton(isPlaying) {
    let path = isPlaying ? 
        '<rect x="6" y="4" width="4" height="16" rx="1" fill="white"/><rect x="14" y="4" width="4" height="16" rx="1" fill="white"/>' : 
        '<path d="M8 5v14l11-7z" fill="white"/>';
    elements.btnPlayPause.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24">${path}</svg>`;
}

function handleProgressScrub(e) {
    if (!isPlayerReady || !nativePlayer || isControlsLocked) return;
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
    elements.lockToast.textContent = msg;
    elements.lockToast.classList.add('show');
    setTimeout(() => elements.lockToast.classList.remove('show'), 2000);
}

function toggleSubPopup() {
    closeActivePopups(elements.subPopup);
    elements.subPopup.classList.toggle('visible');
    trackActivePopup(elements.subPopup);
}

function selectSubtitle(track) {
    currentSubtitleTrack = track;
    document.querySelectorAll('#subPopup .popup-row').forEach(row => {
        row.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    showToast(`Subtitles set to: ${track.toUpperCase()}`);
    elements.subPopup.classList.remove('visible');
}

function initCastFramework() {
    window.__onGCastApiAvailable = function(isAvailable) {
        if (isAvailable && window.cast) {
            castContext = cast.framework.CastContext.getInstance();
            castContext.setOptions({
                receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
            });
        }
    };
}

function toggleCastPopup() {
    closeActivePopups(elements.castPopup);
    elements.castPopup.classList.toggle('visible');
    trackActivePopup(elements.castPopup);
    if (elements.castPopup.classList.contains('visible')) {
        renderMockCastDevices();
    }
}

function renderMockCastDevices() {
    elements.castDeviceList.innerHTML = `
        <div class="popup-row" onclick="connectToMockDevice('Living Room TV')">Living Room Display Screen</div>
        <div class="popup-row" onclick="connectToMockDevice('Cyber Deck Screen')">Cybernetic Deck Matrix Terminal</div>
    `;
    elements.castStatusText.textContent = "Select target cast asset vector link";
}

function connectToMockDevice(deviceName) {
    isCasting = true;
    elements.btnCast.classList.add('casting');
    elements.castPopup.classList.remove('visible');
    if (nativePlayer && isPlayerReady) nativePlayer.pause();
    showToast(`Casting connection initialized -> ${deviceName}`);
}

function trackActivePopup(pop) {
    activePopup = pop.classList.contains('visible') ? pop : null;
}

function closeActivePopups(exclude = null) {
    if (activePopup && activePopup !== exclude) {
        activePopup.classList.remove('visible');
        activePopup = null;
    }
}

// Global UI toast messages engine
function showToast(msg) {
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
    const containerWidth = elements.videoContainer.clientWidth;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clickX = clientX - elements.videoContainer.getBoundingClientRect().left;

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
        nativePlayer.currentTime = Math.min(nativePlayer.duration, currentTime + 10);
        animateSeekFlash(elements.flashRight);
    }
}

function animateSeekFlash(el) {
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 650);
}

// Shows centralized action icons for play / pause overlays
function triggerCenterFlash(type) {
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

// Controls visibility layers state modifications
function toggleControlsBarVisibility() {
    if (elements.videoContainer.classList.contains('controls-hidden')) {
        showControlsBar();
    } else {
        hideControlsBar();
    }
}

function showControlsBar() {
    elements.videoContainer.classList.remove('controls-hidden');
    resetControlsTimeout();
}

function hideControlsBar() {
    if (isPlayerReady && nativePlayer && !nativePlayer.paused) {
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
    if (!document.fullscreenElement) {
        elements.playerWrapper.requestFullscreen().catch(err => {
            showToast("Error establishing fullscreen environment");
        });
    } else {
        document.exitFullscreen();
    }
}

// Registers structural mouse, scroll, keyboard, and layout track boundaries
function setupInteractiveEventListeners() {
    elements.clickOverlay.addEventListener('click', handleOverlayClickGesture);
    elements.volSlider.addEventListener('input', handleVolumeSlider);
    
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

    elements.progressWrap.addEventListener('mousedown', startScrub);
    window.addEventListener('mousemove', moveScrub);
    window.addEventListener('mouseup', endScrub);

    elements.progressWrap.addEventListener('touchstart', startScrub, {passive: true});
    window.addEventListener('touchmove', moveScrub, {passive: true});
    window.addEventListener('touchend', endScrub);

    window.addEventListener('resize', () => {
        if (tutorialStep > 0) positionTutorialBubble();
    });

    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            if (tutorialStep > 0) positionTutorialBubble();
        }, 200);
    });

    window.addEventListener('keydown', (e) => {
        if (elements.subpage.style.display !== 'block' || elements.playerWrapper.style.display !== 'block') return;
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
