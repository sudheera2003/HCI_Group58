'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User } from '@supabase/supabase-js'

export function UserMenu() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()
  const router = useRouter()

  // Check login status on load
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh() // Force refresh to clear state
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  // fallback if not logged in, show a Login button
  if (!user) return (
    <button 
      onClick={() => router.push('/login')} 
      className="text-sm font-medium text-foreground hover:text-primary transition-colors"
    >
      Login
    </button>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer hover:opacity-80 transition ring-2 ring-transparent hover:ring-primary/20">
          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
            {user.email ? getInitials(user.email) : 'U'}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col space-y-1">
          <span>My Account</span>
          <span className="text-xs font-normal text-muted-foreground truncate">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer">
          My Saved Projects
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push('/editor/new')} className="cursor-pointer">
          New Design
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}