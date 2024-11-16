'use client'

import React, { useState } from 'react'
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

interface PairDisplayProps {
  pair: string
}

export default function PairDisplay({ pair }: PairDisplayProps) {
  const [source, setSource] = useState('all')
  const [componentKey, setComponentKey] = useState(0)

  const handleSourceChange = (newSource: string) => {
    setSource(newSource)
    setComponentKey(prev => prev + 1)
  }

  return (
    <div className="w-full mx-auto my-8 space-y-8">
      {/* Mobile: Text above, Desktop: All in one line */}
      <div className="space-y-4 md:space-y-0">
        {/* Limited data text - full width on mobile, inline on desktop */}
        <div className="text-sm text-muted-foreground text-center md:hidden">
          Limited data:{' '}
          <button
            onClick={() => {
              /* Add your premium upgrade handler here */
            }}
            className="text-primary hover:underline font-medium"
          >
            upgrade to Premium
          </button>
        </div>

        {/* Container for symbol, desktop text, and broker selector */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">{pair.toUpperCase()}</h1>

          {/* Desktop version of Limited data text */}
          <div className="hidden md:block text-sm text-muted-foreground mx-8">
            Limited data:{' '}
            <button
              onClick={() => {
                /* Add your premium upgrade handler here */
              }}
              className="text-primary hover:underline font-medium"
            >
              upgrade to Premium
            </button>
          </div>

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
