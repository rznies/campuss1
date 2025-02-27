import { useEffect, useState } from "react"
import { getLeaderboard } from "@/api/leaderboard"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"
import { useToast } from "@/hooks/useToast"

type LeaderboardEntry = {
  _id: string
  name: string
  avatar: string
  points: number
  rank: number
  badges: string[]
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await getLeaderboard()
        setEntries(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load leaderboard",
        })
      }
    }
    loadLeaderboard()
  }, [toast])

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Leaderboard</h2>
      <div className="space-y-4">
        {entries.map((entry) => (
          <Card key={entry._id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {entry.rank === 1 ? (
                  <Trophy className="h-6 w-6 text-yellow-500" />
                ) : (
                  <span className="text-xl font-bold">{entry.rank}</span>
                )}
              </div>
              <Avatar className="h-12 w-12">
                <AvatarImage src={entry.avatar} />
                <AvatarFallback>{entry.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold">{entry.name}</div>
                <div className="text-sm text-muted-foreground">
                  {entry.points} points
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {entry.badges.map((badge, index) => (
                  <Badge key={index} variant="secondary">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}