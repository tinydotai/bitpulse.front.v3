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
  const chartRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - chartRef.current!.offsetLeft)
    setScrollLeft(chartRef.current!.scrollLeft)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - chartRef.current!.offsetLeft
    const walk = (x - startX) * 3
    chartRef.current!.scrollLeft = scrollLeft - walk
  }

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
          return updatedData.slice(-300) // Keep last 300 data points for scrolling
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
  }, [])

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.scrollLeft = chartRef.current.scrollWidth
    }
  }, [data])

  const formatXAxis = (tickItem: string) => {
    return tickItem.split(':').slice(0, 2).join(':')
  }

  const formatYAxis = (value: number) => {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  const calculatePriceDomain = () => {
    if (data.length === 0) return [0, 100000]
    const prices = data.map(d => d.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    return [minPrice * 0.999, maxPrice * 1.001]
  }

  return (
    <div className="w-full h-[500px] bg-[#0f172a] p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Live BTCUSDT Chart</h2>
      <p className="mb-2 text-white">
        Status:{' '}
        <span className={isConnected ? 'text-green-500' : 'text-red-500'}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </p>
      <div className="relative h-[420px]">
        <div
          ref={chartRef}
          className="w-full h-[380px] overflow-x-scroll scrollbar-hide"
          style={{
            overscrollBehaviorX: 'contain',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div
            style={{
              width: `${Math.max(100, data.length * 3)}%`,
              height: '100%',
              minWidth: '100%',
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="timestamp" tick={{ fill: '#a0aec0' }} tickFormatter={formatXAxis} />
                <YAxis yAxisId="left" tick={{ fill: '#a0aec0' }} tickFormatter={formatYAxis} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#a0aec0' }}
                  tickFormatter={formatYAxis}
                  domain={calculatePriceDomain()}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #2d3748' }}
                  labelStyle={{ color: '#a0aec0' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value: number) =>
                    value.toLocaleString('en-US', { maximumFractionDigits: 2 })
                  }
                />
                <Bar dataKey="totalBuyValue" fill="#48bb78" yAxisId="left" name="Total Buy Value" />
                <Bar
                  dataKey="totalSellValue"
                  fill="#f56565"
                  yAxisId="left"
                  name="Total Sell Value"
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#4299e1"
                  dot={false}
                  strokeWidth={2}
                  yAxisId="right"
                  name="Price"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-[#0f172a] flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#48bb78] mr-2"></div>
              <span className="text-white text-sm">Total Buy Value</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#f56565] mr-2"></div>
              <span className="text-white text-sm">Total Sell Value</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#4299e1] mr-2"></div>
              <span className="text-white text-sm">Price</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
