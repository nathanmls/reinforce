import { db as dbImport } from '../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where } from 'firebase/firestore';
import { validateMentor } from '../models/Mentor';
import { elevenLabsService } from './elevenLabsService';
import { ELEVENLABS_API_KEY } from '../config/elevenlabs';

const MENTORS_COLLECTION = 'mentors';
const INSTITUTIONS_COLLECTION = 'institutions';

export const mentorService = {
  // Create a new mentor
  async createMentor(mentorData, customDb = null) {
    const db = customDb || dbImport;
    
    // Validate that db is initialized
    if (!db) {
      throw new Error('Firestore is not initialized. This operation is only available in the browser.');
    }
    
    try {
      // Validate mentor data
      const validatedData = validateMentor(mentorData);
      
      // Add created and updated timestamps
      const mentorWithTimestamps = {
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
        institutions: []
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, MENTORS_COLLECTION), mentorWithTimestamps);
      
      // Return the created mentor with ID
      return {
        id: docRef.id,
        ...mentorWithTimestamps
      };
    } catch (error) {
      console.error('Error creating mentor:', error);
      throw error;
    }
  },

  // Get all mentors
  async getAllMentors(customDb = null) {
    const db = customDb || dbImport;
    
    // Validate that db is initialized
    if (!db) {
      throw new Error('Firestore is not initialized. This operation is only available in the browser.');
    }
    
    try {
      const querySnapshot = await getDocs(collection(db, MENTORS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting all mentors:', error);
      throw error;
    }
  },

  // Get mentor by ID
  async getMentorById(mentorId, customDb = null) {
    const db = customDb || dbImport;
    
    // Validate that db is initialized
    if (!db) {
      throw new Error('Firestore is not initialized. This operation is only available in the browser.');
    }
    
    try {
      const mentorDoc = await getDoc(doc(db, MENTORS_COLLECTION, mentorId));
      
      if (!mentorDoc.exists()) {
        throw new Error(`Mentor with ID ${mentorId} not found`);
      }
      
      return {
        id: mentorDoc.id,
        ...mentorDoc.data()
      };
    } catch (error) {
      console.error(`Error getting mentor with ID ${mentorId}:`, error);
      throw error;
    }
  },

  // Get mentors for a specific institution
  async getMentorsByInstitution(institutionId, customDb = null) {
    const db = customDb || dbImport;
    
    // Validate that db is initialized
    if (!db) {
      throw new Error('Firestore is not initialized. This operation is only available in the browser.');
    }
    
    try {
      const q = query(
        collection(db, MENTORS_COLLECTION),
        where('institutions', 'array-contains', institutionId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting mentors by institution:', error);
      throw error;
    }
  },

  // Update a mentor
  async updateMentor(mentorId, mentorData, customDb = null) {
    const db = customDb || dbImport;
    
    // Validate that db is initialized
    if (!db) {
      throw new Error('Firestore is not initialized. This operation is only available in the browser.');
    }
    
    try {
      // Validate mentor data
      const validatedData = validateMentor(mentorData);
      
      // Add updated timestamp
      const mentorWithTimestamp = {
        ...validatedData,
        updatedAt: new Date()
      };
      
      // Update in Firestore
      await updateDoc(doc(db, MENTORS_COLLECTION, mentorId), mentorWithTimestamp);
      
      // Return the updated mentor with ID
      return {
        id: mentorId,
        ...mentorWithTimestamp
      };
    } catch (error) {
      console.error(`Error updating mentor with ID ${mentorId}:`, error);
      throw error;
    }
  },

  // Delete a mentor
  async deleteMentor(mentorId, customDb = null) {
    const db = customDb || dbImport;
    
    // Validate that db is initialized
    if (!db) {
      throw new Error('Firestore is not initialized. This operation is only available in the browser.');
    }
    
    try {
      await deleteDoc(doc(db, MENTORS_COLLECTION, mentorId));
      return true;
    } catch (error) {
      console.error(`Error deleting mentor with ID ${mentorId}:`, error);
      throw error;
    }
  },

  // Assign mentor to institution
  async assignMentorToInstitution(mentorId, institutionId, customDb = null) {
    const db = customDb || dbImport;
    
    // Validate that db is initialized
    if (!db) {
      throw new Error('Firestore is not initialized. This operation is only available in the browser.');
    }
    
    try {
      // Get mentor document
      const mentorRef = doc(db, MENTORS_COLLECTION, mentorId);
      const mentorDoc = await getDoc(mentorRef);
      
      if (!mentorDoc.exists()) {
        throw new Error('Mentor not found');
      }
      
      const mentorData = mentorDoc.data();
      const institutions = mentorData.institutions || [];
      
      // Check if mentor is already assigned to institution
      if (institutions.includes(institutionId)) {
        return { id: mentorId, ...mentorData };
      }
      
      // Add institution to mentor's institutions array
      await updateDoc(mentorRef, {
        institutions: [...institutions, institutionId],
        updatedAt: new Date()
      });
      
      return { id: mentorId, ...mentorData, institutions: [...institutions, institutionId] };
    } catch (error) {
      console.error('Error assigning mentor to institution:', error);
      throw error;
    }
  },

  // Remove mentor from institution
  async removeMentorFromInstitution(mentorId, institutionId, customDb = null) {
    const db = customDb || dbImport;
    
    // Validate that db is initialized
    if (!db) {
      throw new Error('Firestore is not initialized. This operation is only available in the browser.');
    }
    
    try {
      // Get mentor document
      const mentorRef = doc(db, MENTORS_COLLECTION, mentorId);
      const mentorDoc = await getDoc(mentorRef);
      
      if (!mentorDoc.exists()) {
        throw new Error('Mentor not found');
      }
      
      const mentorData = mentorDoc.data();
      const institutions = mentorData.institutions || [];
      
      // Remove institution from mentor's institutions array
      const updatedInstitutions = institutions.filter(id => id !== institutionId);
      
      await updateDoc(mentorRef, {
        institutions: updatedInstitutions,
        updatedAt: new Date()
      });
      
      return { id: mentorId, ...mentorData, institutions: updatedInstitutions };
    } catch (error) {
      console.error('Error removing mentor from institution:', error);
      throw error;
    }
  },

  // Update mentor's avatar
  async updateMentorAvatar(mentorId, avatarId, customDb = null) {
    const db = customDb || dbImport;
    
    // Validate that db is initialized
    if (!db) {
      throw new Error('Firestore is not initialized. This operation is only available in the browser.');
    }
    
    try {
      const mentorRef = doc(db, MENTORS_COLLECTION, mentorId);
      await updateDoc(mentorRef, {
        avatarId,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating mentor avatar:', error);
      throw error;
    }
  },

  // Create ElevenLabs agent for a mentor
  async createElevenLabsAgent(mentorId, customDb = null, formData = null) {
    const db = customDb || dbImport;
    
    try {
      // Get mentor data
      const mentor = await this.getMentorById(mentorId);
      if (!mentor) {
        throw new Error('Mentor not found');
      }

      // Prepare agent data
      const agentData = formData || {
        name: mentor.name,
        description: mentor.description || `AI assistant for ${mentor.name}`,
        first_message: mentor.first_message || mentor.initial_message || `Hello, I'm ${mentor.name}. How can I help you today?`,
        voice_id: mentor.voice_id || 'EXAVITQu4vr4xnSDxMaL' // Default voice ID
      };

      // Create the agent using the ElevenLabs API
      const agent = await elevenLabsService.createAgent(agentData, ELEVENLABS_API_KEY);

      // Update the mentor with the agent ID
      const mentorRef = doc(db, MENTORS_COLLECTION, mentorId);
      await updateDoc(mentorRef, {
        elevenLabsAgentId: agent.agent_id,
        updatedAt: new Date()
      });

      return {
        mentor,
        agent: {
          id: agent.agent_id,
          name: agentData.name
        }
      };
    } catch (error) {
      console.error('Error creating ElevenLabs agent:', error);
      
      // Provide more specific error message
      if (error.message.includes('API key')) {
        throw new Error('ElevenLabs API key is invalid or missing');
      } else if (error.message.includes('voice_id')) {
        throw new Error('Invalid voice ID provided');
      }
      
      throw error;
    }
  },

  // Get ElevenLabs agent for a mentor
  async getElevenLabsAgent(mentorId, customDb = null) {
    const db = customDb || dbImport;
    
    try {
      // Check if the mentorId is a mock agent ID (from legacy data)
      if (mentorId.startsWith('mock-agent-')) {
        throw new Error(`Mock agents are no longer supported`);
      }
      
      // Get the mentor document
      const mentorDoc = await getDoc(doc(db, MENTORS_COLLECTION, mentorId));
      
      if (!mentorDoc.exists()) {
        throw new Error(`Mentor with ID ${mentorId} not found`);
      }
      
      const mentorData = mentorDoc.data();
      
      // Check if the agent ID is a mock agent ID (from legacy data)
      if (mentorData.elevenLabsAgentId && mentorData.elevenLabsAgentId.startsWith('mock-agent-')) {
        throw new Error(`Mock agents are no longer supported`);
      }
      
      if (!mentorData.elevenLabsAgentId) {
        throw new Error(`Mentor with ID ${mentorId} does not have an ElevenLabs agent`);
      }
      
      // Get the agent from ElevenLabs
      return await elevenLabsService.getAgent(mentorData.elevenLabsAgentId, ELEVENLABS_API_KEY);
    } catch (error) {
      console.error(`Error getting ElevenLabs agent for mentor with ID ${mentorId}:`, error);
      throw error;
    }
  },

  // Update ElevenLabs agent for a mentor
  async updateElevenLabsAgent(mentorId, agentId, agentData, customDb = null) {
    const db = customDb || dbImport;
    
    // Validate that db is initialized
    if (!db) {
      throw new Error('Firestore is not initialized. This operation is only available in the browser.');
    }
    
    try {
      // Get the mentor document
      const mentorDoc = await getDoc(doc(db, MENTORS_COLLECTION, mentorId));
      
      if (!mentorDoc.exists()) {
        throw new Error(`Mentor with ID ${mentorId} not found`);
      }
      
      const mentorData = mentorDoc.data();
      
      if (!mentorData.elevenLabsAgentId) {
        throw new Error(`Mentor with ID ${mentorId} does not have an ElevenLabs agent`);
      }
      
      // Update the agent using the ElevenLabs API
      const updatedAgent = await elevenLabsService.updateAgent(mentorData.elevenLabsAgentId, agentData, ELEVENLABS_API_KEY);
      
      return updatedAgent;
    } catch (error) {
      console.error(`Error updating ElevenLabs agent for mentor with ID ${mentorId}:`, error);
      throw error;
    }
  },

  // Delete ElevenLabs agent for a mentor
  async deleteElevenLabsAgent(mentorId, customDb = null) {
    const db = customDb || dbImport;
    
    try {
      // Get the mentor document
      const mentorDoc = await getDoc(doc(db, MENTORS_COLLECTION, mentorId));
      
      if (!mentorDoc.exists()) {
        throw new Error(`Mentor with ID ${mentorId} not found`);
      }
      
      const mentorData = mentorDoc.data();
      
      if (!mentorData.elevenLabsAgentId) {
        throw new Error(`Mentor with ID ${mentorId} does not have an ElevenLabs agent`);
      }
      
      // Handle mock agent IDs gracefully
      if (mentorData.elevenLabsAgentId.startsWith('mock-agent-')) {
        console.log(`Removing legacy mock agent reference: ${mentorData.elevenLabsAgentId}`);
        
        // Just update the mentor to remove the agent ID without calling the API
        await updateDoc(doc(db, MENTORS_COLLECTION, mentorId), {
          elevenLabsAgentId: null,
          updatedAt: new Date()
        });
        
        return true;
      }
      
      // Delete the agent using the ElevenLabs API
      await elevenLabsService.deleteAgent(mentorData.elevenLabsAgentId, ELEVENLABS_API_KEY);
      
      // Update the mentor to remove the agent ID
      await updateDoc(doc(db, MENTORS_COLLECTION, mentorId), {
        elevenLabsAgentId: null,
        updatedAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting ElevenLabs agent for mentor with ID ${mentorId}:`, error);
      throw error;
    }
  }
};
