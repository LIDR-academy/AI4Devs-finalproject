#!/usr/bin/env node
/**
 * Marca un ticket T-XX-YY como "✅ Implementado" en docs/product-backlog.md.
 * Uso (tras archivar un change OpenSpec; paso no bloqueante si falla):
 *   node scripts/openspec-mark-ticket-implemented.mjs --change t-01-01-init-monorepo
 *   node scripts/openspec-mark-ticket-implemented.mjs --ticket T-01-01
 *
 * Exit 0: actualizado o ya estaba implementado. Exit 1: error (el archivado OpenSpec sigue siendo válido).
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const BACKLOG_PATH = join(ROOT, 'docs', 'product-backlog.md')
const IMPLEMENTED = '**Estado en código:** ✅ Implementado'
const PENDING_RE = /\*\*Estado en código:\*\* (?:❌ Pendiente|🟡 Parcial)/

function parseArgs(argv) {
  let changeName = null
  let ticketId = null
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--change' && argv[i + 1]) {
      changeName = argv[++i]
    } else if (argv[i] === '--ticket' && argv[i + 1]) {
      ticketId = argv[++i].toUpperCase()
    } else if (argv[i] === '--help' || argv[i] === '-h') {
      printHelp()
      process.exit(0)
    }
  }
  return { changeName, ticketId }
}

function printHelp() {
  console.log(`Uso:
  node scripts/openspec-mark-ticket-implemented.mjs --change <change-name>
  node scripts/openspec-mark-ticket-implemented.mjs --ticket T-XX-YY`)
}

function ticketFromChangeName(changeName) {
  const m = changeName.match(/^t-(\d{2})-(\d{2})-/i)
  if (!m) return null
  return `T-${m[1]}-${m[2]}`
}

function readTicketFromProposal(changeName) {
  const candidates = [
    join(ROOT, 'openspec', 'changes', changeName, 'proposal.md'),
  ]
  const archiveDir = join(ROOT, 'openspec', 'changes', 'archive')
  if (existsSync(archiveDir)) {
    for (const entry of readdirSync(archiveDir)) {
      if (entry.endsWith(`-${changeName}`)) {
        candidates.push(join(archiveDir, entry, 'proposal.md'))
      }
    }
  }
  for (const path of candidates) {
    if (!existsSync(path)) continue
    const text = readFileSync(path, 'utf8')
    const m = text.match(/\*\*Ticket:\*\*\s*(T-\d{2}-\d{2})/i)
    if (m) return m[1].toUpperCase()
  }
  return null
}

function resolveTicketId({ changeName, ticketId }) {
  if (ticketId) return ticketId
  if (!changeName) {
    console.error('Error: indica --change <nombre> o --ticket T-XX-YY')
    printHelp()
    process.exit(1)
  }
  return readTicketFromProposal(changeName) ?? ticketFromChangeName(changeName)
}

function updateTicketBlock(content, ticketId) {
  const header = `#### ${ticketId} ·`
  const start = content.indexOf(header)
  if (start === -1) {
    console.error(`Error: no se encontró el ticket ${ticketId} en ${BACKLOG_PATH}`)
    process.exit(1)
  }
  const nextHeader = content.indexOf('\n#### T-', start + header.length)
  const end = nextHeader === -1 ? content.length : nextHeader
  const block = content.slice(start, end)

  if (block.includes(IMPLEMENTED)) {
    console.log(`OK: ${ticketId} ya estaba marcado como Implementado`)
    return { content, changed: false }
  }

  if (!PENDING_RE.test(block)) {
    console.error(
      `Error: en ${ticketId} no hay línea "**Estado en código:** ❌ Pendiente" (ni Parcial) para actualizar`,
    )
    process.exit(1)
  }

  const updatedBlock = block.replace(PENDING_RE, IMPLEMENTED)
  const newContent = content.slice(0, start) + updatedBlock + content.slice(end)
  return { content: newContent, changed: true }
}

function main() {
  const args = parseArgs(process.argv)
  const ticketId = resolveTicketId(args)
  if (!ticketId) {
    console.error(
      `Error: no se pudo resolver el ticket desde el change "${args.changeName}". Usa --ticket T-XX-YY.`,
    )
    process.exit(1)
  }

  if (!existsSync(BACKLOG_PATH)) {
    console.error(`Error: no existe ${BACKLOG_PATH}`)
    process.exit(1)
  }

  let content = readFileSync(BACKLOG_PATH, 'utf8')
  const { content: newContent, changed } = updateTicketBlock(content, ticketId)

  if (changed) {
    writeFileSync(BACKLOG_PATH, newContent, 'utf8')
    console.log(`OK: ${ticketId} → ✅ Implementado en docs/product-backlog.md`)
  }
}

main()
