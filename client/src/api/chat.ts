import api from './api';

interface User {
  _id: string;
  name: string;
  avatar: string;
}

interface Conversation {
  _id: string;
  user: User;
  lastMessage: string;
  unread: number;
  lastMessageAt: string;
}

interface ChatMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
  };
  message: string;
  createdAt: string;
}

interface SendMessageResponse {
  success: boolean;
  message: ChatMessage;
}

// Description: Get chat conversations
// Endpoint: GET /api/chat/conversations
// Request: {}
// Response: Array<{ _id: string, user: { _id: string, name: string, avatar: string }, lastMessage: string, unread: number, lastMessageAt: string }>
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await api.get<Conversation[]>('/chat/conversations');
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw new Error('Failed to fetch conversations');
  }
};

// Description: Get chat messages
// Endpoint: GET /api/chat/messages
// Request: { conversationId: string }
// Response: Array<{ _id: string, sender: { _id: string, name: string }, message: string, createdAt: string }>
export const getChatMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  if (!conversationId) {
    throw new Error('Conversation ID is required');
  }

  try {
    const response = await api.get<ChatMessage[]>(`/chat/messages/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw new Error('Failed to fetch chat messages');
  }
};

// Description: Send a chat message
// Endpoint: POST /api/chat/send
// Request: { conversationId: string, message: string }
// Response: { success: boolean }
export const sendMessage = async (data: {
  conversationId: string;
  message: string;
}): Promise<SendMessageResponse> => {
  if (!data.conversationId || !data.message.trim()) {
    throw new Error('Conversation ID and message are required');
  }

  try {
    const response = await api.post<SendMessageResponse>('/chat/send', data);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }
};

// Add new method for marking messages as read
export const markMessagesAsRead = async (conversationId: string): Promise<{ success: boolean }> => {
  if (!conversationId) {
    throw new Error('Conversation ID is required');
  }

  try {
    const response = await api.post<{ success: boolean }>(`/chat/messages/${conversationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw new Error('Failed to mark messages as read');
  }
};