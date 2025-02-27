import { useEffect, useState } from "react"
import { getCompliments, sendCompliment } from "@/api/compliments"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Heart, Send } from "lucide-react"
import { useToast } from "@/hooks/useToast"

type Compliment = {
  _id: string
  message: string
  createdAt: string
}

export function Compliments() {
  const [compliments, setCompliments] = useState<Compliment[]>([])
  const [newCompliment, setNewCompliment] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadCompliments = async () => {
      try {
        const data = await getCompliments()
        setCompliments(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load compliments",
        })
      }
    }
    loadCompliments()
  }, [toast])

  const handleSendCompliment = async () => {
    if (!newCompliment.trim()) return

    try {
      await sendCompliment({
        recipientId: "mockUser",
        message: newCompliment,
      })
      setNewCompliment("")
      setDialogOpen(false)
      toast({
        title: "Success",
        description: "Compliment sent successfully!",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send compliment",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Your Compliments</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Heart className="mr-2 h-4 w-4" />
              Send a Compliment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send an Anonymous Compliment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Textarea
                value={newCompliment}
                onChange={(e) => setNewCompliment(e.target.value)}
                placeholder="Write your anonymous compliment..."
                className="min-h-[100px]"
              />
              <Button onClick={handleSendCompliment} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Send Anonymously
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {compliments.map((compliment) => (
          <Card key={compliment._id} className="p-6 bg-card hover:bg-accent/50 transition-colors">
            <p className="text-lg">{compliment.message}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Received on {new Date(compliment.createdAt).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}