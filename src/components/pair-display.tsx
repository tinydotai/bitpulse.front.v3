'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { BigTransactionsTableComponent } from './big-transactions-table'
import LiveCryptoLineChartComponent from './live-crypto-line-chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SOURCES = ['all', 'binance', 'kucoin']

interface PlatformStats {
  price: number
  hour_change: number
  day_change: number
  volume: number
  timestamp: string
  last_hour_timestamp: string
  last_day_timestamp: string
}

interface CryptoStats {
  symbol: string
  platforms: {
    binance?: PlatformStats
    kucoin?: PlatformStats
  }
  average_price: number
  timestamp: string
}

interface PairDisplayProps {
  pair: string
}

export default function PairDisplay({ pair }: PairDisplayProps) {
  const [source, setSource] = useState('all')
  const [componentKey, setComponentKey] = useState(0)
  const [stats, setStats] = useState<CryptoStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8000/cryptos/stats/${pair}USDT`)
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        const data = await response.json()
        setStats(data)
        setError(null)
      } catch (err) {
        setError('Failed to load stats')
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [pair])

  const handleSourceChange = (newSource: string) => {
    setSource(newSource)
    setComponentKey(prev => prev + 1)
  }

  const getDisplayStats = () => {
    if (!stats) return null

    if (source === 'all') {
      return {
        price: stats.average_price,
        change: stats.platforms.binance?.day_change || stats.platforms.kucoin?.day_change || 0,
        volume: Object.values(stats.platforms).reduce(
          (sum, platform) => sum + (platform?.volume || 0),
          0
        ),
      }
    }

    const platformStats = stats.platforms[source as keyof typeof stats.platforms]
    return platformStats
      ? {
          price: platformStats.price,
          change: platformStats.day_change,
          volume: platformStats.volume,
        }
      : null
  }

  const displayStats = getDisplayStats()

  return (
    <div className="w-full mx-auto my-8 space-y-8">
      {/* Mobile: Text above, Desktop: All in one line */}
      <div className="space-y-4 md:space-y-0">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex flex-col space-y-2">
            <h1 className="text-4xl font-bold">{pair.toUpperCase()}</h1>

            {/* Stats display */}
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading stats...</div>
            ) : error ? (
              <div className="text-sm text-red-500">{error}</div>
            ) : (
              displayStats && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-sm">
                    <div className="text-muted-foreground">Price</div>
                    <div className="font-medium">
                      $
                      {displayStats.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-muted-foreground">24h Change</div>
                    <div
                      className={`font-medium ${
                        displayStats.change >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {displayStats.change.toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-muted-foreground">24h Volume</div>
                    <div className="font-medium">
                      {displayStats.volume.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      BTC
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="flex items-center justify-between space-x-4">
            {/* Desktop version of Limited data text */}
            <div className="hidden md:block text-sm text-muted-foreground"></div>

            <Select value={source} onValueChange={handleSourceChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select source">
                  {source !== 'all' && (
                    <Image
                      src={`/brokers/${source}.png`}
                      alt={source}
                      width={17}
                      height={17}
                      className="mr-2 inline-block"
                    />
                  )}
                  {source === 'all'
                    ? 'All Brokers'
                    : source.charAt(0).toUpperCase() + source.slice(1)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map(s => (
                  <SelectItem key={s} value={s} className="flex items-center">
                    {s !== 'all' && (
                      <Image
                        src={`/brokers/${s}.png`}
                        alt={s}
                        width={17}
                        height={17}
                        className="mr-2 inline-block"
                      />
                    )}
                    {s === 'all' ? 'All Brokers' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="w-full">
        <LiveCryptoLineChartComponent
          key={`chart-${componentKey}`}
          cryptoPair={pair}
          source={source}
        />
      </Card>

      <div className="w-full">
        <BigTransactionsTableComponent
          key={`table-${componentKey}`}
          cryptoPair={pair}
          source={source}
        />
      </div>
    </div>
  )
}
