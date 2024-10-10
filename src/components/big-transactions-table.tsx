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
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Replace with your actual WebSocket server URL
    ws.current = new WebSocket('ws://localhost:8000/whales/ws/big_transactions')

    ws.current.onopen = () => {
      console.log('WebSocket connection established')
      // Send any message to request an update
      ws.current?.send('Request update')
    }

    ws.current.onmessage = event => {
      const newTransactions = JSON.parse(event.data)
      setTransactions(prevTransactions => {
        const updatedTransactions = [...newTransactions, ...prevTransactions]
        // Keep only the latest 10 transactions
        return updatedTransactions.slice(0, 10)
      })
    }

    ws.current.onerror = error => {
      console.error('WebSocket error:', error)
    }

    ws.current.onclose = () => {
      console.log('WebSocket connection closed')
    }

    return () => {
      ws.current?.close()
    }
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
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
                <TableCell>{formatDate(transaction.timestamp)}</TableCell>
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
