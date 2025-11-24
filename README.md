# MP3 Transcript Sync Player

A Next.js application that syncs MP3 audio playback with transcripts, featuring automatic transcription using OpenAI Whisper API.

## Features

- Upload MP3 files and play them in the browser
- Auto-transcribe audio using OpenAI Whisper API
- Manual transcript input support (with timestamps)
- Real-time transcript syncing with audio playback
- Click any transcript line to jump to that timestamp
- Auto-scroll and highlight current transcript line
- Beautiful, responsive UI with Tailwind CSS

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

Open [http://localhost:3000](http://localhost:3000) in your browser.

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

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **OpenAI Whisper API** - Audio transcription

## Project Structure

```
song-fluent/
├── app/
│   ├── api/
│   │   └── transcribe/
│   │       └── route.ts          # Whisper API endpoint
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main player component
│   └── globals.css               # Global styles
├── .env.local                    # Your API key (not in git)
├── .env.example                  # Example env file
└── README.md                     # This file
```

## Notes

- The Whisper API has a 25 MB file size limit
- Supported audio formats: MP3, MP4, MPEG, MPGA, M4A, WAV, and WEBM
- Transcription includes automatic timestamp generation
- All processing happens server-side to keep your API key secure
