'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Editor from '@monaco-editor/react'
import { Rocket } from 'lucide-react'

export default function DeployPage() {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
    try {
      // Implement your deployment logic here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated delay
      console.log('Deploying code:', code)
      alert('Code deployed successfully!') // Replace with actual deployment logic
    } catch (error) {
      console.error('Deployment error:', error)
      alert('Failed to deploy code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Deploy Your Code</h1>
          <Button
            onClick={handleDeploy}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Rocket className="w-4 h-4 mr-2" />
            {isLoading ? 'Deploying...' : 'Deploy Code'}
          </Button>
        </div>
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <Editor
            height="70vh"
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
      </div>
    </div>
  )
}

