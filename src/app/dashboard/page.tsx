import PairDisplay from '@/components/pair-display'

export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <PairDisplay pair="ETHUSDT" />
    </div>
  )
}
