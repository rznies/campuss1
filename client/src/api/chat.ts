import api from './api';

// Description: Get chat conversations
// Endpoint: GET /api/chat/conversations
// Request: {}
// Response: Array<{ _id: string, user: { _id: string, name: string, avatar: string }, lastMessage: string, unread: number, lastMessageAt: string }>
export const getConversations = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          _id: 'chat1',
          user: {
            _id: 'user1',
            name: 'John Doe',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
          },
          lastMessage: 'See you at the study group!',
          unread: 2,
          lastMessageAt: '2024-02-15T15:30:00Z',
        },
        {
          _id: 'chat2',
          user: {
            _id: 'user2',
            name: 'Jane Smith',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
          },
          lastMessage: 'Thanks for the notes!',
          unread: 0,
          lastMessageAt: '2024-02-15T14:15:00Z',
        },
      ]);
    }, 500);
  });
};

// Description: Get chat messages
// Endpoint: GET /api/chat/messages
// Request: { conversationId: string }
// Response: Array<{ _id: string, sender: { _id: string, name: string }, message: string, createdAt: string }>
export const getChatMessages = (conversationId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          _id: 'm1',
          sender: {
            _id: 'user1',
            name: 'John Doe',
          },
          message: 'Hey, want to join our study group?',
          createdAt: '2024-02-15T15:25:00Z',
        },
        {
          _id: 'm2',
          sender: {
            _id: 'currentUser',
            name: 'Current User',
          },
          message: 'Sure! What time?',
          createdAt: '2024-02-15T15:27:00Z',
        },
      ]);
    }, 500);
  });
};

// Description: Send a chat message
// Endpoint: POST /api/chat/send
// Request: { conversationId: string, message: string }
// Response: { success: boolean }
export const sendMessage = (data: { conversationId: string; message: string }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 300);
  });
};