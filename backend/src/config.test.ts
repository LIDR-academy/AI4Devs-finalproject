import { afterEach, describe, expect, it, vi } from 'vitest'
import { parseConfig } from './config'

const VALID_DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'

describe('parseConfig', () => {
  const originalEnv = { ...process.env }
  let exitMock: ReturnType<typeof vi.spyOn>
  let errorMock: ReturnType<typeof vi.spyOn>

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  function mockExit() {
    exitMock = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called')
    }) as typeof process.exit)
    errorMock = vi.spyOn(console, 'error').mockImplementation(() => {})
  }

  describe('happy path', () => {
    it('applies defaults when only DATABASE_URL is set', () => {
      const result = parseConfig({ DATABASE_URL: VALID_DATABASE_URL })

      expect(result).toEqual({
        databaseUrl: VALID_DATABASE_URL,
        apiPort: 3001,
        corsOrigin: 'http://localhost:5173',
        nodeEnv: 'development',
      })
    })
  })

  describe('DATABASE_URL required', () => {
    it('exits with message when DATABASE_URL is missing', () => {
      mockExit()

      expect(() => parseConfig({})).toThrow('process.exit called')
      expect(exitMock).toHaveBeenCalledWith(1)
      expect(errorMock).toHaveBeenCalledWith(
        'Variable obligatoria DATABASE_URL no definida. Ver .env.example'
      )
    })

    it('exits with message when DATABASE_URL is empty', () => {
      mockExit()

      expect(() => parseConfig({ DATABASE_URL: '' })).toThrow('process.exit called')
      expect(exitMock).toHaveBeenCalledWith(1)
      expect(errorMock).toHaveBeenCalledWith(
        expect.stringContaining('.env.example')
      )
    })
  })

  describe('NODE_ENV enum', () => {
    it('accepts production', () => {
      const result = parseConfig({
        DATABASE_URL: VALID_DATABASE_URL,
        NODE_ENV: 'production',
      })

      expect(result.nodeEnv).toBe('production')
    })

    it('rejects invalid NODE_ENV values', () => {
      mockExit()

      expect(() =>
        parseConfig({
          DATABASE_URL: VALID_DATABASE_URL,
          NODE_ENV: 'staging',
        })
      ).toThrow('process.exit called')
      expect(exitMock).toHaveBeenCalledWith(1)
    })
  })
})
