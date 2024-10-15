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

export default function Component() {
  const [data, setData] = useState<DataPoint[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)

  const addDataPoint = useCallback((newDataPoint: DataPoint) => {
    setData(prevData => {
      const newData = [...prevData, newDataPoint].slice(-60)
      return newData
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
    return tickItem
  }, [])

  return (
    <div className="w-full h-[500px] bg-[#0f172a] p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Live BTCUSDT Chart</h2>
      <p className="mb-2 text-white">
        Status:{' '}
        <span className={isConnected ? 'text-green-500' : 'text-red-500'}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </p>
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
