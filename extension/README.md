# SongFluent Chrome Extension

Convert this project to a Chrome extension that generates AI-powered Chinese subtitles with English translation and Pinyin for any YouTube video.

## Features

- 🎬 **One-Click Subtitle Generation**: Add a button directly to YouTube's video player
- 🎤 **OpenAI Whisper Transcription**: Accurate speech-to-text for Chinese audio
- 🌐 **Automatic Translation**: Chinese to English with GPT-4o-mini
- 📝 **Pinyin Support**: Shows tone marks for language learning
- 💾 **Smart Caching**: Saves transcripts locally for instant replay
- 🎨 **Beautiful Overlay**: Trilingual subtitles displayed elegantly on video
- ⚡ **Real-time Sync**: Subtitles perfectly synced with video playback

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Chrome Extension (Frontend)                            │
│  ├─ content.js: Injects into YouTube pages              │
│  ├─ popup.js: Extension settings UI                     │
│  ├─ background.js: Service worker                       │
│  └─ Chrome Storage: Cache transcripts                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Next.js Backend API (localhost:3001)                   │
│  ├─ /api/transcribe: OpenAI Whisper integration         │
│  └─ /api/translate: GPT-4o-mini translation             │
└─────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Start the Backend API

First, make sure the Next.js API server is running:

```bash
# From the project root
npm run dev
```

The API should be running on `http://localhost:3001`

### 2. Add Extension Icons

Create placeholder icons for testing:

```bash
cd extension/icons
# Create simple 128x128 purple square with "SF" text
# Or use any PNG image and name them:
# - icon16.png
# - icon48.png
# - icon128.png
```

### 3. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. The SongFluent extension should now appear

### 4. Configure Extension

1. Click the SongFluent extension icon
2. Verify the API URL is set to `http://localhost:3001`
3. Click "Save Settings"

### 5. Use on YouTube

1. Navigate to any YouTube video (Chinese content works best)
2. Look for the new subtitle button in the video player controls (to the left of settings)
3. Click the button to start generating subtitles
4. Wait for transcription and translation to complete
5. Subtitles will automatically appear and sync with the video

## How It Works

### Audio Extraction

The extension uses the `MediaStream API` to capture audio directly from the YouTube video element:

```javascript
const stream = video.captureStream();
const audioStream = new MediaStream(stream.getAudioTracks());
const mediaRecorder = new MediaRecorder(audioStream);
```

This allows processing the audio without downloading the video file.

### Transcription Pipeline

1. **Capture**: Extract audio from YouTube video element
2. **Send**: Upload audio blob to `/api/transcribe`
3. **Whisper**: OpenAI Whisper transcribes with timestamps
4. **Translate**: GPT-4o-mini adds English translation and pinyin
5. **Cache**: Store in Chrome local storage
6. **Display**: Inject as overlay on video player
7. **Sync**: Update display based on `timeupdate` events

### Caching Strategy

- Transcripts are cached by video ID
- Cached transcripts load instantly on revisit
- Storage usage displayed in popup
- Clear cache option available

## File Structure

```
extension/
├── manifest.json         # Extension configuration
├── content.js           # Main logic, injected into YouTube
├── content.css          # Styles for subtitle overlay
├── popup.html           # Settings UI
├── popup.js             # Settings logic
├── background.js        # Service worker
└── icons/               # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Development Tips

### Debugging

- **Console logs**: Check the browser console on YouTube pages
- **Background logs**: Go to `chrome://extensions/` and click "service worker"
- **API logs**: Check the terminal running `npm run dev`

### Testing

1. Start with short videos (1-2 minutes) for faster testing
2. Check network tab to see API requests
3. Verify audio capture in Chrome DevTools
4. Test caching by reloading the same video

### Common Issues

**"No audio track found"**: Video might be muted or have no audio stream
**"CORS error"**: Make sure backend API is running on localhost:3001
**"Transcription failed"**: Check your OpenAI API key in `.env.local`

## Cost Considerations

- **Whisper API**: ~$0.006 per minute of audio
- **GPT-4o-mini**: Very cheap, ~$0.0001 per segment
- **10-minute video**: ~$0.06 total cost

Consider implementing:
- User API key input (let users use their own keys)
- Rate limiting (max videos per day)
- Transcript sharing/community caching

## Future Enhancements

- [ ] Support for other video platforms (Vimeo, etc.)
- [ ] Export transcripts to file
- [ ] Adjustable subtitle styling
- [ ] Keyboard shortcuts
- [ ] Multiple language support
- [ ] Community transcript sharing
- [ ] Offline mode with local Whisper model

## License

MIT

## Credits

Built with Claude Code by Hugh Gramelspacher
