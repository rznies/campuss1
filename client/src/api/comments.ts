import api from './api';

// Description: Get comments for a post
// Endpoint: GET /api/feed/comments/:postId
// Request: {}
// Response: Array<{ _id: string, author: { _id: string, name: string, avatar: string }, content: string, createdAt: string }>
export const getComments = (postId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          _id: 'c1',
          author: {
            _id: 'user1',
            name: 'John Doe',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
          },
          content: 'Great post!',
          createdAt: '2024-02-15T15:30:00Z',
        },
        {
          _id: 'c2',
          author: {
            _id: 'user2',
            name: 'Jane Smith',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
          },
          content: 'Thanks for sharing!',
          createdAt: '2024-02-15T15:35:00Z',
        },
      ]);
    }, 500);
  });
};

// Description: Add a comment to a post
// Endpoint: POST /api/feed/comments
// Request: { postId: string, content: string }
// Response: { success: boolean }
export const addComment = (data: { postId: string; content: string }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 300);
  });
};