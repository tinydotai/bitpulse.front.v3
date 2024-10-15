'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const cryptoPairs = ['BTCUSDT', 'ETHUSDT', 'DOGEUSDT', 'FLOKIUSDT']

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPairs = cryptoPairs.filter(pair =>
    pair.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Crypto Pairs Dashboard</h1>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search crypto pairs..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPairs.map(pair => (
          <Card key={pair} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>{pair}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/pair/${pair}`}
                className="text-blue-500 hover:text-blue-700 transition-colors duration-300"
              >
                View Details
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
