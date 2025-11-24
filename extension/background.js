console.log('🔧 SongFluent: Background service worker loaded');

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('🎉 SongFluent: Extension installed/updated', details.reason);

  // Set default settings
  chrome.storage.local.get(['apiUrl'], (result) => {
    if (!result.apiUrl) {
      chrome.storage.local.set({
        apiUrl: 'http://localhost:3002'
      }, () => {
        console.log('✅ Default settings initialized');
      });
    }
  });

  // Show welcome notification
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: 'https://github.com/hughgramel/song-fluent'
    });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Message received:', request);

  if (request.type === 'GET_API_URL') {
    chrome.storage.local.get(['apiUrl'], (result) => {
      sendResponse({ apiUrl: result.apiUrl || 'http://localhost:3002' });
    });
    return true; // Keep channel open for async response
  }

  if (request.type === 'LOG') {
    console.log(`[Content Script] ${request.message}`);
  }
});

// Monitor storage usage
chrome.storage.local.getBytesInUse(null, (bytes) => {
  const mb = (bytes / 1024 / 1024).toFixed(2);
  console.log('💾 Storage usage:', mb, 'MB');

  // Warn if storage is getting full (> 4MB)
  if (bytes > 4 * 1024 * 1024) {
    console.warn('⚠️ Storage getting full, consider clearing cache');
  }
});
