import api from './api';

// Description: Get posts for the college feed
// Endpoint: GET /api/feed
// Request: {}
// Response: Array<{ _id: string, author: { _id: string, name: string, avatar: string }, content: string, image?: string, likes: number, comments: number, createdAt: string }>
export const getFeedPosts = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          _id: '1',
          author: {
            _id: 'user1',
            name: 'John Doe',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
          },
          content: 'Just aced my finals! 🎉',
          likes: 24,
          comments: 5,
          createdAt: '2024-02-15T10:30:00Z',
        },
        {
          _id: '2',
          author: {
            _id: 'user2',
            name: 'Jane Smith',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
          },
          content: 'Anyone up for study group in the library? 📚',
          image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f',
          likes: 15,
          comments: 8,
          createdAt: '2024-02-15T09:15:00Z',
        },
      ]);
    }, 500);
  });
};

// Description: Like a post
// Endpoint: POST /api/feed/like
// Request: { postId: string }
// Response: { success: boolean }
export const likePost = (postId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 300);
  });
};