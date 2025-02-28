import api from './api';

interface LeaderboardUser {
  _id: string;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  badges: string[];
}

interface LeaderboardResponse {
  users: LeaderboardUser[];
  currentUser: {
    rank: number;
    points: number;
    position: 'up' | 'down' | 'same';
    change: number;
  };
}

// Description: Get leaderboard data
// Endpoint: GET /api/leaderboard
// Request: {}
// Response: Array<{ _id: string, name: string, avatar: string, points: number, rank: number, badges: string[] }>
export const getLeaderboard = async (): Promise<LeaderboardResponse> => {
  try {
    const response = await api.get<LeaderboardResponse>('/leaderboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw new Error('Failed to fetch leaderboard');
  }
};

// Get user's rank history
export const getRankHistory = async (): Promise<Array<{ date: string; rank: number; points: number }>> => {
  try {
    const response = await api.get<Array<{ date: string; rank: number; points: number }>>('/leaderboard/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching rank history:', error);
    throw new Error('Failed to fetch rank history');
  }
};