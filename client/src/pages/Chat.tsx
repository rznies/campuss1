import { useState, useEffect } from "react"
import { getConversations, getChatMessages, sendMessage } from "@/api/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { useToast } from "@/hooks/useToast"
import { Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Conversation {
  _id: string
  user: {
    _id: string
    name: string
    avatar: string
  }
  lastMessage: string
  unread: number
  lastMessageAt: string
}

interface Message {
  _id: string
  sender: {
    _id: string
    name: string
  }
  message: string
  createdAt: string
}

export function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function loadConversations() {
      try {
        setLoadingConversations(true)
        const response = await getConversations()
        setConversations(response.data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch conversations:", err)
        setError("Failed to load conversations. Please try again later.")
      } finally {
        setLoadingConversations(false)
      }
    }

    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
    }
  }, [selectedConversation])

  async function loadMessages(conversationId: string) {
    try {
      setLoadingMessages(true)
      const response = await getChatMessages(conversationId)
      setMessages(response.data)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      await sendMessage({
        conversationId: selectedConversation,
        message: newMessage
      })

      // Add the new message to the UI immediately
      const newMsg: Message = {
        _id: Date.now().toString(), // Temporary ID until refresh
        sender: {
          _id: 'currentUser', // This should be your actual user ID
          name: 'You'
        },
        message: newMessage,
        createdAt: new Date().toISOString()
      }
      
      setMessages([...messages, newMsg])
      setNewMessage("")
      
      // Refresh the conversation list to update last message
      const response = await getConversations()
      setConversations(response.data)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (loadingConversations && !selectedConversation) {
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-16rem)]">
      <div className="md:col-span-1 border rounded-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Conversations</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No conversations yet.
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation._id}
                className={`p-4 border-b cursor-pointer hover:bg-accent/50 ${
                  selectedConversation === conversation._id ? "bg-accent" : ""
                }`}
                onClick={() => setSelectedConversation(conversation._id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                    <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{conversation.user.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  {conversation.unread > 0 && (
                    <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {conversation.unread}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="md:col-span-2 border rounded-md flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b">
              {conversations.find(c => c._id === selectedConversation)?.user.name || "Chat"}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <LoadingSpinner />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => {
                  const isCurrentUser = message.sender._id === 'currentUser';
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isCurrentUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent"
                        }`}
                      >
                        <p>{message.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-4 border-t flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-muted-foreground">Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  )
}