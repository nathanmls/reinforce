// Homework model schema
export const HomeworkSchema = {
  id: String,
  title: String,
  description: String,
  dueDate: Date,
  status: String, // 'pending', 'completed', 'overdue'
  studentId: String, // ID of the student assigned to
  mentorId: String, // ID of the mentor who assigned it
  createdAt: Date,
  updatedAt: Date,
};

// Homework status constants
export const HOMEWORK_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
};

// Helper function to validate homework data
export function validateHomework(homeworkData) {
  const requiredFields = ['title', 'description', 'dueDate', 'studentId', 'mentorId'];
  for (const field of requiredFields) {
    if (!homeworkData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate due date is a valid date
  if (!(homeworkData.dueDate instanceof Date) && isNaN(new Date(homeworkData.dueDate).getTime())) {
    throw new Error('Invalid due date');
  }

  // Set default status if not provided
  if (!homeworkData.status) {
    homeworkData.status = HOMEWORK_STATUS.PENDING;
  }

  // Validate status is valid
  if (!Object.values(HOMEWORK_STATUS).includes(homeworkData.status)) {
    throw new Error('Invalid status');
  }

  return homeworkData;
}
