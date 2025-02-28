import api from './api';

interface OnboardingQuestion {
  _id: string;
  question: string;
  type: 'text' | 'multiple_choice' | 'checkbox';
  options?: string[];
  required: boolean;
  order: number;
}

interface OnboardingAnswer {
  questionId: string;
  answer: string | string[];
}

interface SubmitOnboardingResponse {
  success: boolean;
  completed: boolean;
  profile?: {
    _id: string;
    interests: string[];
    major: string;
    bio: string;
  };
}

// Description: Get onboarding questions
// Endpoint: GET /api/onboarding/questions
// Request: {}
// Response: Array<{ _id: string, question: string, options: Array<{ value: string, emoji: string }> }>
export const getOnboardingQuestions = async (): Promise<OnboardingQuestion[]> => {
  try {
    const response = await api.get<OnboardingQuestion[]>('/onboarding/questions');
    return response.data;
  } catch (error) {
    console.error('Error fetching onboarding questions:', error);
    throw new Error('Failed to fetch onboarding questions');
  }
};

// Description: Submit onboarding answers
// Endpoint: POST /api/onboarding/submit
// Request: { answers: Array<{ questionId: string, answer: string }> }
// Response: { success: boolean }
export const submitOnboardingAnswers = async (
  data: { answers: OnboardingAnswer[] }
): Promise<SubmitOnboardingResponse> => {
  if (!data.answers?.length) {
    throw new Error('Answers are required');
  }

  try {
    const response = await api.post<SubmitOnboardingResponse>('/onboarding/submit', data);
    return response.data;
  } catch (error) {
    console.error('Error submitting onboarding answers:', error);
    throw new Error('Failed to submit onboarding answers');
  }
};

// Add a new method to check onboarding status
export const getOnboardingStatus = async (): Promise<{ completed: boolean }> => {
  try {
    const response = await api.get<{ completed: boolean }>('/onboarding/status');
    return response.data;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    throw new Error('Failed to check onboarding status');
  }
};