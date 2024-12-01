'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'

type Trade = {
  id: number
  date: string
  pair: string
  type: 'buy' | 'sell'
  amount: number
  price: number
}

const initialTrades: Trade[] = []

export default function TradingHistory() {
  const [trades, setTrades] = useState<Trade[]>(initialTrades)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Trade
    direction: 'asc' | 'desc'
  } | null>(null)

  const sortTrades = (key: keyof Trade) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })

    const sortedTrades = [...trades].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
      return 0
    })

    setTrades(sortedTrades)
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" onClick={() => sortTrades('date')}>
                Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => sortTrades('pair')}>
                Pair
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => sortTrades('type')}>
                Type
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => sortTrades('amount')}>
                Amount
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => sortTrades('price')}>
                Price
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map(trade => (
            <TableRow key={trade.id}>
              <TableCell>{trade.date}</TableCell>
              <TableCell>{trade.pair}</TableCell>
              <TableCell>
                <span className={trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
                  {trade.type.toUpperCase()}
                </span>
              </TableCell>
              <TableCell>{trade.amount}</TableCell>
              <TableCell>${trade.price.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
