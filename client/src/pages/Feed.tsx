import { useEffect, useState, useCallback, useRef } from "react"
import { getFeedPosts, likePost, createPost } from "@/api/feed"
import { getComments, addComment } from "@/api/comments"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Heart, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { useAuth } from '@/contexts/AuthContext'
import { useInView } from 'react-intersection-observer'

type Post = {
  _id: string
  author: {
    _id: string
    name: string
    avatar: string
  }
  content: string
  image?: string
  likes: number
  comments: number
  createdAt: string
  hasLiked: boolean
}

type Comment = {
  _id: string
  author: {
    _id: string
    name: string
    avatar: string
  }
  content: string
  createdAt: string
}

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const { toast } = useToast()
  const { user } = useAuth()
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const { ref, inView } = useInView()

  const loadPosts = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      setIsLoading(true)
      const response = await getFeedPosts(pageNum)
      if (append) {
        setPosts(prevPosts => [...prevPosts, ...response.data])
      } else {
        setPosts(response.data)
      }
      setError(null)
      setHasMore(response.data.length > 0)
      setPage(pageNum)
    } catch (err) {
      console.error("Failed to fetch posts:", err)
      setError("Failed to load posts. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (selectedPost) {
      const loadComments = async () => {
        try {
          const data = await getComments(selectedPost)
          setComments(data)
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load comments",
          })
        }
      }
      loadComments()
    }
  }, [selectedPost, toast])

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadPosts(page + 1, true)
    }
  }, [inView, hasMore, isLoading, loadPosts, page])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const handleLike = async (postId: string) => {
    try {
      const response = await likePost(postId)
      
      // Update the posts state with the new like status
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            likes: response.data.likes,
            hasLiked: response.data.hasLiked
          }
        }
        return post
      }))
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleAddComment = async () => {
    if (!selectedPost || !newComment.trim()) return

    try {
      await addComment({ postId: selectedPost, content: newComment })
      const data = await getComments(selectedPost)
      setComments(data)
      setNewComment("")
      setPosts(posts.map(post =>
        post._id === selectedPost
          ? { ...post, comments: post.comments + 1 }
          : post
      ))
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-16rem)]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Campus Feed</h1>
      
      {posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No posts yet. Be the first to share something!
        </div>
      ) : (
        posts.map((post) => (
          <Card key={post._id}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar>
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{post.author.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{post.content}</p>
              {post.image && (
                <img 
                  src={post.image} 
                  alt="Post attachment" 
                  className="rounded-md w-full object-cover max-h-96"
                />
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleLike(post._id)}
                className={post.hasLiked ? "text-red-500" : ""}
              >
                <Heart className={`mr-1 h-4 w-4 ${post.hasLiked ? "fill-red-500" : ""}`} />
                {post.likes}
              </Button>
              <Button variant="ghost" size="sm">
                <MessageCircle className="mr-1 h-4 w-4" />
                {post.comments}
              </Button>
            </CardFooter>
          </Card>
        ))
      )}

      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
            <DialogDescription>Join the conversation and share your thoughts</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar} />
                    <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{comment.author.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex gap-2 mt-4">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            />
            <Button onClick={handleAddComment}>Post</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}