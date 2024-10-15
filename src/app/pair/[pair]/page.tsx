import PairDisplay from '@/components/pair-display'

export default function PairPage({ params }: { params: { pair: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{params.pair}</h1>
      <PairDisplay pair={params.pair} />
    </div>
  )
}
