import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const holdings = [
  { name: 'Applied Industrial Technologies, Inc.', ticker: 'AIT', firstActivity: '05/10/2022', value: 6563.84, allocation: 54.93, change: 2989.76, performance: 83.73 },
  { name: 'ASML Holding N.V.', ticker: 'ASML.AS', firstActivity: '24/05/2023', value: 5385.21, allocation: 45.07, change: 1129.79, performance: 26.58 },
  { name: 'USD (Cash)', ticker: 'USD', firstActivity: '-', value: 0.00, allocation: 0.00, change: 0.00, performance: 0.00 },
]

const portfolioData = [
  { date: '2023-01', value: 4000 },
  { date: '2023-06', value: 8000 },
  { date: '2023-12', value: 10000 },
  { date: '2024-06', value: 12000 },
  { date: '2024-12', value: 13000 },
]

export default function WealthManagementDashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Wealth Management Dashboard 2</h1>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Evolution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={portfolioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
 

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>First Activity</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Allocation</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((holding) => (
                <TableRow key={holding.ticker}>
                  <TableCell>
                    <div>{holding.name}</div>
                    <div className="text-sm text-muted-foreground">{holding.ticker}</div>
                  </TableCell>
                  <TableCell>{holding.firstActivity}</TableCell>
                  <TableCell>${holding.value.toFixed(2)}</TableCell>
                  <TableCell>{holding.allocation.toFixed(2)}%</TableCell>
                  <TableCell className={holding.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${holding.change.toFixed(2)}
                  </TableCell>
                  <TableCell className={holding.performance >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {holding.performance.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

   </div>
  )
}