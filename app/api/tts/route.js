import { NextResponse } from 'next/server';

/**
 * API route for Google Text-to-Speech API proxy
 * This route forwards requests to Google TTS API with proper authentication
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Forward the request to Google TTS API
    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GOOGLE_TTS_API_KEY || ''}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google TTS API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Google TTS API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
