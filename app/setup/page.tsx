"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { SetupPanel } from "@/components/setup"

export default function SetupPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/sources")
      if (response.status === 401) {
        setIsAuthenticated(false)
        toast({
          title: "Authentication Required",
          description: "Please enter your credentials to access this page.",
          variant: "destructive",
        })
      } else {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Error checking authentication:", error)
      setIsAuthenticated(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Please enter your credentials to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container w-screen h-screen overflow-hidden mx-auto flex items-center justify-center">
      <SetupPanel />
    </div>
  )
} 