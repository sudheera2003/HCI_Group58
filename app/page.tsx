'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user) // true if user exists, false if null
      setLoading(false)
    }
    checkUser()
  }, [supabase])

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white">
      <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl mb-6">
        Furniture Visualizer
      </h1>
      <p className="text-xl text-slate-500 mb-8 max-w-lg text-center">
        Design your dream room in 3D. Visualize layout, colors, and furniture in real-time.
      </p>
      
      <div className="flex gap-4">
        {loading ? (
          <Button disabled variant="ghost">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking...
          </Button>
        ) : (
          <>
            {!isLoggedIn && (
              <Link href="/login">
                <Button size="lg" variant="outline">Login</Button>
              </Link>
            )}

            <Link href="/dashboard">
              <Button size="lg">
                {isLoggedIn ? "Go to Dashboard" : "Get Started"}
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}