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

type DataPoint = {
  timestamp: string
  price: number
  totalBuyValue: number
  totalSellValue: number
}

export default function LiveBTCUSDTChart() {
  const [data, setData] = useState<DataPoint[]>([])
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 60 })
  const [isConnected, setIsConnected] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const ws = useRef<WebSocket | null>(null)
  const chartRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const addDataPoint = useCallback(
    (newDataPoint: DataPoint) => {
      setData(prevData => {
        const newData = [...prevData, newDataPoint]
        if (newData.length > 300) {
          newData.shift()
        }
        return newData
      })
      setVisibleRange(prevRange => {
        const dataLength = data.length + 1 // +1 for the new data point
        if (prevRange.end === dataLength - 1 || prevRange.end === 300) {
          return {
            start: Math.max(0, Math.min(dataLength - 60, prevRange.start + 1)),
            end: Math.min(dataLength, 300),
          }
        }
        return prevRange
      })
    },
    [data.length]
  )

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/stats/ws/transaction_stats/BTCUSDT')

    ws.current.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    }

    ws.current.onmessage = event => {
      const newDataArray = JSON.parse(event.data)
      if (Array.isArray(newDataArray) && newDataArray.length > 0) {
        newDataArray.forEach((item: any) => {
          const newDataPoint = {
            timestamp: new Date(item.timestamp).toLocaleTimeString(),
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

    const sendUpdateRequest = () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ action: 'update' }))
      }
    }

    const intervalId = setInterval(sendUpdateRequest, 10000)

    return () => {
      clearInterval(intervalId)
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [addDataPoint])

  const formatXAxis = useCallback((tickItem: string) => {
    return tickItem.split(':').slice(0, 2).join(':')
  }, [])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setStartX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const dx = e.clientX - startX
    const scrollAmount = Math.round(dx / 10)

    setVisibleRange(prevRange => {
      const newStart = Math.max(0, Math.min(data.length - 60, prevRange.start - scrollAmount))
      return {
        start: newStart,
        end: Math.min(newStart + 60, data.length),
      }
    })

    setStartX(e.clientX)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const visibleData = data.slice(visibleRange.start, visibleRange.end)

  return (
    <div className="w-full h-[500px] bg-[#0f172a] p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Live BTCUSDT Chart</h2>
      <p className="mb-2 text-white">
        Status:{' '}
        <span className={isConnected ? 'text-green-500' : 'text-red-500'}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </p>
      <div
        className="w-full h-[420px] select-none cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        ref={containerRef}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={visibleData}
            ref={chartRef}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis
              dataKey="timestamp"
              stroke="#888"
              tick={{ fill: '#888' }}
              tickFormatter={formatXAxis}
              minTickGap={50}
            />
            <YAxis yAxisId="left" stroke="#888" tick={{ fill: '#888' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#888" tick={{ fill: '#888' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #2d3748' }}
              labelStyle={{ color: '#888' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend />
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