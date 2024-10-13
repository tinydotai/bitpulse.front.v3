'use client'

import { useEffect, useState, useRef } from 'react'
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

type DataPoint = {
  timestamp: string
  price: number
  totalBuyValue: number
  totalSellValue: number
}

export default function LiveBTCUSDTChart() {
  const [data, setData] = useState<DataPoint[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/stats/ws/transaction_stats/BTCUSDT')

    ws.current.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    }

    ws.current.onmessage = event => {
      const newDataArray = JSON.parse(event.data)
      if (Array.isArray(newDataArray) && newDataArray.length > 0) {
        const newDataPoints = newDataArray.map((item: any) => ({
          timestamp: new Date(item.timestamp).toLocaleTimeString(),
          price: (item.buy_avg_price + item.sell_avg_price) / 2,
          totalBuyValue: item.buy_total_value,
          totalSellValue: item.sell_total_value,
        }))
        setData(prevData => {
          const updatedData = [...prevData, ...newDataPoints]
          return updatedData.slice(-60) // Keep only the last 60 data points
        })
      }
    }

    ws.current.onclose = () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    }

    // Function to send update request
    const sendUpdateRequest = () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ action: 'update' }))
      }
    }

    // Set up interval to send update requests every 10 seconds
    const intervalId = setInterval(sendUpdateRequest, 10000)

    return () => {
      clearInterval(intervalId)
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [])

  const formatXAxis = (tickItem: string) => {
    return tickItem.split(':').slice(0, 2).join(':')
  }

  const formatYAxis = (value: number) => {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  const calculatePriceDomain = () => {
    if (data.length === 0) return [0, 100000] // Default range if no data
    const prices = data.map(d => d.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    return [minPrice * 0.999, maxPrice * 1.001] // 0.1% padding on both sides
  }

  return (
    <div className="w-full h-[500px] bg-gray-900 p-4">
      <h2 className="text-white text-2xl mb-4">Live BTCUSDT Chart</h2>
      <p className="text-white mb-2">Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="timestamp"
            stroke="#888"
            tick={{ fill: '#888' }}
            tickFormatter={formatXAxis}
          />
          <YAxis yAxisId="left" stroke="#888" tick={{ fill: '#888' }} tickFormatter={formatYAxis} />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#888"
            tick={{ fill: '#888' }}
            tickFormatter={formatYAxis}
            domain={calculatePriceDomain()}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#333', border: 'none' }}
            labelStyle={{ color: '#888' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number) =>
              value.toLocaleString('en-US', { maximumFractionDigits: 2 })
            }
          />
          <Legend />
          <Bar dataKey="totalBuyValue" fill="#00ff00" yAxisId="left" name="Total Buy Value" />
          <Bar dataKey="totalSellValue" fill="#ff0000" yAxisId="left" name="Total Sell Value" />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#0000ff"
            dot={false}
            strokeWidth={2}
            yAxisId="right"
            name="Price"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
