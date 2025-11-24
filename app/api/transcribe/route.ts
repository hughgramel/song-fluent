import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  console.log('🎯 [TRANSCRIBE API] Request received');

  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();

    console.log('🔑 [TRANSCRIBE API] Checking API key...');
    if (!apiKey) {
      console.error('❌ [TRANSCRIBE API] No API key found in environment');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    console.log('✅ [TRANSCRIBE API] API Key validated:', {
      prefix: apiKey.substring(0, 7) + '...',
      length: apiKey.length
    });

    console.log('📦 [TRANSCRIBE API] Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('❌ [TRANSCRIBE API] No file in form data');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('📁 [TRANSCRIBE API] File received:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type
    });

    console.log('🤖 [TRANSCRIBE API] Initializing OpenAI client...');
    const openai = new OpenAI({ apiKey });

    console.log('🎤 [TRANSCRIBE API] Sending to Whisper API...');
    const startTime = Date.now();

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment']
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ [TRANSCRIBE API] Whisper completed in ${duration}s`);
    console.log('📝 [TRANSCRIBE API] Raw transcription:', {
      language: transcription.language,
      duration: transcription.duration,
      segments: transcription.segments?.length || 0,
      textLength: transcription.text?.length || 0
    });

    const formattedTranscript = transcription.segments?.map((segment: any) => ({
      time: Math.floor(segment.start),
      timeStr: formatTime(segment.start),
      text: segment.text.trim()
    })) || [];

    console.log('✨ [TRANSCRIBE API] Formatted transcript:', {
      segments: formattedTranscript.length,
      firstSegment: formattedTranscript[0],
      lastSegment: formattedTranscript[formattedTranscript.length - 1]
    });

    console.log('📤 [TRANSCRIBE API] Sending response to client');
    return NextResponse.json({
      transcript: formattedTranscript,
      fullText: transcription.text
    });

  } catch (error: any) {
    console.error('💥 [TRANSCRIBE API] ERROR:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });

    return NextResponse.json(
      { error: error.message || 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
