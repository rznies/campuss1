import api from './api';

interface User {
  _id: string;
  name: string;
  avatar: string;
  major?: string;
  interests?: string[];
  bio?: string;
}

interface Match {
  _id: string;
  user: User;
  compatibilityScore: number;
  matchReason: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

interface MatchResponse {
  success: boolean;
  match: Match;
}

// Description: Get AI-suggested matches
// Endpoint: GET /api/matches
// Request: {}
// Response: Array<{ _id: string, name: string, avatar: string, course: string, interests: string[], matchScore: number }>
export const getMatches = async (): Promise<Match[]> => {
  try {
    const response = await api.get<Match[]>('/matches');
    return response.data;
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw new Error('Failed to fetch matches');
  }
};

// Accept a match
export const acceptMatch = async (matchId: string): Promise<MatchResponse> => {
  if (!matchId) {
    throw new Error('Match ID is required');
  }

  try {
    const response = await api.post<MatchResponse>('/matches/accept', { matchId });
    return response.data;
  } catch (error) {
    console.error('Error accepting match:', error);
    throw new Error('Failed to accept match');
  }
};

// Decline a match
export const declineMatch = async (matchId: string): Promise<MatchResponse> => {
  if (!matchId) {
    throw new Error('Match ID is required');
  }

  try {
    const response = await api.post<MatchResponse>('/matches/decline', { matchId });
    return response.data;
  } catch (error) {
    console.error('Error declining match:', error);
    throw new Error('Failed to decline match');
  }
};