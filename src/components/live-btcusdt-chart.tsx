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
}

export default function Component() {
  const [data, setData] = useState<DataPoint[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)
  const pingInterval = useRef<NodeJS.Timeout | null>(null)
  const pingTimeout = useRef<NodeJS.Timeout | null>(null)

  const addDataPoint = useCallback((newDataPoint: DataPoint) => {
    setData(prevData => {
      const existingIndex = prevData.findIndex(point => point.timestamp === newDataPoint.timestamp)
      if (existingIndex !== -1) {
        // If a data point with the same timestamp exists, update it
        const updatedData = [...prevData]
        updatedData[existingIndex] = newDataPoint
        return updatedData.slice(-60) // Keep only the last 60 data points
      } else {
        // If it's a new data point, add it to the array
        return [...prevData, newDataPoint].slice(-60) // Keep only the last 60 data points
      }
    })
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  }

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'Price') {
      return [formatCurrency(value), name]
    }
    return [formatCurrency(value), name]
  }

  const heartbeat = useCallback(() => {
    if (pingTimeout.current) clearTimeout(pingTimeout.current)
    pingTimeout.current = setTimeout(() => {
      setIsConnected(false)
      if (ws.current) {
        ws.current.close()
        connectWebSocket()
      }
    }, 5000) // Consider connection lost if no pong received within 5 seconds
  }, [])

  const connectWebSocket = useCallback(() => {
    if (ws.current) {
      ws.current.close()
    }

    ws.current = new WebSocket('ws://localhost:8000/stats/ws/transaction_stats/BTCUSDT')

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
            price: (item.buy_avg_price + item.sell_avg_price) / 2,
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
  }, [addDataPoint, heartbeat])

  useEffect(() => {
    connectWebSocket()

    pingInterval.current = setInterval(() => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'ping' }))
      }
    }, 3000) // Send ping every 3 seconds

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
    <div className="w-full h-[500px] bg-[#0f172a] p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Live BTCUSDT Chart</h2>
        <div className="flex items-center">
          {isConnected ? (
            <Wifi className="text-green-500 w-6 h-6" aria-label="Connected" />
          ) : (
            <WifiOff className="text-red-500 w-6 h-6" aria-label="Disconnected" />
          )}
          <span className="ml-2 text-white sr-only">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
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
              tickFormatter={value => formatCurrency(value)}
              label={{
                value: '',
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
              tickFormatter={value => formatCurrency(value)}
              label={{
                value: '',
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
    </div>
  )
}
