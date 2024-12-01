import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Trade {
  id: string
  pair: string
  type: 'buy' | 'sell'
  amount: number
  price: number
  timestamp: string
}

export function TradingHistory() {
  // In a real application, you would fetch this data from your API
  const trades: Trade[] = [
    { id: '1', pair: 'BTC/USDT', type: 'buy', amount: 0.1, price: 30000, timestamp: '2023-06-01T10:00:00Z' },
    { id: '2', pair: 'ETH/USDT', type: 'sell', amount: 1.5, price: 1800, timestamp: '2023-06-01T11:30:00Z' },
    { id: '3', pair: 'BTC/USDT', type: 'sell', amount: 0.05, price: 31000, timestamp: '2023-06-02T09:15:00Z' },
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pair</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Timestamp</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trades.map((trade) => (
          <TableRow key={trade.id}>
            <TableCell>{trade.pair}</TableCell>
            <TableCell className={trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
              {trade.type.toUpperCase()}
            </TableCell>
            <TableCell>{trade.amount}</TableCell>
            <TableCell>${trade.price.toFixed(2)}</TableCell>
            <TableCell>{new Date(trade.timestamp).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

