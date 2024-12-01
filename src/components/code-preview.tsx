'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodePreviewProps {
  code: string
  language?: string
}

export function CodePreview({ code, language = 'python' }: CodePreviewProps) {
  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="p-0 h-full">
        <div className="bg-zinc-950 h-full overflow-y-auto">
          <SyntaxHighlighter
            language={language}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: 'transparent',
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </CardContent>
    </Card>
  )
}
