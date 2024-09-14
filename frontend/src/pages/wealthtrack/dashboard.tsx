import React from 'react'

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
      <h1 className="text-3xl font-bold mb-6">Wealth Management Dashboard</h1>
      
   </div>
  )
}