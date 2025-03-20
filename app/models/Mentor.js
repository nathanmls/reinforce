// Mentor model schema
export const MentorSchema = {
  id: String,
  name: String,
  email: String,
  avatarId: String, // Reference to the default avatar model
  institutions: Array, // Array of institution IDs this mentor is assigned to
  createdAt: Date,
  updatedAt: Date,
  elevenLabsAgentId: String, // ID of the associated ElevenLabs agent
  elevenLabsAgentName: String // Name of the associated ElevenLabs agent
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

// ElevenLabs agent templates for different mentor types
export const ELEVENLABS_AGENT_TEMPLATES = {
  ELEMENTARY_TEACHER: {
    name: "Elementary School Teacher",
    description: "A friendly and patient elementary school teacher who specializes in making complex concepts simple for young students.",
    initialMessage: "Hello! I'm your elementary school teacher. How can I help you with your learning today?",
    voiceId: "21m00Tcm4TlvDq8ikWAM" // Default voice ID, can be changed
  },
  MATH_SCIENCE_SPECIALIST: {
    name: "Math and Science Specialist",
    description: "An expert in mathematics and science who can explain complex concepts in an engaging and understandable way.",
    initialMessage: "Hi there! I'm your math and science specialist. What would you like to learn about today?",
    voiceId: "AZnzlk1XvdvUeBnXmlld" // Default voice ID, can be changed
  },
  LANGUAGE_ARTS_EXPERT: {
    name: "Language Arts Expert",
    description: "A literature and language arts specialist who can help with reading comprehension, writing, and literary analysis.",
    initialMessage: "Hello! I'm your language arts expert. Ready to explore the world of literature and writing?",
    voiceId: "EXAVITQu4vr4xnSDxMaL" // Default voice ID, can be changed
  },
  HISTORY_SOCIAL_STUDIES: {
    name: "History and Social Studies Teacher",
    description: "A knowledgeable history and social studies teacher who brings historical events and social concepts to life.",
    initialMessage: "Welcome! I'm your history and social studies teacher. What period of history or social topic would you like to explore?",
    voiceId: "VR6AewLTigWG4xSOukaG" // Default voice ID, can be changed
  }
};
