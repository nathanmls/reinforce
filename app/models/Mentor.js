// Mentor model schema
export const MentorSchema = {
  id: String,
  name: String,
  email: String,
  avatarId: String, // Reference to the default avatar model
  institutions: Array, // Array of institution IDs this mentor is assigned to
  createdAt: Date,
  updatedAt: Date
};

// Available avatar models
export const AVATAR_MODELS = {
  MARIA: 'maria', // Experienced elementary school teacher
  CARLOS: 'carlos', // Math and science specialist
  SOFIA: 'sofia', // Language arts and literature expert
  PEDRO: 'pedro', // History and social studies teacher
  // Add more teacher avatars as needed
};

// Helper function to validate mentor data
export function validateMentor(mentorData) {
  const requiredFields = ['name', 'email', 'avatarId'];
  for (const field of requiredFields) {
    if (!mentorData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  if (!Object.values(AVATAR_MODELS).includes(mentorData.avatarId)) {
    throw new Error('Invalid avatar model selected');
  }
  
  return true;
}
