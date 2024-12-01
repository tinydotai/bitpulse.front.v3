'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatInterface({ pair }: { pair: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [latestCode, setLatestCode] = useState('')
  const [isCodeLoading, setIsCodeLoading] = useState(false)

  useEffect(() => {
    // Set initial message about data limitations
    setMessages([
      {
        role: 'assistant',
        content: `Note: I can only generate trading strategies based on the data available on this dashboard, which includes:
- Current prices
- All-time high/low
- Market data
- Supply information`,
      },
    ])
  }, [])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsCodeLoading(true)

    try {
      const response = await fetch('https://bitpulse.ge/generate/generate-trading-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          prompt: input,
          symbol: pair,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate code')
      }

      const data = await response.json()
      const codeContent = data.code[0].text.replace(/\`\`\`python\n|\n\`\`\`/g, '')
      const assistantMessage: Message = {
        role: 'assistant',
        content: codeContent,
      }
      setMessages(prev => [...prev, assistantMessage])
      setLatestCode(codeContent)
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error generating the code. Please try again.',
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsCodeLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-950/30 border border-amber-900/30 text-amber-200/90 p-4 rounded-lg text-sm">
        Disclaimer: The code generated is for educational purposes only. Please review and test any
        code thoroughly before use. We are not responsible for any financial losses or other damages
        that may result from using this code.
      </div>
      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-300px)]">
        {/* Left Window - Chat */}
        <div className="bg-zinc-900/50 rounded-lg flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500/10 text-blue-200 ml-auto max-w-[80%]'
                    : 'bg-zinc-800/50 max-w-[80%]'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">
                  {message.role === 'user'
                    ? message.content
                    : index === 0
                    ? message.content
                    : 'Code generated successfully! See the preview on the right.'}
                </p>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-zinc-400">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-zinc-500"></div>
                <span>Generating response...</span>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-zinc-800">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message here..."
                onKeyPress={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-100"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
              >
                Send
              </Button>
            </div>
          </div>
        </div>

        {/* Right Window - Code Preview */}
        <div className="bg-zinc-900/50 rounded-lg overflow-hidden">
          {isCodeLoading ? (
            <div className="h-full flex items-center justify-center text-zinc-500">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></div>
              Generating code...
            </div>
          ) : latestCode ? (
            <div className="h-full overflow-y-auto">
              <SyntaxHighlighter
                language="python"
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  background: 'transparent',
                  height: '100%',
                }}
              >
                {latestCode}
              </SyntaxHighlighter>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500">
              Generated code will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
