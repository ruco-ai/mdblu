#!/usr/bin/env node
/**
 * mdblu sync — fetch templates from the mdblu GitHub repo and write them locally.
 *
 * Usage:
 *   mdblu sync <target-dir> [--templates TEMPLATE1,TEMPLATE2,...]
 *   mdblu sync <target-dir>               → lists available templates
 *   mdblu list                            → lists available templates without syncing
 *
 * Examples:
 *   npx mdblu sync ./templates --templates CODEINDEX.md,REPO.md
 *   npx mdblu sync ./templates            → lists all available templates
 *   npx mdblu list
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'

const REPO = 'ruco-ai/mdblu'
const BRANCH = 'master'
const BASE_URL = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/templates`
const API_URL = `https://api.github.com/repos/${REPO}/contents/templates?ref=${BRANCH}`

async function listAvailable() {
  const res = await fetch(API_URL, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) throw new Error(`GitHub API error ${res.status}`)
  const entries = await res.json()
  return entries
    .filter(e => e.type === 'file' && e.name.endsWith('.template'))
    .map(e => e.name.replace(/\.template$/, ''))
}

async function fetchTemplate(name) {
  const url = `${BASE_URL}/${name}.template`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${name}: HTTP ${res.status}`)
  return res.text()
}

const args = process.argv.slice(2)
const subcommand = args[0]

if (subcommand === 'list') {
  const available = await listAvailable()
  console.log('Available mdblu templates:')
  for (const name of available) console.log(`  ${name}`)
  process.exit(0)
}

if (subcommand !== 'sync') {
  console.error('Usage: mdblu sync <target-dir> [--templates T1,T2,...]\n       mdblu list')
  process.exit(1)
}

const targetDir = args[1]
if (!targetDir) {
  console.error('Usage: mdblu sync <target-dir> [--templates T1,T2,...]')
  process.exit(1)
}

const templatesIdx = args.indexOf('--templates')
const requestedNames = templatesIdx >= 0
  ? args[templatesIdx + 1]?.split(',').map(s => s.trim()).filter(Boolean)
  : null

// If no --templates given, just list what's available
if (!requestedNames) {
  const available = await listAvailable()
  console.log(`No --templates specified. Available templates in mdblu:\n`)
  for (const name of available) console.log(`  ${name}`)
  console.log(`\nExample:\n  npx mdblu sync ${targetDir} --templates ${available.slice(0, 2).join(',')}`)
  process.exit(0)
}

const targetPath = resolve(targetDir)
if (!existsSync(targetPath)) {
  mkdirSync(targetPath, { recursive: true })
}

let synced = 0
let failed = 0

for (const name of requestedNames) {
  try {
    const content = await fetchTemplate(name)
    const outPath = join(targetPath, `${name}.template`)
    writeFileSync(outPath, content, 'utf8')
    console.log(`✓  ${name}.template`)
    synced++
  } catch (err) {
    console.error(`✗  ${name}: ${err.message}`)
    failed++
  }
}

console.log(`\n${synced} synced${failed > 0 ? `, ${failed} failed` : ''} → ${targetPath}`)
if (failed > 0) process.exit(1)
