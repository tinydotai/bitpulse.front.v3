import { BotList } from '@/components/bot-list'

export default function BotsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Bot Management</h1>
      <BotList />
    </div>
  )
}

