'use client';

// ElevenLabs API configuration
// This file centralizes all ElevenLabs API related configuration

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// ElevenLabs API key - use environment variable if available
// In development, we can use a fallback key, but in production this should come from environment variables
let ELEVENLABS_API_KEY = '';

// Only access environment variables in browser context to avoid SSR issues
if (isBrowser) {
  ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || 'sk_7d082225ee6a69ae4a0019b6ee0d3339f28ca946ffec0511';
}

// ElevenLabs API URL
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io';

export {
  ELEVENLABS_API_KEY,
  ELEVENLABS_API_URL
};
