'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDistanceToNowStrict, differenceInSeconds } from 'date-fns'
import { ArrowRight } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import { WS_DOMAIN } from '@/app/config'

interface Transaction {
  _id: string
  timestamp: string
  symbol: string
  baseCurrency: string
  quoteCurrency: string
  side: 'buy' | 'sell'
  price: number
  quantity: number
  value: number
  source: string
}

interface BigTransactionProps {
  cryptoPair: string
  source: string
}

export function BigTransactionsTableComponent({ cryptoPair, source }: BigTransactionProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [, setUpdateTrigger] = useState(0)
  const ws = useRef<WebSocket | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  // Get user's timezone
  const [timezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)

  const connectWebSocket = useCallback(() => {
    if (ws.current) {
      ws.current.close()
    }

    const sourceParam = source !== 'all' ? `source=${source}` : ''
    const timeZoneParam = `timezone_str=${timezone}`
    const queryParams = [sourceParam, timeZoneParam].filter(Boolean).join('&')
    const wsUrl = `${WS_DOMAIN}/whales/ws/big_transactions/${cryptoPair}${
      queryParams ? `?${queryParams}` : ''
    }`

    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => {
      console.log('WebSocket connection established')
      ws.current?.send('Request update')

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

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
        return uniqueTransactions
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 200) // Keep only the last 200 elements
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
  }, [cryptoPair, source, timezone]) // Added timezone to dependencies

  useEffect(() => {
    connectWebSocket()
    setTransactions([]) // Clear existing transactions when source changes

    // Set up interval to update relative times every second
    const updateInterval = setInterval(() => {
      setUpdateTrigger(prev => prev + 1)
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      clearInterval(updateInterval)
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [cryptoPair, source, connectWebSocket])

  const getRelativeTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const secondsAgo = differenceInSeconds(now, date)

    if (secondsAgo < 60) {
      return `${secondsAgo}s`
    }

    return formatDistanceToNowStrict(date, { addSuffix: true })
  }, [])

  const formatNumber = useCallback((num: number, decimals: number = 2) => {
    if (num >= 1 || num === 0) {
      const parts = num.toFixed(decimals).split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return parts.join('.')
    } else if (num >= 0.01) {
      return num.toFixed(3)
    } else if (num >= 0.0001) {
      return num.toFixed(5)
    } else {
      return num.toExponential(2)
    }
  }, [])

  const formatCurrency = useCallback((num: number) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`
    } else if (num >= 1) {
      return `$${num.toFixed(2)}`
    } else if (num >= 0.01) {
      return `$${num.toFixed(3)}`
    } else if (num >= 0.0001) {
      return `$${num.toFixed(5)}`
    } else {
      return `$${num.toExponential(2)}`
    }
  }, [])

  const getCurrencyImage = useCallback((currency: string) => {
    return `/pairs/${currency}.png`
  }, [])

  const getBrokerImage = useCallback((broker: string) => {
    return `/brokers/${broker}.png`
  }, [])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Big Transactions ({source.charAt(0).toUpperCase() + source.slice(1)})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-hidden" style={{ height: '400px' }}>
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[100px] md:w-[150px]">Time</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead className="hidden md:table-cell">Side</TableHead>
                <TableHead className="hidden md:table-cell text-right">Price</TableHead>
                <TableHead className="hidden md:table-cell text-right">Quantity</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="hidden md:table-cell">Broker</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
          <div className="overflow-auto h-full custom-scrollbar">
            <Table>
              <TableBody>
                <AnimatePresence>
                  {transactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction._id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={transaction.side === 'buy' ? 'text-green-500' : 'text-red-500'}
                    >
                      <TableCell className="w-[100px] md:w-[150px]">
                        {getRelativeTime(transaction.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Image
                                  src={getCurrencyImage(transaction.baseCurrency)}
                                  alt={transaction.baseCurrency}
                                  width={24}
                                  height={24}
                                  onError={e => {
                                    e.currentTarget.src = '/placeholder.svg?height=24&width=24'
                                  }}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{transaction.baseCurrency}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <ArrowRight size={16} />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Image
                                  src={getCurrencyImage(transaction.quoteCurrency)}
                                  alt={transaction.quoteCurrency}
                                  width={24}
                                  height={24}
                                  onError={e => {
                                    e.currentTarget.src = '/placeholder.svg?height=24&width=24'
                                  }}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{transaction.quoteCurrency}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {transaction.side.toUpperCase()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right font-mono">
                        {formatNumber(transaction.price)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right font-mono">
                        {formatNumber(transaction.quantity, 4)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(transaction.value)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Image
                                src={getBrokerImage(transaction.source)}
                                alt={transaction.source}
                                width={34}
                                height={34}
                                onError={e => {
                                  e.currentTarget.src = '/placeholder.svg?height=24&width=24'
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{transaction.source}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
