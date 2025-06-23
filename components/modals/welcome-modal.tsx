'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles, Bot, Zap } from 'lucide-react'

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if user has seen welcome modal before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
    if (!hasSeenWelcome) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcome', 'true')
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Welcome to AS Platform
          </DialogTitle>
          <DialogDescription className="text-left">
            Your AI automation platform is ready to help you streamline your workflows and boost productivity.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Bot className="h-8 w-8 text-blue-500" />
            <div>
              <h4 className="font-medium">AI Agents</h4>
              <p className="text-sm text-muted-foreground">
                Create and manage intelligent AI agents for various tasks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Zap className="h-8 w-8 text-yellow-500" />
            <div>
              <h4 className="font-medium">Automation</h4>
              <p className="text-sm text-muted-foreground">
                Set up powerful workflows to automate your business processes
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Skip Tour
          </Button>
          <Button onClick={handleClose}>
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}