'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Plus } from 'lucide-react'

interface Bot {
  bot_id: string
  pair: string
  status: string
  created_at: string
}

export function BotList() {
  const [bots, setBots] = useState<Bot[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const response = await fetch('https://bitpulse.ge/bot/bots')
        if (!response.ok) {
          throw new Error('Failed to fetch bots')
        }
        const data = await response.json()
        setBots(data)
      } catch (error) {
        console.error('Error fetching bots:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBots()
  }, [])

  if (isLoading) {
    return <div>Loading bots...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Bots</h2>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create New Bot</span>
        </Button>
      </div>
      {bots.length === 0 ? (
        <p>No bots found. Create a new bot to get started!</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <Card key={bot.bot_id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Bot ID: {bot.bot_id}
                </CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bot.pair}</div>
                <p className="text-xs text-muted-foreground">
                  Status: {bot.status}
                </p>
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(bot.created_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

