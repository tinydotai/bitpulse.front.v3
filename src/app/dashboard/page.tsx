'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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

interface CryptoCurrency {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  price_change_percentage_24h: number
  timestamp: string
  ath: number
  atl: number
  circulating_supply: number
  total_supply: number
}

type SortOption = 'market_cap' | 'price' | 'name' | '24h_change'

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [cryptoData, setCryptoData] = useState<CryptoCurrency[]>([])
  const [filteredData, setFilteredData] = useState<CryptoCurrency[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortOption, setSortOption] = useState<SortOption>('market_cap')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://0.0.0.0:8000/cryptos/data')
        const data = await response.json()
        setCryptoData(data)
        setFilteredData(data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching crypto data:', error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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
        return [...data].sort((a, b) => b.current_price - a.current_price)
      case 'name':
        return [...data].sort((a, b) => a.name.localeCompare(b.name))
      case '24h_change':
        return [...data].sort(
          (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
        )
      default:
        return data
    }
  }

  const getMinutesAgo = (timestamp: string) => {
    const now = new Date()
    const updateTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - updateTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return 'Just now'
    } else if (diffInMinutes === 1) {
      return '1 minute ago'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} day${days > 1 ? 's' : ''} ago`
    }
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
            <SelectItem value="24h_change">24h Change</SelectItem>
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
                          <img
                            src={crypto.image}
                            alt={`${crypto.name} logo`}
                            className="w-6 h-6 rounded-full"
                            onError={e => {
                              const target = e.target as HTMLImageElement
                              target.onerror = null
                              target.src = '/placeholder.svg?height=24&width=24'
                            }}
                          />
                          <span className="truncate">{crypto.name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Price: {formatPrice(crypto.current_price)}
                          </p>
                          <p className="text-sm">
                            24h Change:{' '}
                            <span
                              className={
                                crypto.price_change_percentage_24h >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {crypto.price_change_percentage_24h.toFixed(2)}%
                            </span>
                          </p>
                          <p className="text-sm">
                            Market Cap: {formatMarketCap(crypto.market_cap)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Last Updated: {getMinutesAgo(crypto.timestamp)}
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
