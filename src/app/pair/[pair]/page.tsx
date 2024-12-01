import PairDisplay from '@/components/pair-display'
import ChatInterface from '@/components/chat-interface'

export default function PairPage({ params }: { params: { pair: string } }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mb-4">
        <PairDisplay pair={params.pair} />
      </div>
      <ChatInterface pair={params.pair} />
    </div>
  )
}
