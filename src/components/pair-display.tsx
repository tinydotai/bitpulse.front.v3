import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BigTransactionsTableComponent } from './big-transactions-table'
import LiveCryptoLineChartComponent from './live-crypto-line-chart'

interface PairDisplayProps {
  pair: string
}

export default function PairDisplay({ pair }: PairDisplayProps) {
  return (
    <Card className="w-full max-w-4xl mx-auto my-8">
      <CardHeader>
        <CardTitle>{pair} Pair Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <LiveCryptoLineChartComponent cryptoPair={pair} />
        <BigTransactionsTableComponent cryptoPair={pair} />
      </CardContent>
    </Card>
  )
}
