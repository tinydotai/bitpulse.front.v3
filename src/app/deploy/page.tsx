'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Editor from '@monaco-editor/react'
import { Rocket, Server, Upload, TestTube, Key, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import TradingHistory from '@/components/trading-history'
import { v4 as uuidv4 } from 'uuid'

const deploySteps = [
  { icon: Server, text: 'Initializing servers' },
  { icon: Upload, text: 'Uploading code to server' },
  { icon: TestTube, text: 'Testing code status' },
  { icon: Key, text: 'Verifying API keys' },
]

const tradingPairs = ['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'XRP/USDT', 'DOT/USDT']

export default function DeployPage() {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'running' | 'error'>('idle')
  const [selectedPair, setSelectedPair] = useState(tradingPairs[0])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const codeParam = urlParams.get('code')
    if (codeParam) {
      try {
        setCode(decodeURIComponent(codeParam))
      } catch (error) {
        console.error('Error decoding URL parameter:', error)
        setCode('Error: Unable to decode the code parameter from the URL.')
      }
    }
  }, [])

  const handleDeploy = async () => {
    setIsLoading(true)
    setCurrentStep(0)
    try {
      for (let i = 0; i < deploySteps.length; i++) {
        setCurrentStep(i)
        await new Promise(resolve => setTimeout(resolve, 1500)) // Simulated delay for each step
      }

      const botId = uuidv4() // Generate a unique bot ID
      const response = await fetch('http://localhost:8000/bot/create', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bot_id: botId,
          code: code,
          pair: selectedPair,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to deploy bot')
      }

      const data = await response.json()
      console.log('Deployment response:', data)
      setDeploymentStatus('running')
    } catch (error) {
      console.error('Deployment error:', error)
      setDeploymentStatus('error')
    } finally {
      setIsLoading(false)
      setCurrentStep(-1)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold">Deploy Your Code</h1>
          <div className="flex items-center space-x-4">
            <Select value={selectedPair} onValueChange={setSelectedPair}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select pair" />
              </SelectTrigger>
              <SelectContent>
                {tradingPairs.map((pair) => (
                  <SelectItem key={pair} value={pair}>
                    {pair}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge
              variant={deploymentStatus === 'running' ? 'default' : deploymentStatus === 'error' ? 'destructive' : 'secondary'}
              className="text-sm"
            >
              Status: {deploymentStatus}
            </Badge>
            <Button
              onClick={handleDeploy}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Rocket className="w-4 h-4 mr-2" />
              {isLoading ? 'Deploying...' : 'Deploy Code'}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <Editor
            height="50vh"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              tabSize: 2,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
            }}
            loading={
              <div className="h-full w-full flex items-center justify-center text-zinc-500">
                Loading editor...
              </div>
            }
          />
        </div>

        {isLoading && (
          <div className="bg-zinc-900 rounded-lg p-4 space-y-4" role="status" aria-live="polite">
            {deploySteps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center space-x-3 transition-opacity duration-300",
                  index > currentStep && "opacity-50"
                )}
              >
                <step.icon className={cn(
                  "w-6 h-6",
                  index <= currentStep ? "text-green-500" : "text-zinc-500"
                )} />
                <span className={cn(
                  "text-sm",
                  index === currentStep && "font-semibold text-green-500"
                )}>
                  {step.text}
                </span>
                {index === currentStep && (
                  <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Trading History</h2>
            <History className="w-5 h-5 text-zinc-400" />
          </div>
          <TradingHistory />
        </div>
      </div>
    </div>
  )
}

