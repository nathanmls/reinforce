'use client';

import { db as dbImport } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { validateHomework, HOMEWORK_STATUS } from '../models/Homework';

const HOMEWORK_COLLECTION = 'homework';

export const homeworkService = {
  // Create a new homework assignment
  async createHomework(homeworkData, customDb = null) {
    const db = customDb || dbImport;

    // Validate that db is initialized
    if (!db) {
      throw new Error(
        'Firestore is not initialized. This operation is only available in the browser.'
      );
    }

    try {
      // Validate homework data
      const validatedData = validateHomework(homeworkData);

      // Add created and updated timestamps
      const homeworkWithTimestamps = {
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to Firestore
      const docRef = await addDoc(
        collection(db, HOMEWORK_COLLECTION),
        homeworkWithTimestamps
      );

      // Return the created homework with ID
      return {
        id: docRef.id,
        ...homeworkWithTimestamps,
      };
    } catch (error) {
      console.error('Error creating homework:', error);
      throw error;
    }
  },

  // Get all homework assignments
  async getAllHomework(customDb = null) {
    const db = customDb || dbImport;

    // Validate that db is initialized
    if (!db) {
      throw new Error(
        'Firestore is not initialized. This operation is only available in the browser.'
      );
    }

    try {
      const homeworkRef = collection(db, HOMEWORK_COLLECTION);
      const homeworkSnapshot = await getDocs(homeworkRef);

      const homework = [];
      homeworkSnapshot.forEach((doc) => {
        homework.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return homework;
    } catch (error) {
      console.error('Error getting all homework:', error);
      throw error;
    }
  },

  // Get homework by ID
  async getHomeworkById(homeworkId, customDb = null) {
    const db = customDb || dbImport;

    // Validate that db is initialized
    if (!db) {
      throw new Error(
        'Firestore is not initialized. This operation is only available in the browser.'
      );
    }

    try {
      const homeworkRef = doc(db, HOMEWORK_COLLECTION, homeworkId);
      const homeworkDoc = await getDoc(homeworkRef);

      if (!homeworkDoc.exists()) {
        throw new Error(`Homework with ID ${homeworkId} not found`);
      }

      return {
        id: homeworkDoc.id,
        ...homeworkDoc.data(),
      };
    } catch (error) {
      console.error('Error getting homework by ID:', error);
      throw error;
    }
  },

  // Get homework assignments for a specific student
  async getHomeworkByStudent(studentId, customDb = null) {
    const db = customDb || dbImport;

    // Validate that db is initialized
    if (!db) {
      throw new Error(
        'Firestore is not initialized. This operation is only available in the browser.'
      );
    }

    try {
      const homeworkRef = collection(db, HOMEWORK_COLLECTION);
      const homeworkQuery = query(
        homeworkRef,
        where('studentId', '==', studentId),
        orderBy('dueDate', 'asc')
      );
      const homeworkSnapshot = await getDocs(homeworkQuery);

      const homework = [];
      homeworkSnapshot.forEach((doc) => {
        homework.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return homework;
    } catch (error) {
      console.error('Error getting homework by student:', error);
      throw error;
    }
  },

  // Get homework assignments assigned by a specific mentor
  async getHomeworkByMentor(mentorId, customDb = null) {
    const db = customDb || dbImport;

    // Validate that db is initialized
    if (!db) {
      throw new Error(
        'Firestore is not initialized. This operation is only available in the browser.'
      );
    }

    try {
      const homeworkRef = collection(db, HOMEWORK_COLLECTION);
      const homeworkQuery = query(
        homeworkRef,
        where('mentorId', '==', mentorId),
        orderBy('dueDate', 'asc')
      );
      const homeworkSnapshot = await getDocs(homeworkQuery);

      const homework = [];
      homeworkSnapshot.forEach((doc) => {
        homework.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return homework;
    } catch (error) {
      console.error('Error getting homework by mentor:', error);
      throw error;
    }
  },

  // Update a homework assignment
  async updateHomework(homeworkId, homeworkData, customDb = null) {
    const db = customDb || dbImport;

    // Validate that db is initialized
    if (!db) {
      throw new Error(
        'Firestore is not initialized. This operation is only available in the browser.'
      );
    }

    try {
      // Get the current homework data
      const homeworkRef = doc(db, HOMEWORK_COLLECTION, homeworkId);
      const homeworkDoc = await getDoc(homeworkRef);

      if (!homeworkDoc.exists()) {
        throw new Error(`Homework with ID ${homeworkId} not found`);
      }

      const currentData = homeworkDoc.data();

      // Merge the current data with the updated data
      const updatedData = {
        ...currentData,
        ...homeworkData,
        updatedAt: new Date(),
      };

      // Validate the merged data
      validateHomework(updatedData);

      // Update the document
      await updateDoc(homeworkRef, updatedData);

      // Return the updated homework
      return {
        id: homeworkId,
        ...updatedData,
      };
    } catch (error) {
      console.error('Error updating homework:', error);
      throw error;
    }
  },

  // Delete a homework assignment
  async deleteHomework(homeworkId, customDb = null) {
    const db = customDb || dbImport;

    // Validate that db is initialized
    if (!db) {
      throw new Error(
        'Firestore is not initialized. This operation is only available in the browser.'
      );
    }

    try {
      // Verify the homework exists
      const homeworkRef = doc(db, HOMEWORK_COLLECTION, homeworkId);
      const homeworkDoc = await getDoc(homeworkRef);

      if (!homeworkDoc.exists()) {
        throw new Error(`Homework with ID ${homeworkId} not found`);
      }

      // Delete the document
      await deleteDoc(homeworkRef);

      return { success: true, id: homeworkId };
    } catch (error) {
      console.error('Error deleting homework:', error);
      throw error;
    }
  },

  // Mark homework as completed
  async markHomeworkAsCompleted(homeworkId, customDb = null) {
    const db = customDb || dbImport;

    // Validate that db is initialized
    if (!db) {
      throw new Error(
        'Firestore is not initialized. This operation is only available in the browser.'
      );
    }

    try {
      // Get the current homework data
      const homeworkRef = doc(db, HOMEWORK_COLLECTION, homeworkId);
      const homeworkDoc = await getDoc(homeworkRef);

      if (!homeworkDoc.exists()) {
        throw new Error(`Homework with ID ${homeworkId} not found`);
      }

      // Update the status to completed
      await updateDoc(homeworkRef, {
        status: HOMEWORK_STATUS.COMPLETED,
        updatedAt: new Date(),
      });

      // Return the updated homework
      return {
        id: homeworkId,
        ...homeworkDoc.data(),
        status: HOMEWORK_STATUS.COMPLETED,
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error marking homework as completed:', error);
      throw error;
    }
  },

  // Update homework status based on due date
  async updateHomeworkStatuses(customDb = null) {
    const db = customDb || dbImport;

    // Validate that db is initialized
    if (!db) {
      throw new Error(
        'Firestore is not initialized. This operation is only available in the browser.'
      );
    }

    try {
      const now = new Date();
      const homeworkRef = collection(db, HOMEWORK_COLLECTION);
      const pendingHomeworkQuery = query(
        homeworkRef,
        where('status', '==', HOMEWORK_STATUS.PENDING)
      );
      const pendingHomeworkSnapshot = await getDocs(pendingHomeworkQuery);

      const updatedHomework = [];
      const batch = writeBatch(db);

      pendingHomeworkSnapshot.forEach((docSnapshot) => {
        const homework = docSnapshot.data();
        const dueDate = homework.dueDate.toDate ? homework.dueDate.toDate() : new Date(homework.dueDate);

        if (dueDate < now) {
          const homeworkRef = doc(db, HOMEWORK_COLLECTION, docSnapshot.id);
          batch.update(homeworkRef, {
            status: HOMEWORK_STATUS.OVERDUE,
            updatedAt: now,
          });

          updatedHomework.push({
            id: docSnapshot.id,
            ...homework,
            status: HOMEWORK_STATUS.OVERDUE,
            updatedAt: now,
          });
        }
      });

      if (updatedHomework.length > 0) {
        await batch.commit();
      }

      return updatedHomework;
    } catch (error) {
      console.error('Error updating homework statuses:', error);
      throw error;
    }
  },
};
