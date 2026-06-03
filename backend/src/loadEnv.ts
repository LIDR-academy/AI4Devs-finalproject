import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
dotenv.config({ path: path.join(repoRoot, '.env'), override: true })
