import api from './api';

// Description: Get leaderboard data
// Endpoint: GET /api/leaderboard
// Request: {}
// Response: Array<{ _id: string, name: string, avatar: string, points: number, rank: number, badges: string[] }>
export const getLeaderboard = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          _id: 'user1',
          name: 'John Doe',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
          points: 1250,
          rank: 1,
          badges: ['Early Adopter', 'Top Contributor'],
        },
        {
          _id: 'user2',
          name: 'Jane Smith',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
          points: 980,
          rank: 2,
          badges: ['Helpful Hero'],
        },
        {
          _id: 'user3',
          name: 'Mike Wilson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
          points: 750,
          rank: 3,
          badges: ['Rising Star'],
        },
      ]);
    }, 500);
  });
};