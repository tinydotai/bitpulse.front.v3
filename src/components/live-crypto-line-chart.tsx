'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Wifi, WifiOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type DataPoint = {
  timestamp: string
  price: number
  totalBuyValue: number
  totalSellValue: number
}

interface WebSocketMessage {
  timestamp: string
  buy_avg_price: number
  sell_avg_price: number
  buy_total_value: number
  sell_total_value: number
  avg_price: number
}

interface LiveCryptoChartProps {
  cryptoPair: string
}

export default function LiveCryptoLineChartComponent({ cryptoPair }: LiveCryptoChartProps) {
  const [data, setData] = useState<DataPoint[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)
  const pingInterval = useRef<NodeJS.Timeout | null>(null)
  const pingTimeout = useRef<NodeJS.Timeout | null>(null)

  const addDataPoint = useCallback((newDataPoint: DataPoint) => {
    setData(prevData => {
      const existingIndex = prevData.findIndex(point => point.timestamp === newDataPoint.timestamp)
      if (existingIndex !== -1) {
        const updatedData = [...prevData]
        updatedData[existingIndex] = newDataPoint
        return updatedData.slice(-60)
      } else {
        return [...prevData, newDataPoint].slice(-60)
      }
    })
  }, [])

  const formatCurrency = useCallback((value: number) => {
    if (value >= 1) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
    } else if (value >= 0.01) {
      return `$${value.toFixed(3)}`
    } else if (value >= 0.0001) {
      return `$${value.toFixed(5)}`
    } else {
      return `$${value.toExponential(2)}`
    }
  }, [])

  const formatTooltipValue = useCallback(
    (value: number, name: string) => {
      if (name === 'Price') {
        return [formatCurrency(value), name]
      }
      return [`$${Math.round(value).toLocaleString()}`, name]
    },
    [formatCurrency]
  )

  const heartbeat = useCallback(() => {
    if (pingTimeout.current) clearTimeout(pingTimeout.current)
    pingTimeout.current = setTimeout(() => {
      setIsConnected(false)
      if (ws.current) {
        ws.current.close()
        connectWebSocket()
      }
    }, 5000)
  }, [])

  const connectWebSocket = useCallback(() => {
    if (ws.current) {
      ws.current.close()
    }

    ws.current = new WebSocket(`ws://localhost:8000/stats/ws/transaction_stats/${cryptoPair}`)

    ws.current.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
      heartbeat()
    }

    ws.current.onmessage = event => {
      const message = JSON.parse(event.data)
      if (message.type === 'pong') {
        heartbeat()
      } else if (Array.isArray(message) && message.length > 0) {
        message.forEach((item: WebSocketMessage) => {
          const newDataPoint = {
            timestamp: new Date(item.timestamp).toLocaleTimeString('en-US', { hour12: false }),
            price: item.avg_price,
            totalBuyValue: item.buy_total_value,
            totalSellValue: item.sell_total_value,
          }
          addDataPoint(newDataPoint)
        })
      }
    }

    ws.current.onclose = () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    }

    ws.current.onerror = error => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
    }
  }, [addDataPoint, heartbeat, cryptoPair])

  useEffect(() => {
    connectWebSocket()

    pingInterval.current = setInterval(() => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'ping' }))
      }
    }, 3000)

    return () => {
      if (pingInterval.current) clearInterval(pingInterval.current)
      if (pingTimeout.current) clearTimeout(pingTimeout.current)
      if (ws.current) ws.current.close()
    }
  }, [connectWebSocket])

  const formatXAxis = useCallback((tickItem: string) => {
    return tickItem
  }, [])

  return (
    <Card className="w-full bg-background">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Buy/Sell Volumes</CardTitle>
          <span className="text-sm font-normal">
            {isConnected ? (
              <Wifi className="inline-block text-green-500 w-4 h-4 mr-1" />
            ) : (
              <WifiOff className="inline-block text-red-500 w-4 h-4 mr-1" />
            )}
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 60, left: 60, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis
                dataKey="timestamp"
                stroke="#888"
                tick={{ fill: '#888' }}
                tickFormatter={formatXAxis}
                minTickGap={50}
              />
              <YAxis
                yAxisId="left"
                stroke="#888"
                tick={{ fill: '#888' }}
                tickFormatter={value => `$${Math.round(value).toLocaleString()}`}
                label={{
                  value: 'Total Value',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#888',
                  offset: -45,
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#4299e1"
                tick={{ fill: '#4299e1' }}
                tickFormatter={formatCurrency}
                label={{
                  value: 'Price',
                  angle: 90,
                  position: 'insideRight',
                  fill: '#4299e1',
                  offset: -45,
                }}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #2d3748' }}
                labelStyle={{ color: '#888' }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={formatTooltipValue}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar
                dataKey="totalBuyValue"
                fill="#48bb78"
                yAxisId="left"
                name="Total Buy Value"
                isAnimationActive={false}
              />
              <Bar
                dataKey="totalSellValue"
                fill="#f56565"
                yAxisId="left"
                name="Total Sell Value"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#4299e1"
                dot={false}
                strokeWidth={2}
                yAxisId="right"
                name="Price"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
