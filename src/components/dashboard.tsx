'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

// ... (keep all the existing interfaces and type definitions)

export function DashboardComponent() {
  // ... (keep all the existing state variables and useEffect hooks)

  const [loadingDetails, setLoadingDetails] = useState<string | null>(null)
  const router = useRouter()

  // ... (keep all the existing functions like getMinutesAgo, formatMarketCap, etc.)

  const handleViewDetails = (symbol: string) => {
    setLoadingDetails(symbol)
    router.push(`/pair/${symbol.toUpperCase()}`)
  }

  return (
    <div className="p-8">
      {/* ... (keep the existing header and search/sort inputs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {isLoading
          ? Array(10)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  {/* ... (keep the existing skeleton loading state) */}
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
                            Price: {formatPrice(crypto.calculated_stats.market_average)}
                          </p>
                          <p className="text-sm">
                            24h Change:{' '}
                            <span
                              className={
                                crypto.calculated_stats.change_24h >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {crypto.calculated_stats.change_24h.toFixed(2)}%
                            </span>
                          </p>
                          <p className="text-sm">
                            Market Cap: {formatMarketCap(crypto.market_cap)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Last Updated: {getMinutesAgo(crypto.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleViewDetails(crypto.symbol)}
                          className="text-blue-500 hover:text-blue-700 transition-colors duration-300 mt-2 inline-block"
                          disabled={loadingDetails === crypto.symbol}
                        >
                          {loadingDetails === crypto.symbol ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Loading...
                            </span>
                          ) : (
                            'View Details'
                          )}
                        </button>
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