console.log('🎛️ SongFluent: Popup loaded');

// Load settings
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadStatistics();
  setupEventListeners();
});

// Load saved settings
function loadSettings() {
  chrome.storage.local.get(['apiUrl'], (result) => {
    if (result.apiUrl) {
      document.getElementById('apiUrl').value = result.apiUrl;
    }
  });
}

// Load statistics
function loadStatistics() {
  chrome.storage.local.get(null, (items) => {
    // Count transcripts
    const transcriptKeys = Object.keys(items).filter(key => key.startsWith('transcript_'));
    document.getElementById('videoCount').textContent = transcriptKeys.length;

    // Calculate cache size
    const jsonStr = JSON.stringify(items);
    const bytes = new Blob([jsonStr]).size;
    const mb = (bytes / 1024 / 1024).toFixed(2);
    document.getElementById('cacheSize').textContent = `${mb} MB`;
  });
}

// Setup event listeners
function setupEventListeners() {
  // Save settings
  document.getElementById('saveSettings').addEventListener('click', saveSettings);

  // Clear cache
  document.getElementById('clearCache').addEventListener('click', clearCache);
}

// Save settings
function saveSettings() {
  const apiUrl = document.getElementById('apiUrl').value.trim();

  if (!apiUrl) {
    showMessage('Please enter an API URL', 'error');
    return;
  }

  chrome.storage.local.set({ apiUrl }, () => {
    console.log('✅ Settings saved');
    showMessage('Settings saved successfully!', 'success');
  });
}

// Clear cache
function clearCache() {
  if (!confirm('Are you sure you want to clear all cached transcripts?')) {
    return;
  }

  chrome.storage.local.get(null, (items) => {
    const transcriptKeys = Object.keys(items).filter(key => key.startsWith('transcript_'));

    if (transcriptKeys.length === 0) {
      showMessage('Cache is already empty', 'success');
      return;
    }

    chrome.storage.local.remove(transcriptKeys, () => {
      console.log('✅ Cache cleared:', transcriptKeys.length, 'items');
      showMessage(`Cleared ${transcriptKeys.length} cached transcripts`, 'success');
      loadStatistics();
    });
  });
}

// Show status message
function showMessage(text, type) {
  const messageEl = document.getElementById('statusMessage');
  messageEl.textContent = text;
  messageEl.className = `status-message ${type}`;
  messageEl.style.display = 'block';

  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 3000);
}
