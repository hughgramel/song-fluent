'use client';

import { useState, useRef, useEffect } from 'react';

interface TranscriptSegment {
  time: number;
  timeStr: string;
  text: string;
  english?: string;
  pinyin?: string;
}

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [manualTranscript, setManualTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loadingStatus, setLoadingStatus] = useState<string>('');

  const audioRef = useRef<HTMLAudioElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('📁 File uploaded:', {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type
      });
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setTranscript([]);
      setLoadingStatus('File loaded successfully');
      setTimeout(() => setLoadingStatus(''), 2000);
    }
  };

  const handleAutoTranscribe = async () => {
    if (!audioFile) {
      console.warn('⚠️ No audio file selected');
      alert('Please upload an audio file first');
      return;
    }

    console.log('🎤 Starting transcription...');
    setIsTranscribing(true);
    setLoadingStatus('Uploading audio to OpenAI Whisper...');

    try {
      const formData = new FormData();
      formData.append('file', audioFile);

      console.log('📤 Sending file to /api/transcribe');
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Response received:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Transcription error:', error);
        throw new Error(error.error || 'Transcription failed');
      }

      const data = await response.json();
      console.log('✅ Transcription complete:', {
        segments: data.transcript.length,
        firstSegment: data.transcript[0]
      });

      setTranscript(data.transcript);
      setLoadingStatus('Transcription complete! Starting translation...');

      // Automatically translate if transcript is generated
      await handleTranslate(data.transcript);
    } catch (error: any) {
      console.error('❌ Transcription failed:', error);
      setLoadingStatus('');
      alert(`Error: ${error.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTranslate = async (segments?: TranscriptSegment[]) => {
    const segmentsToTranslate = segments || transcript;

    if (!segmentsToTranslate.length) {
      console.warn('⚠️ No transcript to translate');
      alert('No transcript to translate');
      return;
    }

    console.log('🌐 Starting translation for', segmentsToTranslate.length, 'segments');
    setIsTranslating(true);
    setLoadingStatus(`Translating ${segmentsToTranslate.length} segments...`);

    try {
      console.log('📤 Sending translation request to /api/translate');
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segments: segmentsToTranslate }),
      });

      console.log('📥 Translation response received:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Translation error:', error);
        throw new Error(error.error || 'Translation failed');
      }

      const data = await response.json();
      console.log('✅ Translation complete:', {
        segments: data.segments.length,
        sampleTranslation: data.segments[0]?.english
      });

      setTranscript(data.segments);
      setLoadingStatus('Translation complete!');
      setTimeout(() => setLoadingStatus(''), 3000);
    } catch (error: any) {
      console.error('❌ Translation failed:', error);
      setLoadingStatus('');
      alert(`Error: ${error.message}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleManualTranscript = () => {
    if (!manualTranscript.trim()) {
      console.warn('⚠️ No manual transcript provided');
      alert('Please paste a transcript');
      return;
    }

    console.log('📝 Parsing manual transcript...');
    setLoadingStatus('Parsing transcript...');

    const parsed = parseManualTranscript(manualTranscript);
    console.log('✅ Manual transcript parsed:', {
      segments: parsed.length,
      firstSegment: parsed[0]
    });

    setTranscript(parsed);
    setLoadingStatus('Transcript loaded successfully!');
    setTimeout(() => setLoadingStatus(''), 2000);
  };

  const parseManualTranscript = (text: string): TranscriptSegment[] => {
    const lines = text.split('\n');
    const segments: TranscriptSegment[] = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      const timeRegex = /^(\d+):(\d+)(?::(\d+))?\s+(.+)$/;
      const match = line.match(timeRegex);

      if (match) {
        const hours = match[3] ? parseInt(match[1]) : 0;
        const minutes = match[3] ? parseInt(match[2]) : parseInt(match[1]);
        const seconds = match[3] ? parseInt(match[3]) : parseInt(match[2]);
        const text = match[4];

        const timeInSeconds = hours * 3600 + minutes * 60 + seconds;

        segments.push({
          time: timeInSeconds,
          timeStr: match[3] ? `${match[1]}:${match[2]}:${match[3]}` : `${match[1]}:${match[2]}`,
          text: text
        });
      } else {
        const altRegex = /(\d+):(\d+)(?::(\d+))?/;
        const altMatch = line.match(altRegex);

        if (altMatch) {
          const hours = altMatch[3] ? parseInt(altMatch[1]) : 0;
          const minutes = altMatch[3] ? parseInt(altMatch[2]) : parseInt(altMatch[1]);
          const seconds = altMatch[3] ? parseInt(altMatch[3]) : parseInt(altMatch[2]);

          const timeInSeconds = hours * 3600 + minutes * 60 + seconds;
          const textPart = line.replace(altMatch[0], '').trim();

          segments.push({
            time: timeInSeconds,
            timeStr: altMatch[0],
            text: textPart || 'No description'
          });
        }
      }
    }

    return segments.sort((a, b) => a.time - b.time);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);

      let newActiveIndex = -1;
      for (let i = 0; i < transcript.length; i++) {
        if (time >= transcript[i].time) {
          newActiveIndex = i;
        } else {
          break;
        }
      }
      setActiveIndex(newActiveIndex);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTranscriptClick = (time: number) => {
    if (audioRef.current) {
      console.log('⏩ Seeking to:', formatTime(time));
      audioRef.current.currentTime = time;
      audioRef.current.play();
    }
  };

  useEffect(() => {
    if (activeIndex >= 0 && transcriptContainerRef.current) {
      const activeElement = transcriptContainerRef.current.querySelector(
        `[data-index="${activeIndex}"]`
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [activeIndex]);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          MP3 Transcript Sync Player
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <label className="block">
              <span className="text-lg font-semibold text-gray-700">1. Upload MP3 File:</span>
              <input
                type="file"
                accept="audio/mp3,audio/mpeg"
                onChange={handleFileUpload}
                className="mt-2 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-50 file:text-purple-700
                  hover:file:bg-purple-100 cursor-pointer"
              />
            </label>

            {audioFile && (
              <button
                onClick={handleAutoTranscribe}
                disabled={isTranscribing}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400
                  text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {isTranscribing ? 'Generating Transcript...' : '2. Generate Transcript with AI'}
              </button>
            )}
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-lg font-semibold text-gray-700">Or Use Existing Transcript:</span>
              <textarea
                value={manualTranscript}
                onChange={(e) => setManualTranscript(e.target.value)}
                placeholder="Paste transcript with timestamps:&#10;0:00 Introduction&#10;1:30 Main topic..."
                className="mt-2 block w-full h-32 px-3 py-2 text-sm border border-gray-300
                  rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </label>

            <button
              onClick={handleManualTranscript}
              className="w-full bg-indigo-600 hover:bg-indigo-700
                text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Load Existing Transcript
            </button>
          </div>
        </div>

        {audioUrl && (
          <div className="mb-8 space-y-4">
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-600">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        )}

        {transcript.length > 0 && (
          <div className="border-t-2 border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Transcript</h2>
              {transcript.some(s => !s.english) && (
                <button
                  onClick={() => handleTranslate()}
                  disabled={isTranslating}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400
                    text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  {isTranslating ? 'Translating...' : 'Translate to English'}
                </button>
              )}
            </div>
            <div
              ref={transcriptContainerRef}
              className="max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4 space-y-4"
            >
              {transcript.map((segment, index) => (
                <div
                  key={index}
                  data-index={index}
                  onClick={() => handleTranscriptClick(segment.time)}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-300 border-l-4 ${
                    activeIndex === index
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-800 shadow-lg transform scale-105'
                      : 'bg-white hover:bg-gray-100 border-transparent hover:border-purple-400 hover:shadow-md'
                  }`}
                  style={{
                    animation: activeIndex === index ? 'pulse 2s ease-in-out infinite' : 'none'
                  }}
                >
                  <div className="flex items-center mb-2">
                    <span className={`font-bold text-sm px-2 py-1 rounded ${
                      activeIndex === index ? 'bg-white text-purple-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {segment.timeStr}
                    </span>
                  </div>

                  {segment.english && (
                    <div className={`text-sm mb-2 ${
                      activeIndex === index ? 'text-purple-100' : 'text-gray-600'
                    }`}>
                      {segment.english}
                    </div>
                  )}

                  <div className={`text-xl font-medium mb-2 ${
                    activeIndex === index ? 'text-white' : 'text-gray-900'
                  }`}>
                    {segment.text}
                  </div>

                  {segment.pinyin && (
                    <div className={`text-sm italic ${
                      activeIndex === index ? 'text-purple-200' : 'text-gray-500'
                    }`}>
                      {segment.pinyin}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading Status Indicator */}
      {loadingStatus && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3 animate-slide-in z-50">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span className="font-medium">{loadingStatus}</span>
        </div>
      )}
    </div>
  );
}
