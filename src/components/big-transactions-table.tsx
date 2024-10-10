'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'

interface Transaction {
  _id: string
  timestamp: string
  symbol: string
  side: 'buy' | 'sell'
  price: number
  quantity: number
  value: number
  source: string
}

export function BigTransactionsTableComponent() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [, setUpdateTrigger] = useState(0)
  const ws = useRef<WebSocket | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/whales/ws/big_transactions')

    ws.current.onopen = () => {
      console.log('WebSocket connection established')
      ws.current?.send('Request update')

      intervalRef.current = setInterval(() => {
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send('Request update')
        }
      }, 5000)
    }

    ws.current.onmessage = event => {
      const newTransactions = JSON.parse(event.data)
      setTransactions(prevTransactions => {
        const updatedTransactions = [...newTransactions, ...prevTransactions]
        const uniqueTransactions = updatedTransactions.filter(
          (transaction, index, self) => index === self.findIndex(t => t._id === transaction._id)
        )
        return uniqueTransactions.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      })
    }

    ws.current.onerror = error => {
      console.error('WebSocket error:', error)
    }

    ws.current.onclose = () => {
      console.log('WebSocket connection closed')
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    // Set up interval to update relative times every second
    const updateInterval = setInterval(() => {
      setUpdateTrigger(prev => prev + 1)
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      clearInterval(updateInterval)
      ws.current?.close()
    }
  }, [])

  const getRelativeTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Big Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Side</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map(transaction => (
              <TableRow key={transaction._id}>
                <TableCell>{getRelativeTime(transaction.timestamp)}</TableCell>
                <TableCell>{transaction.symbol}</TableCell>
                <TableCell
                  className={transaction.side === 'buy' ? 'text-green-600' : 'text-red-600'}
                >
                  {transaction.side.toUpperCase()}
                </TableCell>
                <TableCell>{transaction.price.toFixed(2)}</TableCell>
                <TableCell>{transaction.quantity.toFixed(2)}</TableCell>
                <TableCell>{transaction.value.toFixed(2)}</TableCell>
                <TableCell>{transaction.source}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
