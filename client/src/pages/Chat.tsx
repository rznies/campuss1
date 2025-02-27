import { useEffect, useState } from "react"
import { getConversations, getChatMessages, sendMessage } from "@/api/chat"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import { useMobile } from "@/hooks/useMobile"

type Conversation = {
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

type Message = {
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
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const { toast } = useToast()
  const isMobile = useMobile()

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await getConversations()
        setConversations(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load conversations",
        })
      }
    }
    loadConversations()
  }, [toast])

  useEffect(() => {
    if (selectedChat) {
      const loadMessages = async () => {
        try {
          const data = await getChatMessages(selectedChat)
          setMessages(data)
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load messages",
          })
        }
      }
      loadMessages()
    }
  }, [selectedChat, toast])

  const handleSendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return

    try {
      await sendMessage({ conversationId: selectedChat, message: newMessage })
      setMessages([
        ...messages,
        {
          _id: Date.now().toString(),
          sender: { _id: 'currentUser', name: 'You' },
          message: newMessage,
          createdAt: new Date().toISOString(),
        },
      ])
      setNewMessage("")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message",
      })
    }
  }

  if (isMobile && selectedChat) {
    return (
      <Card className="flex h-[calc(100vh-8rem)] flex-col p-4">
        <div className="mb-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedChat(null)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="ml-2">
            {conversations.find((c) => c._id === selectedChat)?.user.name}
          </div>
        </div>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.sender._id === "currentUser"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.sender._id === "currentUser"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent"
                  }`}
                >
                  <p>{message.message}</p>
                  <span className="text-xs opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4 flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <Card className={`${isMobile ? 'w-full' : 'w-80'} p-4`}>
        <ScrollArea className="h-full">
          {conversations.map((conv) => (
            <div
              key={conv._id}
              className={`flex items-center space-x-4 p-3 cursor-pointer rounded-lg ${
                selectedChat === conv._id ? "bg-accent" : "hover:bg-accent/50"
              }`}
              onClick={() => setSelectedChat(conv._id)}
            >
              <Avatar>
                <AvatarImage src={conv.user.avatar} />
                <AvatarFallback>{conv.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{conv.user.name}</div>
                <p className="text-sm text-muted-foreground truncate">
                  {conv.lastMessage}
                </p>
              </div>
              {conv.unread > 0 && (
                <div className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                  {conv.unread}
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
      </Card>

      {!isMobile && (
        <Card className="flex-1 p-4 flex flex-col">
          {selectedChat ? (
            <>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.sender._id === "currentUser"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.sender._id === "currentUser"
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent"
                        }`}
                      >
                        <p>{message.message}</p>
                        <span className="text-xs opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-4 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a conversation to start chatting
            </div>
          )}
        </Card>
      )}
    </div>
  )
}