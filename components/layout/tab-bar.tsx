"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Map, Plus, User } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/mapping", label: "アーカイブ", icon: Map },
  { href: "/submit", label: "記録", icon: Plus },
  { href: "/profile", label: "プロフィール", icon: User },
]

export function TabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
