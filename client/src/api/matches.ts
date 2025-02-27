import api from './api';

// Description: Get AI-suggested matches
// Endpoint: GET /api/matches
// Request: {}
// Response: Array<{ _id: string, name: string, avatar: string, course: string, interests: string[], matchScore: number }>
export const getMatches = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          _id: 'match1',
          name: 'Sarah Wilson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          course: 'Computer Science',
          interests: ['Programming', 'AI', 'Music'],
          matchScore: 85,
        },
        {
          _id: 'match2',
          name: 'Mike Johnson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
          course: 'Data Science',
          interests: ['Machine Learning', 'Basketball', 'Photography'],
          matchScore: 78,
        },
      ]);
    }, 500);
  });
};