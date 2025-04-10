'use client';

/**
 * TalkingHead Implementation using ElevenLabs API
 * 
 * This implementation mimics the API of the TalkingHead library
 * but uses ElevenLabs for text-to-speech functionality.
 */

export class TalkingHead {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.audioContext = options.audioContext || null;
    this.audioSource = null;
    this.audioBuffer = null;
    this.isInitialized = false;
    this.isSpeaking = false;
    this.mood = 'neutral';
    this.onAudioEndCallback = null;
    
    // Bind methods
    this.handleAudioEnd = this.handleAudioEnd.bind(this);
    
    console.log('TalkingHead initialized with options:', options);
  }

  async initialize() {
    try {
      if (!this.audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
      }
      
      this.isInitialized = true;
      console.log('TalkingHead initialized successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('Error initializing TalkingHead:', error);
      return Promise.reject(error);
    }
  }

  async speakText(text, options = {}) {
    if (!this.isInitialized) {
      console.warn('TalkingHead: Cannot speak before initialization');
      return Promise.reject(new Error('Not initialized'));
    }
    
    if (this.isSpeaking) {
      // Stop current audio if already speaking
      this.stopAudio();
    }
    
    const mood = options.mood || this.mood;
    const voiceId = options.voiceId || this.options.voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Default to Rachel
    
    console.log(`TalkingHead speaking: "${text}"`, options);
    
    try {
      this.isSpeaking = true;
      
      // Get audio from ElevenLabs API
      const audioData = await this.getAudioFromElevenLabs(text, voiceId, mood);
      
      // Play the audio
      await this.playAudio(audioData);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error making avatar speak:', error);
      this.isSpeaking = false;
      return Promise.reject(error);
    }
  }

  async getAudioFromElevenLabs(text, voiceId, mood) {
    try {
      // Add mood-based instructions to improve voice quality
      let textWithMood = text;
      if (mood === 'happy') {
        textWithMood = `[Speaking with enthusiasm and happiness] ${text}`;
      } else if (mood === 'sad') {
        textWithMood = `[Speaking with sadness] ${text}`;
      } else if (mood === 'angry') {
        textWithMood = `[Speaking with anger] ${text}`;
      }
      
      // Set up the request to ElevenLabs API
      const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
        },
        body: JSON.stringify({
          text: textWithMood,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          }
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }
      
      // Convert the response to an ArrayBuffer
      const arrayBuffer = await response.arrayBuffer();
      return arrayBuffer;
    } catch (error) {
      console.error('Error getting audio from ElevenLabs:', error);
      throw error;
    }
  }

  async playAudio(audioData) {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }
    
    try {
      // Stop any currently playing audio
      this.stopAudio();
      
      // Create a new buffer from the audio data
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      this.audioBuffer = audioBuffer;
      
      // Create a new source node
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Connect source to destination
      source.connect(this.audioContext.destination);
      
      // Set up ended event handler
      source.onended = this.handleAudioEnd;
      
      // Store source reference for later control
      this.audioSource = source;
      
      // Start playback
      source.start(0);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error playing audio:', error);
      this.isSpeaking = false;
      throw error;
    }
  }

  stopAudio() {
    if (this.audioSource) {
      try {
        this.audioSource.onended = null;
        this.audioSource.stop();
        this.audioSource.disconnect();
      } catch (e) {
        // Ignore errors when stopping (may already be stopped)
      }
      this.audioSource = null;
    }
    this.isSpeaking = false;
  }

  handleAudioEnd() {
    this.isSpeaking = false;
    this.audioSource = null;
    
    if (this.onAudioEndCallback) {
      this.onAudioEndCallback();
    }
  }

  setOnAudioEnd(callback) {
    this.onAudioEndCallback = callback;
  }

  clearOnAudioEnd() {
    this.onAudioEndCallback = null;
  }

  makeEyeContact(duration = 1000) {
    console.log(`TalkingHead making eye contact for ${duration}ms`);
    return this;
  }

  lookAhead(duration = 1000) {
    console.log(`TalkingHead looking ahead for ${duration}ms`);
    return this;
  }

  setMood(mood = 'neutral') {
    console.log(`TalkingHead setting mood to: ${mood}`);
    this.mood = mood;
    return this;
  }

  stop() {
    console.log('TalkingHead stopped');
    this.stopAudio();
    this.clearOnAudioEnd();
    this.isInitialized = false;
  }
}
