import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where } from 'firebase/firestore';
import { validateMentor } from '../models/Mentor';

const MENTORS_COLLECTION = 'mentors';
const INSTITUTIONS_COLLECTION = 'institutions';

export const mentorService = {
  // Create a new mentor
  async createMentor(mentorData) {
    try {
      validateMentor(mentorData);
      const docRef = await addDoc(collection(db, MENTORS_COLLECTION), {
        ...mentorData,
        createdAt: new Date(),
        updatedAt: new Date(),
        institutions: []
      });
      return { id: docRef.id, ...mentorData };
    } catch (error) {
      console.error('Error creating mentor:', error);
      throw error;
    }
  },

  // Get all mentors
  async getAllMentors() {
    try {
      const querySnapshot = await getDocs(collection(db, MENTORS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting mentors:', error);
      throw error;
    }
  },

  // Get mentors for a specific institution
  async getMentorsByInstitution(institutionId) {
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
      console.error('Error getting institution mentors:', error);
      throw error;
    }
  },

  // Assign mentor to institution
  async assignMentorToInstitution(mentorId, institutionId) {
    try {
      const mentorRef = doc(db, MENTORS_COLLECTION, mentorId);
      const mentorDoc = await getDoc(mentorRef);
      
      if (!mentorDoc.exists()) {
        throw new Error('Mentor not found');
      }

      const currentInstitutions = mentorDoc.data().institutions || [];
      if (!currentInstitutions.includes(institutionId)) {
        await updateDoc(mentorRef, {
          institutions: [...currentInstitutions, institutionId],
          updatedAt: new Date()
        });
      }

      return true;
    } catch (error) {
      console.error('Error assigning mentor to institution:', error);
      throw error;
    }
  },

  // Update mentor's avatar
  async updateMentorAvatar(mentorId, avatarId) {
    try {
      const mentorRef = doc(db, MENTORS_COLLECTION, mentorId);
      await updateDoc(mentorRef, {
        avatarId,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating mentor avatar:', error);
      throw error;
    }
  },

  // Remove mentor from institution
  async removeMentorFromInstitution(mentorId, institutionId) {
    try {
      const mentorRef = doc(db, MENTORS_COLLECTION, mentorId);
      const mentorDoc = await getDoc(mentorRef);
      
      if (!mentorDoc.exists()) {
        throw new Error('Mentor not found');
      }

      const currentInstitutions = mentorDoc.data().institutions || [];
      await updateDoc(mentorRef, {
        institutions: currentInstitutions.filter(id => id !== institutionId),
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error removing mentor from institution:', error);
      throw error;
    }
  }
};
