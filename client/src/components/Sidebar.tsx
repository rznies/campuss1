import { NavLink } from "react-router-dom"
import { Home, MessageSquare, Heart, Users, Award } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Feed", href: "/", icon: Home },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Compliments", href: "/compliments", icon: Heart },
  { name: "Matches", href: "/matches", icon: Users },
  { name: "Leaderboard", href: "/leaderboard", icon: Award },
]

type SidebarProps = {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-2xl font-bold">Campusphere</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}