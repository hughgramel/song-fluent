import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  console.log('🎯 [TRANSLATE API] Request received');

  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();

    console.log('🔑 [TRANSLATE API] Checking API key...');
    if (!apiKey) {
      console.error('❌ [TRANSLATE API] No API key found in environment');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    console.log('✅ [TRANSLATE API] API Key validated:', {
      prefix: apiKey.substring(0, 7) + '...',
      length: apiKey.length
    });

    console.log('📦 [TRANSLATE API] Parsing request body...');
    const { segments } = await request.json();

    console.log('📥 [TRANSLATE API] Translation request received for', segments?.length, 'segments');

    if (!segments || !Array.isArray(segments)) {
      console.error('❌ [TRANSLATE API] Invalid segments provided:', segments);
      return NextResponse.json(
        { error: 'No segments provided' },
        { status: 400 }
      );
    }

    console.log('📝 [TRANSLATE API] Segments to translate:', {
      count: segments.length,
      firstSegment: segments[0],
      lastSegment: segments[segments.length - 1]
    });

    console.log('🤖 [TRANSLATE API] Initializing OpenAI client...');
    const openai = new OpenAI({ apiKey });

    // Create a prompt with all the Chinese text
    const chineseTexts = segments.map((seg: any, idx: number) => `${idx + 1}. ${seg.text}`).join('\n');
    console.log('📝 [TRANSLATE API] Prepared text for translation (first 200 chars):', chineseTexts.substring(0, 200));

    const prompt = `You are a Chinese language expert. For each line of Chinese text below, provide:
1. English translation
2. Pinyin with tone marks

Format your response as a JSON array where each item has this structure:
{
  "english": "English translation here",
  "pinyin": "pinyin with tone marks here"
}

Chinese text:
${chineseTexts}

Respond ONLY with the JSON array, no other text.`;

    console.log('🚀 [TRANSLATE API] Sending request to OpenAI GPT-4o-mini...');
    const startTime = Date.now();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that translates Chinese to English and provides accurate pinyin with tone marks. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ [TRANSLATE API] OpenAI completed in ${duration}s`);

    const responseText = completion.choices[0].message.content?.trim() || '[]';
    console.log('🤖 [TRANSLATE API] Response received:', {
      length: responseText.length,
      tokensUsed: completion.usage,
      finishReason: completion.choices[0].finish_reason
    });

    // Parse the JSON response - handle markdown code blocks
    let translations;
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = responseText;

      // Check for ```json or ``` code blocks
      if (cleanedResponse.includes('```')) {
        console.log('📝 [TRANSLATE API] Removing markdown code blocks from response');
        cleanedResponse = cleanedResponse
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
      }

      // Try to extract JSON array if there's extra text
      const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        console.log('🔍 [TRANSLATE API] Extracted JSON array from response');
        cleanedResponse = jsonMatch[0];
      }

      console.log('🔍 [TRANSLATE API] Attempting to parse JSON...');
      console.log('📄 [TRANSLATE API] First 200 chars:', cleanedResponse.substring(0, 200));
      console.log('📄 [TRANSLATE API] Last 100 chars:', cleanedResponse.substring(cleanedResponse.length - 100));

      translations = JSON.parse(cleanedResponse);

      console.log('✅ [TRANSLATE API] Successfully parsed', translations.length, 'translations');
      console.log('📝 [TRANSLATE API] Sample translation:', translations[0]);
    } catch (parseError: any) {
      console.error('💥 [TRANSLATE API] PARSE ERROR:', {
        error: parseError.message,
        responseLength: responseText.length,
        first500Chars: responseText.substring(0, 500),
        last500Chars: responseText.substring(Math.max(0, responseText.length - 500))
      });
      throw new Error('Failed to parse translation response');
    }

    // Combine original segments with translations
    console.log('🔄 [TRANSLATE API] Combining segments with translations...');
    const enhancedSegments = segments.map((seg: any, idx: number) => ({
      ...seg,
      english: translations[idx]?.english || '',
      pinyin: translations[idx]?.pinyin || ''
    }));

    console.log('✨ [TRANSLATE API] Enhanced segments created:', {
      count: enhancedSegments.length,
      sample: enhancedSegments[0]
    });

    console.log('📤 [TRANSLATE API] Sending response to client');
    return NextResponse.json({ segments: enhancedSegments });

  } catch (error: any) {
    console.error('💥 [TRANSLATE API] ERROR:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
    return NextResponse.json(
      { error: error.message || 'Failed to translate' },
      { status: 500 }
    );
  }
}
