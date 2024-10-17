'use client'

import React, { useState } from 'react'
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

const SOURCES = ['all', 'binance', 'kucoin'] // Add or modify sources as needed

interface PairDisplayProps {
  pair: string
}

export default function PairDisplay({ pair }: PairDisplayProps) {
  const [source, setSource] = useState('all')

  const handleSourceChange = (newSource: string) => {
    console.log(`Changing source to: ${newSource}`)
    setSource(newSource)
  }

  return (
    <div className="w-full mx-auto my-8 space-y-8">
      <div className="flex justify-end mb-4">
        <Select value={source} onValueChange={handleSourceChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            {SOURCES.map(s => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="w-full">
        <LiveCryptoLineChartComponent cryptoPair={pair} source={source} />
      </Card>

      <div className="w-full">
        <BigTransactionsTableComponent cryptoPair={pair} source={source} />
      </div>
    </div>
  )
}
