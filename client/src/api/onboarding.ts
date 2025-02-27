import api from './api';

// Description: Get onboarding questions
// Endpoint: GET /api/onboarding/questions
// Request: {}
// Response: Array<{ _id: string, question: string, options: Array<{ value: string, emoji: string }> }>
export const getOnboardingQuestions = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          _id: '1',
          question: "What's your campus personality?",
          options: [
            { value: 'studious', emoji: '📚🤓' },
            { value: 'athletic', emoji: '🏀🔥' },
            { value: 'creative', emoji: '🎭😎' }
          ]
        },
        {
          _id: '2',
          question: 'How do you handle an awkward situation?',
          options: [
            { value: 'laugh', emoji: '😂' },
            { value: 'run', emoji: '🏃‍♂️💨' },
            { value: 'cringe', emoji: '😬' }
          ]
        }
      ]);
    }, 500);
  });
};

// Description: Submit onboarding answers
// Endpoint: POST /api/onboarding/submit
// Request: { answers: Array<{ questionId: string, answer: string }> }
// Response: { success: boolean }
export const submitOnboardingAnswers = (data: { answers: Array<{ questionId: string, answer: string }> }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};