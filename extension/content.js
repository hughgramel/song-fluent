console.log('🎬 SongFluent: Content script loaded on YouTube');

// Configuration
const API_BASE_URL = 'http://localhost:3001';

// State
let currentVideoId = null;
let subtitleButton = null;
let overlayContainer = null;
let currentTranscript = null;
let isProcessing = false;

// Initialize when YouTube video player is ready
function init() {
  console.log('🚀 SongFluent: Initializing...');

  // Get current video ID
  currentVideoId = getVideoId();
  if (!currentVideoId) {
    console.warn('⚠️ SongFluent: No video ID found');
    return;
  }

  console.log('📺 SongFluent: Video ID:', currentVideoId);

  // Check if we have cached transcript
  checkCachedTranscript();

  // Create the "Generate Subtitles" button
  createSubtitleButton();

  // Setup video event listeners
  setupVideoListeners();
}

// Extract video ID from URL
function getVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

// Create button in YouTube player
function createSubtitleButton() {
  console.log('🔘 SongFluent: Creating subtitle button...');

  // Find YouTube controls container
  const controlsContainer = document.querySelector('.ytp-right-controls');
  if (!controlsContainer) {
    console.warn('⚠️ SongFluent: Could not find YouTube controls');
    setTimeout(createSubtitleButton, 1000);
    return;
  }

  // Remove existing button if present
  if (subtitleButton) {
    subtitleButton.remove();
  }

  // Create button
  subtitleButton = document.createElement('button');
  subtitleButton.className = 'ytp-button songfluent-button';
  subtitleButton.innerHTML = `
    <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
      <path d="M11,11 C11,9.9 11.9,9 13,9 L23,9 C24.1,9 25,9.9 25,11 L25,14 L23,14 L23,11 L13,11 L13,25 L23,25 L23,22 L25,22 L25,25 C25,26.1 24.1,27 23,27 L13,27 C11.9,27 11,26.1 11,25 L11,11 Z M20,17 L27,17 L27,19 L20,19 L20,17 Z M20,21 L25,21 L25,23 L20,23 L20,21 Z" fill="#fff"></path>
    </svg>
  `;
  subtitleButton.title = 'Generate Chinese Subtitles';
  subtitleButton.style.cssText = 'width: 40px; height: 40px; cursor: pointer;';

  subtitleButton.addEventListener('click', handleGenerateSubtitles);

  // Insert before settings button
  const settingsButton = controlsContainer.querySelector('.ytp-settings-button');
  if (settingsButton) {
    controlsContainer.insertBefore(subtitleButton, settingsButton);
  } else {
    controlsContainer.appendChild(subtitleButton);
  }

  console.log('✅ SongFluent: Button created');
}

// Check if we have cached transcript for this video
async function checkCachedTranscript() {
  console.log('💾 SongFluent: Checking cache for video:', currentVideoId);

  chrome.storage.local.get([`transcript_${currentVideoId}`], (result) => {
    const cached = result[`transcript_${currentVideoId}`];
    if (cached) {
      console.log('✅ SongFluent: Found cached transcript:', cached.transcript.length, 'segments');
      currentTranscript = cached.transcript;
      showCachedIndicator();
    } else {
      console.log('📭 SongFluent: No cached transcript found');
    }
  });
}

// Show indicator that cached subtitles are available
function showCachedIndicator() {
  if (subtitleButton) {
    subtitleButton.style.color = '#00ff00';
    subtitleButton.title = 'Show Cached Chinese Subtitles';
  }
}

// Handle generate subtitles button click
async function handleGenerateSubtitles() {
  console.log('🎯 SongFluent: Generate button clicked');

  if (isProcessing) {
    console.warn('⚠️ SongFluent: Already processing');
    return;
  }

  // If we have cached transcript, show it
  if (currentTranscript) {
    console.log('📺 SongFluent: Showing cached transcript');
    showSubtitleOverlay();
    return;
  }

  // Extract and process audio
  isProcessing = true;
  updateButtonState('processing');

  try {
    await extractAndProcessAudio();
  } catch (error) {
    console.error('❌ SongFluent: Error:', error);
    showError(error.message);
    updateButtonState('error');
  } finally {
    isProcessing = false;
  }
}

// Update button visual state
function updateButtonState(state) {
  if (!subtitleButton) return;

  switch (state) {
    case 'processing':
      subtitleButton.style.opacity = '0.5';
      subtitleButton.title = 'Processing...';
      break;
    case 'error':
      subtitleButton.style.color = '#ff0000';
      subtitleButton.title = 'Error - Click to retry';
      break;
    case 'ready':
      subtitleButton.style.opacity = '1';
      subtitleButton.style.color = '#00ff00';
      subtitleButton.title = 'Show Chinese Subtitles';
      break;
  }
}

// Extract audio from video and send to API
async function extractAndProcessAudio() {
  console.log('🎵 SongFluent: Extracting audio from video...');

  showStatus('Extracting audio from video...');

  const video = document.querySelector('video');
  if (!video) {
    throw new Error('Video element not found');
  }

  console.log('📹 SongFluent: Video element found:', {
    duration: video.duration,
    currentTime: video.currentTime,
    src: video.src
  });

  // Capture audio from video
  const audioBlob = await captureAudioFromVideo(video);
  console.log('✅ SongFluent: Audio captured:', {
    size: `${(audioBlob.size / 1024 / 1024).toFixed(2)} MB`,
    type: audioBlob.type
  });

  // Send to transcription API
  showStatus('Transcribing with OpenAI Whisper...');
  const transcript = await transcribeAudio(audioBlob);

  // Send to translation API
  showStatus('Translating to English with Pinyin...');
  const translatedTranscript = await translateTranscript(transcript);

  // Cache the result
  currentTranscript = translatedTranscript;
  await cacheTranscript(currentVideoId, translatedTranscript);

  // Show the subtitles
  updateButtonState('ready');
  showStatus('Complete! Click button to show subtitles');
  setTimeout(() => hideStatus(), 2000);

  showSubtitleOverlay();
}

// Capture audio from video element
async function captureAudioFromVideo(video) {
  return new Promise((resolve, reject) => {
    try {
      console.log('🎙️ SongFluent: Starting audio capture...');

      // Create media stream from video
      const stream = video.captureStream();
      const audioTracks = stream.getAudioTracks();

      if (audioTracks.length === 0) {
        throw new Error('No audio track found in video');
      }

      console.log('🔊 SongFluent: Audio tracks found:', audioTracks.length);

      // Create audio-only stream
      const audioStream = new MediaStream(audioTracks);

      // Record audio
      const mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm'
      });

      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('✅ SongFluent: Recording stopped, creating blob');
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        resolve(audioBlob);
      };

      mediaRecorder.onerror = (error) => {
        console.error('❌ SongFluent: MediaRecorder error:', error);
        reject(error);
      };

      // Record for the duration of the video (or max 10 minutes)
      const duration = Math.min(video.duration * 1000, 10 * 60 * 1000);

      console.log(`⏺️ SongFluent: Starting recording for ${(duration / 1000).toFixed(0)}s`);
      mediaRecorder.start();

      // Stop after duration or when video ends
      const stopRecording = () => {
        if (mediaRecorder.state !== 'inactive') {
          console.log('⏹️ SongFluent: Stopping recording');
          mediaRecorder.stop();
        }
      };

      setTimeout(stopRecording, duration);
      video.addEventListener('ended', stopRecording, { once: true });

    } catch (error) {
      console.error('❌ SongFluent: Capture error:', error);
      reject(error);
    }
  });
}

// Send audio to transcription API
async function transcribeAudio(audioBlob) {
  console.log('📤 SongFluent: Sending to transcription API...');

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');

  const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Transcription failed');
  }

  const data = await response.json();
  console.log('✅ SongFluent: Transcription complete:', data.transcript.length, 'segments');

  return data.transcript;
}

// Send transcript to translation API
async function translateTranscript(transcript) {
  console.log('📤 SongFluent: Sending to translation API...');

  const response = await fetch(`${API_BASE_URL}/api/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ segments: transcript })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Translation failed');
  }

  const data = await response.json();
  console.log('✅ SongFluent: Translation complete:', data.segments.length, 'segments');

  return data.segments;
}

// Cache transcript in Chrome storage
async function cacheTranscript(videoId, transcript) {
  console.log('💾 SongFluent: Caching transcript for video:', videoId);

  return new Promise((resolve) => {
    chrome.storage.local.set({
      [`transcript_${videoId}`]: {
        transcript,
        timestamp: Date.now()
      }
    }, () => {
      console.log('✅ SongFluent: Transcript cached');
      resolve();
    });
  });
}

// Show subtitle overlay on video
function showSubtitleOverlay() {
  console.log('📺 SongFluent: Showing subtitle overlay');

  if (overlayContainer) {
    overlayContainer.style.display = 'block';
    return;
  }

  // Create overlay container
  overlayContainer = document.createElement('div');
  overlayContainer.className = 'songfluent-overlay';
  overlayContainer.innerHTML = `
    <div class="songfluent-subtitle-container">
      <div class="songfluent-subtitle-text">
        <div class="songfluent-english"></div>
        <div class="songfluent-chinese"></div>
        <div class="songfluent-pinyin"></div>
      </div>
      <button class="songfluent-close">✕</button>
    </div>
  `;

  // Insert into video container
  const videoContainer = document.querySelector('#movie_player');
  if (videoContainer) {
    videoContainer.appendChild(overlayContainer);
  }

  // Setup close button
  overlayContainer.querySelector('.songfluent-close').addEventListener('click', () => {
    overlayContainer.style.display = 'none';
  });

  // Setup video sync
  setupSubtitleSync();
}

// Setup subtitle synchronization with video
function setupVideoListeners() {
  const video = document.querySelector('video');
  if (!video) return;

  video.addEventListener('timeupdate', updateSubtitlePosition);
}

// Sync subtitle display with video time
function updateSubtitlePosition() {
  if (!currentTranscript || !overlayContainer || overlayContainer.style.display === 'none') {
    return;
  }

  const video = document.querySelector('video');
  if (!video) return;

  const currentTime = video.currentTime;

  // Find current segment
  let activeSegment = null;
  for (let i = 0; i < currentTranscript.length; i++) {
    if (currentTime >= currentTranscript[i].time) {
      activeSegment = currentTranscript[i];
    } else {
      break;
    }
  }

  if (activeSegment) {
    const englishEl = overlayContainer.querySelector('.songfluent-english');
    const chineseEl = overlayContainer.querySelector('.songfluent-chinese');
    const pinyinEl = overlayContainer.querySelector('.songfluent-pinyin');

    if (englishEl) englishEl.textContent = activeSegment.english || '';
    if (chineseEl) chineseEl.textContent = activeSegment.text || '';
    if (pinyinEl) pinyinEl.textContent = activeSegment.pinyin || '';
  }
}

function setupSubtitleSync() {
  setupVideoListeners();
}

// Status notification
function showStatus(message) {
  console.log('📢 SongFluent:', message);

  let statusEl = document.querySelector('.songfluent-status');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.className = 'songfluent-status';
    document.body.appendChild(statusEl);
  }

  statusEl.textContent = message;
  statusEl.style.display = 'block';
}

function hideStatus() {
  const statusEl = document.querySelector('.songfluent-status');
  if (statusEl) {
    statusEl.style.display = 'none';
  }
}

function showError(message) {
  showStatus(`Error: ${message}`);
  setTimeout(hideStatus, 5000);
}

// Watch for navigation changes on YouTube (SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log('🔄 SongFluent: URL changed, reinitializing...');
    currentVideoId = null;
    currentTranscript = null;
    if (overlayContainer) {
      overlayContainer.remove();
      overlayContainer = null;
    }
    setTimeout(init, 1000);
  }
}).observe(document, { subtree: true, childList: true });

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  setTimeout(init, 1000);
}
