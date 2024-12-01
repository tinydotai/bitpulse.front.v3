'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DOMAIN } from '../config'

interface CalculatedStats {
  prices: {
    binance?: number
    kucoin?: number
  }
  timestamp: string
  last_updated: {
    binance?: string
    kucoin?: string
    coingecko?: string
  }
  execution_time: number
}

interface CryptoCurrency {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  timestamp: string
  ath: number
  atl: number
  circulating_supply: number
  total_supply: number
  calculated_stats: CalculatedStats
}

type SortOption = 'market_cap' | 'price' | 'name'

const calculateMarketAverage = (prices: { [key: string]: number | undefined }): number => {
  const validPrices = Object.values(prices).filter(
    (price): price is number => typeof price === 'number' && !isNaN(price)
  )

  if (validPrices.length === 0) return 0

  return validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [cryptoData, setCryptoData] = useState<CryptoCurrency[]>([])
  const [filteredData, setFilteredData] = useState<CryptoCurrency[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortOption, setSortOption] = useState<SortOption>('market_cap')
  const [timezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${DOMAIN}/cryptos/data?timezone_str=${timezone}`)
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const data = await response.json()
        setCryptoData(data)
        setFilteredData(prevFiltered => {
          if (searchTerm === '') {
            return sortData(data, sortOption)
          }
          return prevFiltered
        })
        setError(null)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching crypto data:', error)
        setError('Failed to fetch cryptocurrency data. Please try again later.')
        setIsLoading(false)
      }
    }

    fetchData()
    const intervalId = setInterval(fetchData, 2000)
    return () => clearInterval(intervalId)
  }, [searchTerm, sortOption, timezone])

  useEffect(() => {
    const filtered = cryptoData.filter(
      crypto =>
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const sorted = sortData(filtered, sortOption)
    setFilteredData(sorted)
  }, [searchTerm, cryptoData, sortOption])

  const sortData = (data: CryptoCurrency[], option: SortOption) => {
    switch (option) {
      case 'market_cap':
        return [...data].sort((a, b) => b.market_cap - a.market_cap)
      case 'price':
        return [...data].sort((a, b) => {
          const aPrice = calculateMarketAverage(a.calculated_stats.prices)
          const bPrice = calculateMarketAverage(b.calculated_stats.prices)
          return bPrice - aPrice
        })
      case 'name':
        return [...data].sort((a, b) => a.name.localeCompare(b.name))
      default:
        return data
    }
  }

  const handleImageError = (cryptoId: string) => {
    setFailedImages(prev => ({
      ...prev,
      [cryptoId]: true,
    }))
  }

  const renderCryptoIcon = (crypto: CryptoCurrency) => {
    if (failedImages[crypto.id]) {
      return (
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-xs font-bold text-blue-600">
            {crypto.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )
    }

    return (
      <div className="relative w-6 h-6">
        <Image
          src={crypto.image}
          alt={`${crypto.name} logo`}
          fill
          className="rounded-full object-cover"
          sizes="24px"
          onError={() => handleImageError(crypto.id)}
          loading="lazy"
          priority={false}
        />
      </div>
    )
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`
    } else {
      return `$${marketCap.toFixed(2)}`
    }
  }

  const formatPrice = (price: number) => {
    if (price < 0.000001) {
      return `$${price.toExponential(2)}`
    } else if (price < 0.01) {
      return `$${price.toFixed(6)}`
    } else if (price < 1) {
      return `$${price.toFixed(4)}`
    } else if (price < 10) {
      return `$${price.toFixed(3)}`
    } else {
      return `$${price.toFixed(2)}`
    }
  }

  const formatSupply = (supply: number) => {
    if (supply >= 1e9) {
      return `${(supply / 1e9).toFixed(2)}B`
    } else if (supply >= 1e6) {
      return `${(supply / 1e6).toFixed(2)}M`
    } else if (supply >= 1e3) {
      return `${(supply / 1e3).toFixed(2)}K`
    } else {
      return supply.toFixed(2)
    }
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Crypto Dashboard</h1>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Input
          type="text"
          placeholder="Search cryptocurrencies..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="market_cap">Market Cap</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {isLoading
          ? Array(10)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-6 w-24" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24 mt-2" />
                  </CardContent>
                </Card>
              ))
          : filteredData.map(crypto => (
              <TooltipProvider key={crypto.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          {renderCryptoIcon(crypto)}
                          <span className="truncate">{crypto.name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Price:{' '}
                            {formatPrice(calculateMarketAverage(crypto.calculated_stats.prices))}
                          </p>
                          <p className="text-sm">
                            Market Cap: {formatMarketCap(crypto.market_cap)}
                          </p>
                        </div>
                        <Link
                          href={`/pair/${crypto.symbol.toUpperCase()}`}
                          className="text-blue-500 hover:text-blue-700 transition-colors duration-300 mt-2 inline-block"
                        >
                          View Details
                        </Link>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="p-2 space-y-2">
                      <p>Symbol: {crypto.symbol.toUpperCase()}</p>
                      <p>All-Time High: {formatPrice(crypto.ath)}</p>
                      <p>All-Time Low: {formatPrice(crypto.atl)}</p>
                      <p>Circulating Supply: {formatSupply(crypto.circulating_supply)}</p>
                      <p>Total Supply: {formatSupply(crypto.total_supply)}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
      </div>
    </div>
  )
}
