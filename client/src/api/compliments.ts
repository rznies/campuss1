import api from './api';

// Description: Get compliments for the current user
// Endpoint: GET /api/compliments
// Request: {}
// Response: Array<{ _id: string, message: string, createdAt: string }>
export const getCompliments = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          _id: 'c1',
          message: 'Your presentation in class today was amazing!',
          createdAt: '2024-02-15T14:30:00Z',
        },
        {
          _id: 'c2',
          message: 'Thanks for helping me with the project!',
          createdAt: '2024-02-15T12:15:00Z',
        },
      ]);
    }, 500);
  });
};

// Description: Send a compliment
// Endpoint: POST /api/compliments/send
// Request: { recipientId: string, message: string }
// Response: { success: boolean }
export const sendCompliment = (data: { recipientId: string; message: string }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 300);
  });
};