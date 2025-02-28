import api from './api';

interface User {
  _id: string;
  name: string;
  avatar: string;
}

interface Comment {
  _id: string;
  post: string;
  author: User;
  content: string;
  createdAt: string;
}

interface AddCommentResponse {
  success: boolean;
  comment: Comment;
}

// Description: Get comments for a post
// Endpoint: GET /api/feed/comments/:postId
// Request: {}
// Response: Array<{ _id: string, author: { _id: string, name: string, avatar: string }, content: string, createdAt: string }>
export const getComments = async (postId: string): Promise<Comment[]> => {
  if (!postId) {
    throw new Error('Post ID is required');
  }

  try {
    const response = await api.get<Comment[]>(`/feed/comments/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw new Error('Failed to fetch comments');
  }
};

// Description: Add a comment to a post
// Endpoint: POST /api/feed/comments
// Request: { postId: string, content: string }
// Response: { success: boolean }
export const addComment = async (data: {
  postId: string;
  content: string;
}): Promise<AddCommentResponse> => {
  if (!data.postId || !data.content.trim()) {
    throw new Error('Post ID and content are required');
  }

  try {
    const response = await api.post<AddCommentResponse>('/feed/comments', data);
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error('Failed to add comment');
  }
};