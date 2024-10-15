import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { BigTransactionsTableComponent } from './big-transactions-table'
import LiveCryptoLineChartComponent from './live-crypto-line-chart'

interface PairDisplayProps {
  pair: string
}

export default function PairDisplay({ pair }: PairDisplayProps) {
  return (
    <div className="w-full mx-auto my-8 space-y-8">
      <Card className="w-full">
        <LiveCryptoLineChartComponent cryptoPair={pair} />
      </Card>

      <div className="w-full">
        <BigTransactionsTableComponent cryptoPair={pair} />
      </div>
    </div>
  )
}
