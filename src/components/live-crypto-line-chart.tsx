'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  createChart,
  ColorType,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  Time,
  AreaData,
  HistogramData,
} from 'lightweight-charts'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WS_DOMAIN } from '@/app/config'

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
  source: string
}

interface ChartData {
  time: Time
  price: number
  buyVolume: number
  sellVolume: number
}

const INTERVALS = [1, 10, 30, 60]
const DEFAULT_INTERVAL = 60

export default function LiveCryptoLineChartComponent({ cryptoPair, source }: LiveCryptoChartProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasData, setHasData] = useState(false)
  const isInitialDataFetch = useRef(true)
  const intervalRef = useRef(DEFAULT_INTERVAL)
  const [intervalState, setIntervalState] = useState(DEFAULT_INTERVAL)
  const ws = useRef<WebSocket | null>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chart = useRef<IChartApi | null>(null)
  const areaSeries = useRef<ISeriesApi<'Area'> | null>(null)
  const buyVolumeSeries = useRef<ISeriesApi<'Histogram'> | null>(null)
  const sellVolumeSeries = useRef<ISeriesApi<'Histogram'> | null>(null)
  const pingInterval = useRef<NodeJS.Timeout | null>(null)
  const pingTimeout = useRef<NodeJS.Timeout | null>(null)
  const currentSource = useRef(source)
  const [timezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const lastTimeRef = useRef<number | null>(null)

  const formatToChartData = useCallback((dataPoint: WebSocketMessage): ChartData => {
    const time = Math.floor(new Date(dataPoint.timestamp).getTime() / 1000) as Time
    return {
      time,
      price: dataPoint.avg_price,
      buyVolume: dataPoint.buy_total_value,
      sellVolume: dataPoint.sell_total_value,
    }
  }, [])

  const addDataPoint = useCallback(
    (newDataPoint: WebSocketMessage) => {
      const formattedData = formatToChartData(newDataPoint)
      const currentTime = Number(formattedData.time)

      // Skip if this data point is older than our last processed time
      if (lastTimeRef.current !== null && currentTime <= lastTimeRef.current) {
        return
      }

      try {
        if (areaSeries.current) {
          areaSeries.current.update({
            time: formattedData.time,
            value: formattedData.price,
          } as AreaData<Time>)
        }

        if (buyVolumeSeries.current) {
          buyVolumeSeries.current.update({
            time: formattedData.time,
            value: formattedData.buyVolume,
          } as HistogramData<Time>)
        }

        if (sellVolumeSeries.current) {
          sellVolumeSeries.current.update({
            time: formattedData.time,
            value: formattedData.sellVolume,
          } as HistogramData<Time>)
        }

        lastTimeRef.current = currentTime
        setIsLoading(false)
        isInitialDataFetch.current = false
        setHasData(true)
      } catch (error) {
        console.warn('Error updating chart data:', error)
      }
    },
    [formatToChartData]
  )

  const clearChartData = useCallback(() => {
    if (
      !chart.current ||
      !areaSeries.current ||
      !buyVolumeSeries.current ||
      !sellVolumeSeries.current
    ) {
      return
    }

    lastTimeRef.current = null // Reset the last time reference
    areaSeries.current.setData([])
    buyVolumeSeries.current.setData([])
    sellVolumeSeries.current.setData([])
    setHasData(false)
    setIsLoading(true)
  }, [])

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

    const queryParams = [
      currentSource.current !== 'all' ? `source=${currentSource.current}` : null,
      `timezone_str=${timezone}`,
    ]
      .filter(Boolean)
      .join('&')

    const baseUrl = `${WS_DOMAIN}/stats/ws/transaction_stats/${cryptoPair}/${intervalRef.current}`
    const fullUrl = queryParams ? `${baseUrl}?${queryParams}` : baseUrl

    ws.current = new WebSocket(fullUrl)

    ws.current.onopen = () => {
      setIsConnected(true)
      heartbeat()
    }

    ws.current.onmessage = event => {
      const message = JSON.parse(event.data)
      if (message.type === 'pong') {
        heartbeat()
      } else if (Array.isArray(message) && message.length > 0) {
        // Sort messages by timestamp before processing
        const sortedMessages = [...message].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        sortedMessages.forEach((item: WebSocketMessage) => {
          addDataPoint(item)
        })
      }
    }

    ws.current.onclose = () => {
      setIsConnected(false)
    }

    ws.current.onerror = () => {
      setIsConnected(false)
      setIsLoading(false)
      isInitialDataFetch.current = false
    }

    // Set a timeout for loading state
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false)
      isInitialDataFetch.current = false
    }, 10000)

    return () => clearTimeout(loadingTimeout)
  }, [cryptoPair, heartbeat, addDataPoint, timezone])

  const initChart = useCallback(() => {
    if (!chartContainerRef.current) return

    chart.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#888888',
      },
      grid: {
        vertLines: { color: '#2d3748' },
        horzLines: { color: '#2d3748' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#2d3748',
        visible: true,
      },
      leftPriceScale: {
        borderColor: '#2d3748',
        visible: true,
      },
      timeScale: {
        borderColor: '#2d3748',
        timeVisible: true,
        secondsVisible: true,
      },
    })

    areaSeries.current = chart.current.addAreaSeries({
      topColor: 'rgba(66, 153, 225, 0.56)',
      bottomColor: 'rgba(66, 153, 225, 0.04)',
      lineColor: 'rgba(66, 153, 225, 1)',
      lineWidth: 2,
      priceScaleId: 'right',
    })

    buyVolumeSeries.current = chart.current.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'left',
    })

    sellVolumeSeries.current = chart.current.addHistogramSeries({
      color: '#ef5350',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'left',
    })

    if (areaSeries.current) {
      areaSeries.current.priceScale().applyOptions({
        scaleMargins: {
          top: 0.1,
          bottom: 0.4,
        },
      })
    }

    if (buyVolumeSeries.current) {
      buyVolumeSeries.current.priceScale().applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
      })
    }

    if (sellVolumeSeries.current) {
      sellVolumeSeries.current.priceScale().applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
      })
    }

    chart.current.timeScale().fitContent()
  }, [])

  const handleIntervalChange = (newInterval: string) => {
    const parsedInterval = parseInt(newInterval)
    if (INTERVALS.includes(parsedInterval)) {
      intervalRef.current = parsedInterval
      setIntervalState(parsedInterval)
      setIsLoading(true) // Set loading state when changing interval
      clearChartData()
      connectWebSocket()
    }
  }

  useEffect(() => {
    initChart()
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
      if (chart.current) chart.current.remove()
    }
  }, [connectWebSocket, initChart])

  return (
    <Card className="w-full bg-background">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold">Buy/Sell Volumes</span>
            <Select value={intervalState.toString()} onValueChange={handleIntervalChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                {INTERVALS.map(i => (
                  <SelectItem key={i} value={i.toString()}>
                    {i} second{i !== 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
        <div className="mb-4">
          <div className="flex items-center justify-end space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#26a69a] rounded-sm mr-2" />
              <span>Total Buy Value</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#ef5350] rounded-sm mr-2" />
              <span>Total Sell Value</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#4299e1] rounded-sm mr-2" />
              <span>Price</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <div ref={chartContainerRef} className="w-full h-[420px]" />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && !hasData && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
