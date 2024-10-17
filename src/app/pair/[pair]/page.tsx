import PairDisplay from '@/components/pair-display'

export default function PairPage({ params }: { params: { pair: string } }) {
  return (
    <div className="p-8">
      <PairDisplay pair={params.pair} />
    </div>
  )
}
