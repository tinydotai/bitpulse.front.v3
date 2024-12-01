import PairDisplay from '@/components/pair-display'
import ChatInterface from '@/components/chat-interface'

export default function PairPage({ params }: { params: { pair: string } }) {
  return (
    <div className="p-8">
      <PairDisplay pair={params.pair} />
      <ChatInterface pair={params.pair} />
    </div>
  )
}

