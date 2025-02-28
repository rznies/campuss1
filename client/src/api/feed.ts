import api from './api';

interface User {
  _id: string;
  name: string;
  avatar: string;
}

interface Post {
  _id: string;
  author: User;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  createdAt: string;
}

interface CreatePostResponse {
  success: boolean;
  post: Post;
}

interface LikePostResponse {
  success: boolean;
  likes: number;
}

// Description: Get posts for the college feed
// Endpoint: GET /api/feed
// Request: {}
// Response: Array<{ _id: string, author: { _id: string, name: string, avatar: string }, content: string, image?: string, likes: number, comments: number, createdAt: string }>
export const getFeedPosts = async (): Promise<Post[]> => {
  try {
    const response = await api.get<Post[]>('/feed');
    return response.data;
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    throw new Error('Failed to fetch feed posts');
  }
};

// Description: Like a post
// Endpoint: POST /api/feed/like
// Request: { postId: string }
// Response: { success: boolean }
export const likePost = async (postId: string): Promise<LikePostResponse> => {
  if (!postId) {
    throw new Error('Post ID is required');
  }

  try {
    const response = await api.post<LikePostResponse>('/feed/like', { postId });
    return response.data;
  } catch (error) {
    console.error('Error liking post:', error);
    throw new Error('Failed to like post');
  }
};

// Create a new post
export const createPost = async (data: { 
  content: string; 
  image?: File 
}): Promise<CreatePostResponse> => {
  if (!data.content.trim()) {
    throw new Error('Content is required');
  }

  try {
    const formData = new FormData();
    formData.append('content', data.content);
    
    if (data.image) {
      formData.append('image', data.image);
    }
    
    const response = await api.post<CreatePostResponse>('/feed/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error('Failed to create post');
  }
};