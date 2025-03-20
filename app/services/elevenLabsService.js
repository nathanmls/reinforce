'use client';

import { ELEVENLABS_API_KEY, ELEVENLABS_API_URL } from '../config/elevenlabs';

// Helper function to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// ElevenLabs API service
export const elevenLabsService = {
  // Create a new agent
  async createAgent(agentData, customApiKey = null) {
    // Ensure we're in a browser environment
    if (!isBrowser) {
      throw new Error('ElevenLabs API can only be used in a browser environment');
    }
    
    const apiKey = customApiKey || ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      throw new Error('ElevenLabs API key is required');
    }
    
    try {
      // Format the request body according to ElevenLabs API requirements
      const requestBody = {
        conversation_config: {
          agent: {
            name: agentData.name,
            description: agentData.description,
            first_message: agentData.first_message || "Hello, how can I help you today?",
            voice_id: agentData.voice_id
          },
          llm: {
            provider: "openai",
            model: "gpt-3.5-turbo"
          }
        }
      };
      
      console.log('Creating ElevenLabs agent with data:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`${ELEVENLABS_API_URL}/v1/convai/agents/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { detail: errorText || 'Unknown error' };
        }
        
        console.error('Error response status:', response.status);
        console.error('Error response headers:', Object.fromEntries([...response.headers.entries()]));
        console.error('Error response body:', errorData);
        
        throw new Error(`Failed to create agent: ${JSON.stringify(errorData)}`);
      }
      
      const result = await response.json();
      console.log('Successfully created agent:', result);
      return result;
    } catch (error) {
      console.error('Error creating ElevenLabs agent:', error);
      throw error;
    }
  },
  
  // Get an agent by ID
  async getAgent(agentId, customApiKey = null) {
    // Ensure we're in a browser environment
    if (!isBrowser) {
      throw new Error('ElevenLabs API can only be used in a browser environment');
    }
    
    const apiKey = customApiKey || ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      throw new Error('ElevenLabs API key is required');
    }
    
    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/agents/${agentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Failed to get agent: ${errorData.detail || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting ElevenLabs agent with ID ${agentId}:`, error);
      throw error;
    }
  },
  
  // Update an agent
  async updateAgent(agentId, agentData, customApiKey = null) {
    // Ensure we're in a browser environment
    if (!isBrowser) {
      throw new Error('ElevenLabs API can only be used in a browser environment');
    }
    
    const apiKey = customApiKey || ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      throw new Error('ElevenLabs API key is required');
    }
    
    if (!agentId) {
      throw new Error('Agent ID is required for updating an agent');
    }
    
    try {
      // Format the request body according to ElevenLabs API requirements
      const requestBody = {
        conversation_config: {
          agent: {
            name: agentData.name,
            description: agentData.description,
            first_message: agentData.first_message || "Hello, how can I help you today?",
            voice_id: agentData.voice_id
          },
          llm: {
            provider: "openai",
            model: "gpt-3.5-turbo"
          }
        }
      };
      
      console.log('Updating ElevenLabs agent with data:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`${ELEVENLABS_API_URL}/v1/convai/agents/${agentId}/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { detail: errorText || 'Unknown error' };
        }
        
        console.error('Error response status:', response.status);
        console.error('Error response headers:', Object.fromEntries([...response.headers.entries()]));
        console.error('Error response body:', errorData);
        
        throw new Error(`Failed to update agent: ${JSON.stringify(errorData)}`);
      }
      
      const result = await response.json();
      console.log('Successfully updated agent:', result);
      return result;
    } catch (error) {
      console.error('Error updating ElevenLabs agent:', error);
      throw error;
    }
  },
  
  // Delete an agent
  async deleteAgent(agentId, customApiKey = null) {
    // Ensure we're in a browser environment
    if (!isBrowser) {
      throw new Error('ElevenLabs API can only be used in a browser environment');
    }
    
    const apiKey = customApiKey || ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      throw new Error('ElevenLabs API key is required');
    }
    
    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/v1/convai/agents/${agentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Failed to delete agent: ${JSON.stringify(errorData)}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Error deleting ElevenLabs agent with ID ${agentId}:`, error);
      throw error;
    }
  },
  
  // Check if the ElevenLabs API is available
  async checkApiStatus(customApiKey = null) {
    // Ensure we're in a browser environment
    if (!isBrowser) {
      return false;
    }
    
    const apiKey = customApiKey || ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      return false;
    }
    
    try {
      // Use a simple endpoint to check if the API is responsive
      // We'll use the voices endpoint as it's lightweight
      const response = await fetch(`${ELEVENLABS_API_URL}/v1/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error checking ElevenLabs API status:', error);
      return false;
    }
  },
  
  // Get available voices from ElevenLabs
  async getVoices(customApiKey = null) {
    // Ensure we're in a browser environment
    if (!isBrowser) {
      throw new Error('ElevenLabs API can only be used in a browser environment');
    }
    
    const apiKey = customApiKey || ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      throw new Error('ElevenLabs API key is required');
    }
    
    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/v1/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Failed to get voices: ${JSON.stringify(errorData)}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting ElevenLabs voices:', error);
      throw error;
    }
  },
  
  // Get a specific agent by ID
  async getAgent(agentId, customApiKey = null) {
    // Ensure we're in a browser environment
    if (!isBrowser) {
      throw new Error('ElevenLabs API can only be used in a browser environment');
    }
    
    const apiKey = customApiKey || ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      throw new Error('ElevenLabs API key is required');
    }
    
    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/v1/convai/agents/${agentId}`, {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Failed to get agent: ${JSON.stringify(errorData)}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error getting ElevenLabs agent with ID ${agentId}:`, error);
      throw error;
    }
  }
};
