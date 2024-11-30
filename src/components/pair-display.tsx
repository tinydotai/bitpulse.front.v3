'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BigTransactionsTableComponent } from './big-transactions-table'
import LiveCryptoLineChartComponent from './live-crypto-line-chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TooltipProvider } from '@/components/ui/tooltip'

const SOURCES = ['all', 'binance', 'kucoin']
const REFRESH_INTERVAL = 1000

interface CryptoData {
  symbol: string
  name: string
  market_cap: number
  total_volume: number
  circulating_supply: number
  max_supply: number | null
  total_supply: number
  ath: number
  ath_date: string
  atl: number
  atl_date: string
  calculated_stats: {
    prices: {
      binance?: number
      kucoin?: number
    }
    market_average: number
    change_24h: number
    timestamp: string
    last_updated: {
      binance?: string
      kucoin?: string
      coingecko?: string
    }
  }
}

interface PairDisplayProps {
  pair: string
}

const StatsCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="flex-1">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
)

const formatNumber = (num: number | null | undefined, decimals = 2) => {
  if (num === null || num === undefined) return 'N/A'

  // Handle large numbers
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(decimals)}B`
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(decimals)}M`
  }

  // Handle very small numbers (less than $0.01)
  if (num < 0.01) {
    // Convert to scientific notation and parse parts
    const [, exponent] = num.toExponential(6).split('e')
    const exp = parseInt(exponent)

    // Format based on how small the number is
    if (exp < -6) {
      return `${num.toExponential(4)}`
    } else {
      // Show up to 8 decimal places for small numbers
      return `${num.toFixed(Math.min(8, Math.abs(exp) + 2))}`
    }
  }

  // Regular numbers
  return `${num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PairDisplay({ pair }: PairDisplayProps) {
  const [source, setSource] = useState('all')
  const [componentKey, setComponentKey] = useState(0)
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchingRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = async () => {
    if (fetchingRef.current) return

    try {
      fetchingRef.current = true
      const response = await fetch(`http://localhost:8000/cryptos/data/${pair}`)
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      const data = await response.json()
      setCryptoData(data)
      setError(null)
    } catch (err) {
      setError('Failed to load data')
      console.error('Error fetching data:', err)
    } finally {
      fetchingRef.current = false
      setLoading(false)
      timeoutRef.current = setTimeout(fetchData, REFRESH_INTERVAL)
    }
  }

  useEffect(() => {
    fetchData()
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
    if (!cryptoData?.calculated_stats) return null

    if (source === 'all') {
      return {
        price: cryptoData.calculated_stats.market_average,
        dayChange: cryptoData.calculated_stats.change_24h,
        volume: cryptoData.total_volume,
      }
    }

    const sourcePrice =
      cryptoData.calculated_stats.prices[source as keyof typeof cryptoData.calculated_stats.prices]
    return sourcePrice
      ? {
          price: sourcePrice,
          dayChange: cryptoData.calculated_stats.change_24h,
          volume: cryptoData.total_volume,
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
              <h1 className="text-4xl font-bold">
                {cryptoData ? cryptoData.name : pair.toUpperCase()}
              </h1>

              {loading && !cryptoData ? (
                <div className="text-sm text-muted-foreground">Loading data...</div>
              ) : error ? (
                <div className="text-sm text-red-500">{error}</div>
              ) : (
                displayStats && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm">
                      <div className="text-muted-foreground">Price</div>
                      <div className="font-medium">${formatNumber(displayStats.price)}</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-muted-foreground">24h Change</div>
                      <div
                        className={`font-medium ${
                          displayStats.dayChange >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {displayStats.dayChange?.toFixed(2) ?? 'N/A'}%
                      </div>
                    </div>
                  </div>
                )
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
        {/* Stats Section */}
        {cryptoData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatsCard title="Market Statistics">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Market Cap</span>
                  <span className="font-medium">{formatNumber(cryptoData.market_cap)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">24h Volume</span>
                  <span className="font-medium">{formatNumber(cryptoData.total_volume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Updated</span>
                  <span className="font-medium">
                    {formatDate(cryptoData.calculated_stats.timestamp)}
                  </span>
                </div>
              </div>
            </StatsCard>

            <StatsCard title="Supply Information">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Circulating Supply</span>
                  <span className="font-medium">
                    {formatNumber(cryptoData.circulating_supply, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Max Supply</span>
                  <span className="font-medium">{formatNumber(cryptoData.max_supply, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Supply</span>
                  <span className="font-medium">{formatNumber(cryptoData.total_supply, 0)}</span>
                </div>
              </div>
            </StatsCard>

            <StatsCard title="All-Time Statistics">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">All-Time High</span>
                  <span className="font-medium text-green-500">
                    ${formatNumber(cryptoData.ath)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">ATH Date</span>
                  <span className="font-medium">{formatDate(cryptoData.ath_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">All-Time Low</span>
                  <span className="font-medium text-red-500">${formatNumber(cryptoData.atl)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">ATL Date</span>
                  <span className="font-medium">{formatDate(cryptoData.atl_date)}</span>
                </div>
              </div>
            </StatsCard>

            <StatsCard title="Exchange Prices">
              <div className="space-y-3">
                {Object.entries(cryptoData.calculated_stats.prices).map(([platform, price]) => (
                  <div key={platform} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Image
                        src={`/brokers/${platform}.png`}
                        alt={platform}
                        width={20}
                        height={20}
                      />
                      <span className="text-sm capitalize">{platform}</span>
                    </div>
                    <span className="font-medium">${formatNumber(price)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium">Market Average</span>
                  <span className="font-medium">
                    ${formatNumber(cryptoData.calculated_stats.market_average)}
                  </span>
                </div>
              </div>
            </StatsCard>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
