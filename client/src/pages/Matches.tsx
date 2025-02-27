import { useEffect, useState } from "react"
import { getMatches } from "@/api/matches"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import { useNavigate } from "react-router-dom"

type Match = {
  _id: string
  name: string
  avatar: string
  course: string
  interests: string[]
  matchScore: number
}

export function Matches() {
  const [matches, setMatches] = useState<Match[]>([])
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const data = await getMatches()
        setMatches(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load matches",
        })
      }
    }
    loadMatches()
  }, [toast])

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">AI-Suggested Matches</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <Card key={match._id} className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={match.avatar} />
                <AvatarFallback>{match.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{match.name}</h3>
                <p className="text-sm text-muted-foreground">{match.course}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span>Match Score</span>
                <span>{match.matchScore}%</span>
              </div>
              <Progress value={match.matchScore} className="mt-2" />
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {match.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-accent px-2 py-1 rounded-full text-xs"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
            <Button
              className="w-full mt-4"
              onClick={() => navigate("/chat")}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Start Chat
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}