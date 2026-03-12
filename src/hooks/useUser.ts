"use client"
import { useState, useEffect } from "react"
interface User { id: string; name: string; email: string }
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    fetch("/api/profile").then(r => r.ok ? r.json() : null).then(d => setUser(d))
  }, [])
  return user
}
