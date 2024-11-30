'use client'

import React, { useState, useEffect, useRef } from 'react'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const SOURCES = ['all', 'binance', 'kucoin']
const REFRESH_INTERVAL = 1000

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
  const fetchingRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchStats = async () => {
    if (fetchingRef.current) return

    try {
      fetchingRef.current = true
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
      fetchingRef.current = false
      setLoading(false)
      timeoutRef.current = setTimeout(fetchStats, REFRESH_INTERVAL)
    }
  }

  useEffect(() => {
    fetchStats()
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      fetchingRef.current = false
    }
  }, [pair])

  const handleSourceChange = (newSource: string) => {
    setSource(newSource)
    setComponentKey(prev => prev + 1)
  }

  const getDisplayStats = () => {
    if (!stats) return null

    if (source === 'all') {
      const binanceStats = stats.platforms.binance
      const kucoinStats = stats.platforms.kucoin
      return {
        price: stats.average_price,
        hourChange: binanceStats?.hour_change || kucoinStats?.hour_change || 0,
        dayChange: binanceStats?.day_change || kucoinStats?.day_change || 0,
      }
    }

    const platformStats = stats.platforms[source as keyof typeof stats.platforms]
    return platformStats
      ? {
          price: platformStats.price,
          hourChange: platformStats.hour_change,
          dayChange: platformStats.day_change,
        }
      : null
  }

  const displayStats = getDisplayStats()

  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-full mx-auto my-8 space-y-8">
        <div className="space-y-4 md:space-y-0">
          <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
            <div className="flex flex-col space-y-4">
              <h1 className="text-4xl font-bold">{pair.toUpperCase()}</h1>

              {loading && !stats ? (
                <div className="text-sm text-muted-foreground">Loading stats...</div>
              ) : error ? (
                <div className="text-sm text-red-500">{error}</div>
              ) : (
                displayStats && (
                  <div className="grid grid-cols-3 gap-4">
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
                      <div className="text-muted-foreground">1h Change</div>
                      <div
                        className={`font-medium ${
                          displayStats.hourChange >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {displayStats.hourChange.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-muted-foreground">24h Change</div>
                      <div
                        className={`font-medium ${
                          displayStats.dayChange >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {displayStats.dayChange.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                )
              )}

              {stats && source === 'all' && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Platform Prices</div>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(stats.platforms).map(([platform, platformStats]) => (
                      <Tooltip key={platform}>
                        <TooltipTrigger asChild>
                          <div className="flex items-center space-x-2 cursor-help">
                            <Image
                              src={`/brokers/${platform}.png`}
                              alt={platform}
                              width={33}
                              height={33}
                            />
                            <span className="text-sm">
                              $
                              {platformStats.price.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="capitalize">{platform}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between space-x-4">
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
    </TooltipProvider>
  )
}
