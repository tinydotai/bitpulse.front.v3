import { BotEditor } from '@/components/bot-editor'

export default function BotPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Bot: {params.id}</h1>
      <BotEditor botId={params.id} />
    </div>
  )
}

