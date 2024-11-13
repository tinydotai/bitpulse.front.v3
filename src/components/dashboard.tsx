'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

interface CryptoCurrency {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  price_change_percentage_24h: number
}

export default function DashboardComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [cryptoData, setCryptoData] = useState<CryptoCurrency[]>([])
  const [filteredData, setFilteredData] = useState<CryptoCurrency[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://0.0.0.0:8000/cryptos/data')
        const data = await response.json()
        setCryptoData(data)
        setFilteredData(prevFiltered => {
          // Only update filtered data if search term is empty
          return searchTerm === '' ? data : prevFiltered
        })
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching crypto data:', error)
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchData()

    // Set up polling interval
    const intervalId = setInterval(fetchData, 2000) // 2000ms = 2 seconds

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(intervalId)
  }, [searchTerm]) // Add searchTerm as dependency to prevent unnecessary filtered data updates

  useEffect(() => {
    const filtered = cryptoData.filter(
      crypto =>
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredData(filtered)
  }, [searchTerm, cryptoData])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Crypto Dashboard</h1>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search cryptocurrencies..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
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
                    <Skeleton className="h-4 w-20" />
                  </CardContent>
                </Card>
              ))
          : filteredData.map(crypto => (
              <Card key={crypto.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Image
                      src={crypto.image}
                      alt={`${crypto.name} logo`}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span>{crypto.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Price: ${crypto.current_price.toFixed(2)}</p>
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
                    <p className="text-sm">Market Cap Rank: #{crypto.market_cap_rank}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  )
}
