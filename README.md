# SongFluent

AI-powered Chinese subtitle generator with English translation and Pinyin. Available as both a web app and Chrome extension for YouTube.

## Two Modes

### 1. 🌐 Web App (main branch)
Upload MP3 files and generate synchronized transcripts with translation

### 2. 🎬 Chrome Extension (chrome-extension branch)
Generate subtitles directly on YouTube videos with one click

## Features

### Web App Features
- 🎵 Upload MP3 files and play them in the browser
- 🎤 Auto-transcribe audio using OpenAI Whisper API
- 🌐 Automatic Chinese to English translation with GPT-4o-mini
- 📝 Pinyin generation with tone marks for language learning
- ⏱️ Real-time transcript syncing with audio playback
- 🎯 Click any transcript line to jump to that timestamp
- 📜 Auto-scroll and highlight current transcript line
- 💾 Comprehensive console logging for debugging
- 🎨 Beautiful, responsive UI with Tailwind CSS v4

### Chrome Extension Features (chrome-extension branch)
- 🎬 One-click subtitle generation on any YouTube video
- 🎤 Extracts audio directly from YouTube player
- 🌐 Trilingual display: Chinese, English, Pinyin
- 💾 Smart caching - instant playback on revisit
- ⚡ Real-time subtitle synchronization
- 🎨 Beautiful gradient overlay on video
- 📊 Statistics tracking in extension popup

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy your API key

### 3. Configure Environment Variables

Open `.env.local` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important:** Never commit your API key to version control. The `.env.local` file is already in `.gitignore`.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Chrome Extension Setup

Want to use this on YouTube? Check out the Chrome extension:

```bash
git checkout chrome-extension
cd extension
# Follow instructions in extension/README.md
```

The extension requires the backend API to be running (step 4 above).

## Usage

### Auto-Transcribe with Whisper

1. Click "Upload MP3 File" and select your audio file
2. Click "Auto-Transcribe with Whisper"
3. Wait for the transcription to complete (usually takes a few seconds)
4. The transcript will appear below with timestamps
5. Play the audio and watch it sync automatically!

### Manual Transcript

If you already have a transcript from YouTube or elsewhere:

1. Upload your MP3 file
2. Paste the transcript in the text area with timestamps in this format:
   ```
   0:00 Introduction
   1:30 Main topic begins
   5:45 Detailed explanation
   ```
3. Click "Load Manual Transcript"
4. Play the audio and watch it sync!

## Costs

OpenAI Whisper API costs **$0.006 per minute** of audio transcribed.

Examples:
- 5 minute song: $0.03
- 30 minute podcast: $0.18
- 1 hour lecture: $0.36

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Modern styling with @import syntax
- **OpenAI Whisper API** - Speech-to-text transcription
- **GPT-4o-mini** - Chinese to English translation with Pinyin
- **Chrome Extension API** - Browser integration (extension branch)

## Project Structure

```
song-fluent/
├── app/
│   ├── api/
│   │   ├── transcribe/
│   │   │   └── route.ts          # Whisper API endpoint
│   │   └── translate/
│   │       └── route.ts          # GPT-4o-mini translation
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main player component
│   └── globals.css               # Global styles with animations
├── extension/                    # Chrome extension (chrome-extension branch)
│   ├── manifest.json             # Extension config
│   ├── content.js                # YouTube integration
│   ├── popup.html                # Settings UI
│   └── README.md                 # Extension docs
├── .env.local                    # Your API key (not in git)
├── .env.example                  # Example env file
└── README.md                     # This file
```

## Notes

- The Whisper API has a 25 MB file size limit
- Supported audio formats: MP3, MP4, MPEG, MPGA, M4A, WAV, and WEBM
- Transcription includes automatic timestamp generation
- All processing happens server-side to keep your API key secure
