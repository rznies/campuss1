import api from './api';

interface Compliment {
  _id: string;
  recipient: {
    _id: string;
    name: string;
    avatar: string;
  };
  message: string;
  createdAt: string;
}

interface SendComplimentResponse {
  success: boolean;
  compliment: Compliment;
}

// Description: Get compliments for the current user
// Endpoint: GET /api/compliments
// Request: {}
// Response: Array<{ _id: string, message: string, createdAt: string }>
export const getCompliments = async (): Promise<Compliment[]> => {
  try {
    const response = await api.get<Compliment[]>('/compliments');
    return response.data;
  } catch (error) {
    console.error('Error fetching compliments:', error);
    throw new Error('Failed to fetch compliments');
  }
};

// Description: Send a compliment
// Endpoint: POST /api/compliments/send
// Request: { recipientId: string, message: string }
// Response: { success: boolean }
export const sendCompliment = async (data: {
  recipientId: string;
  message: string;
}): Promise<SendComplimentResponse> => {
  if (!data.recipientId || !data.message.trim()) {
    throw new Error('Recipient ID and message are required');
  }

  try {
    const response = await api.post<SendComplimentResponse>('/compliments/send', data);
    return response.data;
  } catch (error) {
    console.error('Error sending compliment:', error);
    throw new Error('Failed to send compliment');
  }
};