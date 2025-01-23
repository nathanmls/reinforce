'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useConversation } from '@11labs/react';
import { useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { VoiceSphere } from './VoiceSphere';

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

const VoiceWaveform = ({ isActive, intensity = 1 }: { isActive: boolean; intensity?: number }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-32 h-32">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <VoiceSphere intensity={isActive ? intensity : 0} />
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>
      <div className="flex items-center gap-1 h-8">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: isActive ? ['40%', `${80 * intensity}%`, '40%'] : '40%',
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
            className="w-1 bg-blue-500 rounded-full"
          />
        ))}
      </div>
    </div>
  );
};

export default function VoiceAssistant() {
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
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto p-4">
      <div className="flex gap-2">
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected' || state.isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          {state.isLoading && conversation.status !== 'connected' ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Connecting...
            </>
          ) : (
            'Start Conversation'
          )}
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== 'connected' || state.isLoading}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300 hover:bg-red-600 transition-colors"
        >
          {state.isLoading && conversation.status === 'connected' ? 'Disconnecting...' : 'Stop Conversation'}
        </button>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-4">
        <p className="text-gray-700">Status: {conversation.status}</p>
        {state.latency > 0 && (
          <p className="text-sm text-gray-500">
            Latency: {state.latency.toFixed(0)}ms
          </p>
        )}
        {conversation.status === 'connected' && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">You:</span>
              <motion.div
                animate={{
                  scale: !conversation.isSpeaking ? [1, 1.2, 1] : 1,
                  opacity: !conversation.isSpeaking ? [0.5, 1, 0.5] : 0.5,
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-3 h-3 rounded-full bg-green-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">AI:</span>
              <VoiceWaveform 
                isActive={conversation.isSpeaking} 
                intensity={Math.min(1, 10000 / state.audioBufferSize)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {state.error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-4 bg-red-100 border border-red-300 rounded text-red-700"
        >
          {state.error}
          {state.retryCount < 3 && (
            <span className="ml-2">
              Retrying in {Math.min(2 * Math.pow(2, state.retryCount), 10)} seconds...
            </span>
          )}
        </motion.div>
      )}

      {/* Chat History */}
      <div className="w-full mt-4 space-y-4 max-h-[500px] overflow-y-auto p-4 bg-gray-50 rounded">
        {state.messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-3 rounded ${
              msg.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-white'
            } max-w-[80%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'} ${
              msg.tentative ? 'opacity-70' : ''
            }`}
          >
            <p className="text-sm text-gray-600">{msg.role === 'user' ? 'You' : 'AI'}</p>
            <p className="mt-1">{msg.message}</p>
            <p className="text-xs text-gray-500 mt-1">{msg.timeInCallSecs}s</p>
          </motion.div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
