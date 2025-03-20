'use client';

import { useState, useEffect } from 'react';
import { elevenLabsService } from '../../services/elevenLabsService';
import LoadingSpinner from '../LoadingSpinner';
import ClientOnly from '../ClientOnly';

// The main form component
function ElevenLabsAgentFormContent({ mentor, onSubmit, onCancel, isEditing = false, agent = null, initialData = null }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    first_message: '', 
    voice_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [voices, setVoices] = useState([]);
  const [loadingVoices, setLoadingVoices] = useState(true);

  useEffect(() => {
    // Initialize form data from props
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        first_message: initialData.first_message || initialData.initial_message || '',
        voice_id: initialData.voice_id || ''
      });
    } else if (isEditing && agent) {
      setFormData({
        name: agent.name || '',
        description: agent.description || '',
        first_message: agent.first_message || agent.initial_message || '',
        voice_id: agent.voice_id || ''
      });
    }
    
    // Load available voices from ElevenLabs API
    const loadVoices = async () => {
      try {
        setLoadingVoices(true);
        const voicesData = await elevenLabsService.getVoices();
        if (voicesData && voicesData.voices) {
          setVoices(voicesData.voices);
        } else {
          setError('Failed to load voices from ElevenLabs API');
        }
      } catch (error) {
        console.error('Error loading voices:', error);
        setError('Failed to load voices: ' + error.message);
      } finally {
        setLoadingVoices(false);
      }
    };
    
    loadVoices();
  }, [isEditing, agent, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Make sure mentor is defined
      if (!mentor || !mentor.id) {
        throw new Error('Mentor information is missing');
      }
      
      // Call the parent component's onSubmit function with the form data
      await onSubmit(mentor.id, formData);
      
      // If we get here, the submission was successful
      setLoading(false);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(`Failed to ${isEditing ? 'update' : 'create'} agent: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Edit ElevenLabs Agent' : 'Create ElevenLabs Agent'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="first_message">
              Initial Message
            </label>
            <textarea
              id="first_message"
              name="first_message"
              value={formData.first_message}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
              required
              placeholder="This will be the first message the agent sends to users"
            />
            <p className="text-xs text-gray-500 mt-1">
              This message will be sent when a user starts a conversation with the agent
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="voice_id">
              Voice
            </label>
            {loadingVoices ? (
              <div className="py-2">Loading voices...</div>
            ) : (
              <select
                id="voice_id"
                name="voice_id"
                value={formData.voice_id}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select a voice</option>
                {voices.map(voice => (
                  <option key={voice.voice_id} value={voice.voice_id}>
                    {voice.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`${loading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
            >
              {loading ? (
                <span className="flex items-center">
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Processing...</span>
                </span>
              ) : (
                isEditing ? 'Update Agent' : 'Create Agent'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Export a wrapped version of the component that only renders on the client side
export default function ElevenLabsAgentForm(props) {
  return (
    <ClientOnly>
      <ElevenLabsAgentFormContent {...props} />
    </ClientOnly>
  );
}
