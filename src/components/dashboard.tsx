'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

const cryptoPairs = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'PEPEUSDT', 'NEIROUSDT', 'SUIUSDT', 'DOGEUSDT', 'WIFUSDT', 'BOMEUSDT', 'BNBUSDT',
  'WLDUSDT', 'XRPUSDT', 'ENAUSDT', 'SHIBUSDT', 'APTUSDT', 'FTMUSDT', 'LTCUSDT', 'AVAXUSDT', 'NEARUSDT', 'NOTUSDT',
  'FETUSDT', '1000SATSUSDT', 'TAOUSDT', 'RUNEUSDT', 'PEOPLEUSDT', 'FLOKIUSDT', 'ARBUSDT', 'SEIUSDT', 'ORDIUSDT',
  'BONKUSDT', 'ARKMUSDT', 'STORJUSDT', 'MEMEUSDT', 'DOGSUSDT', 'TIAUSDT', 'EIGENUSDT', 'ADAUSDT', 'ETHFIUSDT',
  'LINKUSDT', 'TRXUSDT', 'AAVEUSDT', 'RENDERUSDT', 'UNIUSDT', 'PENDLEUSDT', 'JTOUSDT', 'ARKUSDT', 'DOTUSDT',
  'STRKUSDT', 'ICPUSDT', 'KEYUSDT',
]

export function DashboardComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredPairs, setFilteredPairs] = useState(cryptoPairs)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const filtered = cryptoPairs.filter(pair =>
      pair.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredPairs(filtered)
  }, [searchTerm])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Crypto Pairs Dashboard</h1>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search crypto pairs..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {isLoading
          ? Array(10).fill(0).map((_, index) => (
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
          : filteredPairs.map(pair => {
              const symbol = pair.replace('USDT', '')
              return (
                <Card key={pair} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Image
                        src={`/pairs/${symbol}.png`}
                        alt={`${symbol} logo`}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span>{pair}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={`/pair/${pair}`}
                      className="text-blue-500 hover:text-blue-700 transition-colors duration-300"
                    >
                      View Details
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
      </div>
    </div>
  )
}