import { useEffect, useState } from "react"
import { getFeedPosts, likePost } from "@/api/feed"
import { getComments, addComment } from "@/api/comments"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Heart, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  const [selectedPost, setSelectedPost] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await getFeedPosts()
        setPosts(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load posts",
        })
      } finally {
        setLoading(false)
      }
    }
    loadPosts()
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

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId)
      setPosts(posts.map(post =>
        post._id === postId
          ? { ...post, likes: post.likes + 1 }
          : post
      ))
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to like post",
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
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post._id} className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{post.author.name}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <p className="mt-4">{post.content}</p>
          {post.image && (
            <img
              src={post.image}
              alt="Post content"
              className="mt-4 rounded-lg"
            />
          )}
          <div className="mt-4 flex space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(post._id)}
            >
              <Heart className="mr-2 h-4 w-4" />
              {post.likes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPost(post._id)}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              {post.comments}
            </Button>
          </div>
        </Card>
      ))}

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