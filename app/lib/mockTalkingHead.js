/**
 * Mock TalkingHead Library
 * 
 * This is a simplified mock implementation of the TalkingHead functionality
 * to be used as a fallback when the actual library isn't available.
 * It provides the same API interface but with simplified functionality.
 */

export class TalkingHead {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.isInitialized = false;
    this.isSpeaking = false;
    
    console.log('Mock TalkingHead initialized with options:', options);
  }

  async showAvatar(options = {}) {
    console.log('Mock TalkingHead showing avatar with options:', options);
    this.isInitialized = true;
    return Promise.resolve();
  }

  async speakText(text, options = {}) {
    if (!this.isInitialized) {
      console.warn('Mock TalkingHead: Cannot speak before initialization');
      return Promise.reject(new Error('Not initialized'));
    }
    
    console.log(`Mock TalkingHead speaking: "${text}"`, options);
    this.isSpeaking = true;
    
    // Simulate speaking time based on text length
    const speakingTime = text.length * 50; // 50ms per character
    
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isSpeaking = false;
        console.log('Mock TalkingHead finished speaking');
        resolve();
      }, speakingTime);
    });
  }

  makeEyeContact(duration = 1000) {
    console.log(`Mock TalkingHead making eye contact for ${duration}ms`);
    return this;
  }

  lookAhead(duration = 1000) {
    console.log(`Mock TalkingHead looking ahead for ${duration}ms`);
    return this;
  }

  setMood(mood = 'neutral') {
    console.log(`Mock TalkingHead setting mood to: ${mood}`);
    return this;
  }

  stop() {
    console.log('Mock TalkingHead stopped');
    this.isSpeaking = false;
    this.isInitialized = false;
  }
}
