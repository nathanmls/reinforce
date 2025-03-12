'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useConversation } from '@11labs/react';
import { useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useAuth } from '../context/AuthContext';
import dynamic from 'next/dynamic';

// Import TiaCharScene with dynamic import to avoid SSR issues
const TiaCharScene = dynamic(() => import('./TiaCharScene'), { ssr: false });

// Client-only wrapper for TiaCharScene to handle "window is not defined" errors
const ClientTiaCharScene = ({ 
  isActive, 
  intensity = 1,
  institutionId 
}: { 
  isActive: boolean; 
  intensity?: number;
  institutionId?: string;
}) => {
  return (
    <div className="w-full h-full">
      <TiaCharScene isActive={isActive} intensity={intensity} />
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
        conversation.send({
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

  const getSignedUrl = async (): Promise<string> => {
    const response = await fetch("/api/get-signed-url");
    if (!response.ok) {
      throw new Error(`Failed to get signed url: ${response.statusText}`);
    }
    const { signedUrl } = await response.json();
    return signedUrl;
  };

  const startConversation = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, isLoading: true }));
      
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

      const signedUrl = await getSignedUrl();
      await conversation.startSession({ 
        signedUrl,
        protocol: 'convai',
        audioChunkSize: state.audioBufferSize,
      });

      // Cleanup audio stream
      stream.getTracks().forEach(track => track.stop());

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start conversation',
        isLoading: false
      }));
    }
  }, [conversation, state.audioBufferSize]);

  const stopConversation = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await conversation.endSession();
      setState(prev => ({ 
        ...prev, 
        error: null,
        isLoading: false,
        messages: [],
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to stop conversation',
        isLoading: false
      }));
    }
  }, [conversation]);

  return (
    <div className="flex flex-col md:flex-row h-full w-full">
      {/* TiaChar Scene - Takes full height and fills available width */}
      <div className="w-full md:w-1/2 h-[400px] md:h-full">
        <ClientTiaCharScene 
          isActive={conversation.status === 'connected'} 
          intensity={state.messages.length > 0 ? 1 : 0.5}
          institutionId={user?.institutionId}
        />
      </div>

      {/* Chat Interface */}
      <div className="w-full md:w-1/2 h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {state.messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                } ${message.tentative ? 'opacity-70' : ''}`}
              >
                {message.message}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200">
          {state.error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
              Error: {state.error}
            </div>
          )}

          <div className="flex justify-center items-center">
            {conversation.status === 'disconnected' ? (
              <button
                onClick={startConversation}
                disabled={state.isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                {state.isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      ></path>
                    </svg>
                    Start Conversation
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={stopConversation}
                className="px-6 py-3 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
                End Conversation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceAssistant;
