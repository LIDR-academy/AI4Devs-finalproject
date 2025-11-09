import { useEffect, useState } from 'react'
import { apiService } from '../services/apiService'

interface HealthStatus {
  status: string
  timestamp: string
  version?: string
  environment?: string
  database?: string
  backend?: string
  error?: string
}

const HealthCheck: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'checking',
    timestamp: new Date().toISOString()
  })

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const backendHealth = await apiService.healthCheck()
        setHealth({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          backend: backendHealth.status,
          version: backendHealth.version,
          environment: backendHealth.environment,
          database: backendHealth.database
        })
      } catch (error) {
        setHealth({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    checkHealth()
  }, [])

  // Simple JSON response for health checks
  if (health.status === 'healthy') {
    return (
      <div style={{ fontFamily: 'monospace', padding: '20px' }}>
        <h1>✅ System Health Check</h1>
        <pre>{JSON.stringify(health, null, 2)}</pre>
      </div>
    )
  }

  if (health.status === 'unhealthy') {
    return (
      <div style={{ fontFamily: 'monospace', padding: '20px', color: 'red' }}>
        <h1>❌ System Health Check</h1>
        <pre>{JSON.stringify(health, null, 2)}</pre>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'monospace', padding: '20px' }}>
      <h1>🔄 Checking System Health...</h1>
      <pre>{JSON.stringify(health, null, 2)}</pre>
    </div>
  )
}

export default HealthCheck
