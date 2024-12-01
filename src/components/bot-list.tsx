'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Bot {
  bot_id: string
  pair: string
  status: string
  created_at: string
}

export function BotList() {
  const [bots, setBots] = useState<Bot[]>([])

  useEffect(() => {
    async function fetchBots() {
      try {
        const response = await fetch('http://localhost:8000/bot/bots')
        if (!response.ok) {
          throw new Error('Failed to fetch bots')
        }
        const data = await response.json()
        setBots(data)
      } catch (error) {
        console.error('Error fetching bots:', error)
      }
    }

    fetchBots()
  }, [])

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {bots.map((bot) => (
        <Link href={`/bots/${bot.bot_id}`} key={bot.bot_id}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{bot.pair}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={bot.status === 'running' ? 'default' : 'secondary'}>
                {bot.status}
              </Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                Created: {new Date(bot.created_at).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

