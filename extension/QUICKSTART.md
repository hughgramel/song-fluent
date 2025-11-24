# Quick Start Guide - Chrome Extension

Get SongFluent running on YouTube in 5 minutes!

## Prerequisites

- Chrome browser
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Step 1: Start the Backend API (2 minutes)

```bash
# Navigate to project root
cd /path/to/song-fluent

# Install dependencies (if you haven't)
npm install

# Create .env.local file with your OpenAI API key
echo "OPENAI_API_KEY=sk-your-key-here" > .env.local

# Start the server
npm run dev
```

You should see:
```
▲ Next.js 16.0.3 (Turbopack)
- Local:         http://localhost:3001
```

✅ Keep this terminal open! The extension needs this API running.

## Step 2: Generate Extension Icons (1 minute)

```bash
cd extension

# Option A: Open in browser and download icons
open create-icons.html
# Click "Generate Icons" and download all three

# Option B: Use any 3 PNG files named icon16.png, icon48.png, icon128.png
# Just copy them to extension/icons/
```

## Step 3: Load Extension in Chrome (1 minute)

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top right)
4. Click **"Load unpacked"**
5. Select the `extension` folder (this folder!)
6. Look for the SongFluent extension in your list

✅ Extension loaded!

## Step 4: Test on YouTube (1 minute)

1. Go to any YouTube video with Chinese audio
   - Example: [Chinese music video](https://www.youtube.com/results?search_query=chinese+music)

2. Look for the new **subtitle button** in the video player controls
   - It's to the left of the settings gear icon
   - Looks like a document with "SF"

3. Click the button
   - Status notification appears in bottom-right
   - Watch the console for progress logs
   - First time: ~30-60 seconds for transcription
   - Cached: Instant!

4. Subtitles appear automatically!
   - Chinese text (large)
   - English translation (top)
   - Pinyin (bottom)

## Troubleshooting

### "No audio track found"
- Make sure video has audio and isn't muted
- Try refreshing the page

### "Failed to transcribe"
- Check backend is running (`npm run dev`)
- Verify API key in `.env.local`
- Check terminal for error messages

### Button doesn't appear
- Refresh YouTube page
- Check browser console for errors (F12)
- Make sure you're on a `/watch?v=` page

### CORS errors
- Backend must be on `localhost:3001`
- Check extension settings (click extension icon)

## Check Console Logs

Press **F12** to open DevTools and see detailed logs:

```
🎬 SongFluent: Content script loaded on YouTube
📺 SongFluent: Video ID: dQw4w9WgXcQ
🔘 SongFluent: Creating subtitle button...
✅ SongFluent: Button created
🎯 SongFluent: Generate button clicked
🎵 SongFluent: Extracting audio from video...
✅ SongFluent: Audio captured: 2.34 MB
📤 SongFluent: Sending to transcription API...
✅ SongFluent: Transcription complete: 42 segments
📤 SongFluent: Sending to translation API...
✅ SongFluent: Translation complete: 42 segments
💾 SongFluent: Caching transcript for video: dQw4w9WgXcQ
📺 SongFluent: Showing subtitle overlay
```

## Next Steps

- **Cache**: Revisit same video for instant subtitles
- **Settings**: Click extension icon to view stats
- **Clear Cache**: Use popup to free up storage
- **Share**: Tell friends about SongFluent!

## Tips

💡 Start with short videos (1-2 minutes) for faster testing
💡 Check both browser console AND terminal for debug info
💡 Cached transcripts load instantly on second viewing
💡 You can close subtitle overlay and reopen anytime

## Costs

- Whisper API: ~$0.006 per minute
- GPT-4o-mini: ~$0.0001 per segment
- 10-minute video: ~$0.06 total

Very affordable for language learning!

## Support

Found a bug? Have questions?
- Check [extension/README.md](README.md) for detailed docs
- View logs in console (F12)
- Check terminal running `npm run dev`
- Open issue on GitHub

Happy learning! 🎉
