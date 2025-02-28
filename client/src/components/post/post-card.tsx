import { formatDistanceToNow } from "date-fns"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Post } from "@/pages/Feed"
import { User } from "@/types/auth"

interface PostCardProps {
  post: Post
  onLike: (postId: string) => Promise<void>
  currentUser: User | null
}

export function PostCard({ post, onLike, currentUser }: PostCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4 pb-2">
        <Avatar>
          <AvatarImage src={post.author.avatar} alt={post.author.name} />
          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{post.author.name}</h3>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
            {post.visibility === 'course' && (
              <Badge variant="secondary">
                {post.course}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="whitespace-pre-wrap mb-4">{post.content}</p>
        {post.media && (
          <img 
            src={post.media} 
            alt="Post attachment" 
            className="rounded-lg w-full object-cover max-h-[32rem]"
            loading="lazy"
          />
        )}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map(tag => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onLike(post.id)}
          className={post.hasLiked ? "text-primary" : ""}
          disabled={!currentUser}
        >
          <Heart 
            className={`mr-1.5 h-4 w-4 ${
              post.hasLiked ? "fill-primary" : ""
            }`} 
          />
          {post.likes}
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          disabled={!currentUser}
        >
          <MessageCircle className="mr-1.5 h-4 w-4" />
          {post.commentCount}
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            navigator.share({
              title: `Post by ${post.author.name}`,
              text: post.content,
              url: window.location.href
            })
          }}
        >
          <Share2 className="mr-1.5 h-4 w-4" />
          Share
        </Button>
      </CardFooter>
    </Card>
  )
} 