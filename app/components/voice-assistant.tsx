'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useConversation } from '@11labs/react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useAuth } from '../context/AuthContext';
import dynamic from 'next/dynamic';

// Import the ClientOnlyTiaChatInterface component
const ClientOnlyTiaChatInterface = dynamic(
  () => import('./scene/ClientOnlyTiaChatInterface'),
  { ssr: false }
);

// Import TiaCharScene with dynamic import to avoid SSR issues
const TiaCharScene = dynamic(() => import('./TiaCharScene'), { ssr: false });

// Client-only wrapper for TiaCharScene to handle "window is not defined" errors
const ClientTiaCharScene = ({ 
  isActive, 
  intensity = 1,
  institutionId,
  messages,
  onSendMessage,
  typingSpeed
}: { 
  isActive: boolean; 
  intensity?: number;
  institutionId?: string;
  messages: any[];
  onSendMessage: (message: any) => void;
  typingSpeed: number;
}) => {
  return (
    <div className="w-full h-full relative">
      <TiaCharScene isActive={isActive} intensity={intensity} />
      <div className="absolute top-0 right-0 h-full p-4 flex items-center">
        <ClientOnlyTiaChatInterface 
          messages={messages} 
          onSendMessage={onSendMessage} 
          typingSpeed={typingSpeed}
        />
      </div>
    </div>
  );
};

type Message = {
  role: 'user' | 'agent';
  message: string;
  timeInCallSecs: number;
  tentative?: boolean;
};

type ConversationState = {
  messages: Message[];
  error: string | null;
  retryCount: number;
  isLoading: boolean;
  latency: number;
  audioBufferSize: number;
};

const VoiceAssistant = () => {
  const { user } = useAuth();
  const [state, setState] = useState<ConversationState>({
    messages: [],
    error: null,
    retryCount: 0,
    isLoading: false,
    latency: 0,
    audioBufferSize: 4000, // Default buffer size (0.25s at 16kHz)
  });

  const [useFallbackMode, setUseFallbackMode] = useState(false);
  const [fallbackInitialized, setFallbackInitialized] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const lastPingTimeRef = useRef<number>(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Adaptive buffer size based on latency
  useEffect(() => {
    if (state.latency > 100) {
      setState(prev => ({
        ...prev,
        audioBufferSize: Math.min(8000, prev.audioBufferSize + 1000)
      }));
    } else if (state.latency < 50 && state.audioBufferSize > 4000) {
      setState(prev => ({
        ...prev,
        audioBufferSize: Math.max(4000, prev.audioBufferSize - 1000)
      }));
    }
  }, [state.latency]);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected');
      setState(prev => ({ 
        ...prev, 
        error: null,
        isLoading: false,
        retryCount: 0
      }));
    },
    onDisconnect: () => {
      console.log('Disconnected');
      setState(prev => ({ 
        ...prev, 
        error: null,
        isLoading: false
      }));
    },
    onMessage: (message) => {
      if (message.type === 'ping') {
        const pingTime = message.ping_event.ping_ms;
        const currentTime = Date.now();
        const latency = currentTime - lastPingTimeRef.current;
        lastPingTimeRef.current = currentTime;
        
        setState(prev => ({
          ...prev,
          latency: (latency + pingTime) / 2
        }));
        
        // Send pong response
        (conversation as any).send({
          type: 'pong',
          event_id: message.ping_event.event_id
        });
      }
      else if (message.type === 'internal_tentative_agent_response') {
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, {
            role: 'agent',
            message: message.tentative_agent_response_internal_event.tentative_agent_response,
            timeInCallSecs: Date.now() / 1000,
            tentative: true
          }]
        }));
      }
      else if (message.transcript) {
        setState(prev => ({
          ...prev,
          messages: [...prev.messages.filter(m => !m.tentative), {
            role: message.transcript.role,
            message: message.transcript.message,
            timeInCallSecs: message.transcript.time_in_call_secs
          }]
        }));
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        retryCount: prev.retryCount + 1,
        isLoading: false
      }));
      
      if (state.retryCount < 3) {
        const backoffTime = Math.min(2000 * Math.pow(2, state.retryCount), 10000);
        retryTimeoutRef.current = setTimeout(() => {
          startConversation();
        }, backoffTime);
      }
    },
  });

  // Create a wrapper for the conversation API to handle method differences
  const conversationApi = useMemo(() => {
    return {
      ...conversation,
      // Safe wrapper for send method
      sendMessage: (message: string) => {
        if (useFallbackMode) {
          // In fallback mode, simulate a response locally
          console.log('Using fallback mode to handle message:', message);
          
          // Add user message to state (already done in the onSendMessage handler)
          
          // Simulate AI thinking with a delay
          setTimeout(() => {
            // Add a "typing" message from the AI
            setState(prev => ({
              ...prev,
              messages: [...prev.messages, {
                role: 'agent',
                message: 'Thinking...',
                tentative: true,
                timeInCallSecs: Date.now() / 1000
              }]
            }));
            
            // After another delay, replace with the actual response
            setTimeout(() => {
              // Generate a fallback response based on the user's message
              let response = '';
              const userMessage = message.toLowerCase();
              
              if (userMessage.includes('hello') || userMessage.includes('hi') || userMessage.includes('hey')) {
                response = "Hello! I'm Tia, your AI assistant for Reinforce. How can I help you today?";
              } else if (userMessage.includes('how are you')) {
                response = "I'm doing well, thank you for asking! I'm here to help you with anything related to Reinforce.";
              } else if (userMessage.includes('reinforce') || userMessage.includes('platform')) {
                response = "Reinforce is an innovative platform designed to enhance learning experiences through AI-powered interactions. Our goal is to make education more engaging and personalized.";
              } else if (userMessage.includes('feature') || userMessage.includes('can you do')) {
                response = "As your Reinforce assistant, I can help with answering questions, providing information about our platform, and guiding you through various features. In the future, I'll have even more capabilities!";
              } else if (userMessage.includes('thank')) {
                response = "You're welcome! I'm happy to help. Let me know if you need anything else.";
              } else {
                // Default responses for other queries
                const fallbackResponses = [
                  "That's an interesting question. Reinforce is designed to help with exactly that kind of challenge.",
                  "Great question! Reinforce has several features that might help with that.",
                  "I understand what you're asking. Let me explain how Reinforce approaches this topic.",
                  "I'm still learning, but I'd be happy to assist with what I know about Reinforce.",
                  "Reinforce is constantly evolving to better address questions like yours."
                ];
                
                const responseIndex = Math.floor(Math.random() * fallbackResponses.length);
                response = fallbackResponses[responseIndex];
              }
              
              // Update the message list, replacing the tentative message
              setState(prev => ({
                ...prev,
                messages: prev.messages.filter(m => !m.tentative).concat([{
                  role: 'agent',
                  message: response,
                  timeInCallSecs: Date.now() / 1000
                }])
              }));
            }, 1500);
          }, 500);
          
          return;
        }
        
        // Normal API mode
        if (conversation.status === 'connected') {
          try {
            // Use the send method that's part of the API with type assertion
            // to work around TypeScript errors
            (conversation as any).send({
              type: 'text_message',
              text: message
            });
            console.log('Message sent successfully');
          } catch (error) {
            console.error('Error sending message:', error);
            // If API fails, switch to fallback mode
            setUseFallbackMode(true);
            // Retry sending the message in fallback mode
            setTimeout(() => conversationApi.sendMessage(message), 100);
          }
        } else {
          console.warn('Cannot send message: conversation not connected');
        }
      }
    };
  }, [conversation, useFallbackMode]);

  const getSignedUrl = async (): Promise<string> => {
    try {
      const response = await fetch("/api/get-signed-url");
      if (!response.ok) {
        throw new Error(`Failed to get signed url: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (!data.signedUrl) {
        throw new Error('No signed URL returned from API');
      }
      
      console.log('Successfully retrieved signed URL');
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  };

  const startConversation = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, isLoading: true }));
      
      // If we're in fallback mode, just simulate a successful connection
      if (useFallbackMode) {
        console.log('Using fallback mode for conversation');
        
        // If this is the first time initializing fallback mode, add a welcome message
        if (!fallbackInitialized) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            connected: true,
            messages: [
              ...prev.messages,
              {
                role: 'agent',
                message: "Hello! I'm Tia, your AI assistant for Reinforce. I'm currently running in fallback mode due to API connection issues, but I'm still here to help you!",
                timeInCallSecs: Date.now() / 1000
              }
            ]
          }));
          setFallbackInitialized(true);
        } else {
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            connected: true
          }));
        }
        return;
      }
      
      // Check for audio permissions and setup
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          sampleSize: 16,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      // Ensure we have audio input devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasAudioInput = devices.some(device => device.kind === 'audioinput');
      
      if (!hasAudioInput) {
        throw new Error('No audio input devices found');
      }

      console.log('Getting signed URL...');
      const signedUrl = await getSignedUrl();
      console.log('Got signed URL, starting session...');
      
      // Create session options with required parameters
      const sessionOptions = {
        signedUrl,
        initialMessages: [
          {
            role: 'system',
            message: `You are Tia, an AI assistant for Reinforce.
You are helpful, knowledgeable, and friendly.
You provide concise, accurate information.
If you don't know something, admit it rather than making up information.
The current date is ${new Date().toISOString().split('T')[0]}.
The user's name is ${user?.name || 'there'}.
${user?.institution?.name ? `The user is from ${user.institution.name}.` : ''}
`
          }
        ]
      };
      
      // Try to start the session with the API
      console.log('Starting conversation session...');
      try {
        await conversation.startSession(sessionOptions);
        console.log('Conversation session started successfully');
      } catch (error) {
        console.error('Failed to start conversation with API:', error);
        // Switch to fallback mode if API fails
        setUseFallbackMode(true);
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          connected: true
        }));
        return;
      }
      
      // Clean up audio stream when the session ends
      stream.getTracks().forEach(track => {
        // Add event listener to handle track ending
        track.addEventListener('ended', () => {
          console.log('Audio track ended');
        });
      });
      
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to start conversation',
        isLoading: false
      }));
      
      // Switch to fallback mode if there's an error
      setUseFallbackMode(true);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        connected: true
      }));
    }
  }, [conversation, user, useFallbackMode]);

  const stopConversation = useCallback(() => {
    if (useFallbackMode) {
      // In fallback mode, just update the state
      setState(prev => ({ 
        ...prev, 
        connected: false
      }));
      return;
    }
    
    if (conversation.status === 'connected') {
      try {
        conversation.endSession();
        console.log('Conversation session ended');
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }
  }, [conversation, useFallbackMode]);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-black to-purple-900 overflow-hidden">
      {/* TiaChar 3D Scene with Chat Interface */}
      <div className="w-full h-full">
        <ClientTiaCharScene 
          isActive={conversation.status === 'connected' || useFallbackMode} 
          intensity={conversation.status === 'connected' || useFallbackMode ? 1 : 0.5}
          institutionId={user?.institution?.id}
          messages={state.messages}
          onSendMessage={(message) => {
            // Add the user message to the conversation
            setState(prev => ({
              ...prev,
              messages: [...prev.messages, {
                role: 'user',
                message: message.message,
                timeInCallSecs: Date.now() / 1000
              }]
            }));
            
            // Send the message to the conversation API
            if (conversation.status === 'connected') {
              // Use the safe wrapper method
              conversationApi.sendMessage(message.message);
            } else if (conversation.status === 'disconnected' || useFallbackMode) {
              // If in fallback mode or disconnected, start the conversation
              if (useFallbackMode) {
                // Directly use the fallback mode
                conversationApi.sendMessage(message.message);
              } else {
                // Try to start the conversation with the API first
                startConversation().then(() => {
                  // Send the message after connection is established
                  setTimeout(() => {
                    conversationApi.sendMessage(message.message);
                  }, 1000);
                });
              }
            }
          }}
          typingSpeed={50}
        />
      </div>

      {/* Voice Status Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <motion.div
          className={`w-16 h-16 rounded-full flex items-center justify-center ${conversation.status === 'connected' ? 'bg-green-500' : 'bg-gray-500'}`}
          animate={{
            scale: conversation.status === 'connected' ? [1, 1.1, 1] : 1,
            opacity: conversation.status === 'connected' ? 1 : 0.7,
          }}
          transition={{
            scale: {
              repeat: Infinity,
              duration: 2
            }
          }}
          onClick={conversation.status === 'disconnected' ? startConversation : stopConversation}
        >
          <div className="text-white text-2xl">
            {conversation.status === 'disconnected' && '🎤'}
            {conversation.status === 'connecting' && '⏳'}
            {conversation.status === 'connected' && '🔊'}
            {conversation.status === 'disconnecting' && '⏳'}
          </div>
        </motion.div>
        <div className="mt-2 text-white text-sm">
          {conversation.status === 'disconnected' && 'Click to start'}
          {conversation.status === 'connecting' && 'Connecting...'}
          {conversation.status === 'connected' && 'Listening...'}
          {conversation.status === 'disconnecting' && 'Disconnecting...'}
        </div>
        {state.error && (
          <div className="mt-2 text-red-500 text-xs max-w-xs text-center">
            {state.error}
          </div>
        )}
      </div>

      {/* Debug Info - can be removed in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 text-xs text-white bg-black/50 p-2 rounded">
          <div>Status: {conversation.status}</div>
          <div>Latency: {state.latency.toFixed(0)}ms</div>
          <div>Buffer: {state.audioBufferSize} samples</div>
          <div>Messages: {state.messages.length}</div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
