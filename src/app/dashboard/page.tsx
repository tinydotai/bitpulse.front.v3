// import { BigTransactionsTableComponent } from '@/components/big-transactions-table'
import { BigTransactionsTableComponent } from '@/components/big-transactions-table'

export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <BigTransactionsTableComponent />
      {/* <TransactionStatsChart /> */}
    </div>
  )
}
