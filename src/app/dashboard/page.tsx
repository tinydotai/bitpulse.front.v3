import { BigTransactionsTableComponent } from '@/components/big-transactions-table'
import LiveCryptoLineChartComponent from '@/components/live-crypto-line-chart'

export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <LiveCryptoLineChartComponent cryptoPair="ETHUSDT" />
      <BigTransactionsTableComponent />
    </div>
  )
}
