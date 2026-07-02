import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import { openDb } from './db.js'

const app = express()
const PORT = process.env.PORT || 3001

const db = openDb(path.resolve(import.meta.dirname, 'tetris.db'))

app.use(express.json())

// One structured log line per request: method path status duration.
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`)
  })
  next()
})

// Consistent error payload shared by every failure path.
const errorBody = (code, message) => ({ error: { code, message } })

// Raised by validators; carries an HTTP status + machine code to the error middleware.
class HttpError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

const DIFFICULTIES = ['easy', 'medium', 'hard']

function normalizeUsername(value) {
  const name = typeof value === 'string' ? value.trim() : ''
  if (name.length === 0) return 'ANON'
  if (name.length > 20) throw new HttpError(400, 'VALIDATION_ERROR', 'username must be 1-20 characters')
  return name
}

function nonNegativeInt(value, field) {
  if (!Number.isInteger(value) || value < 0) {
    throw new HttpError(400, 'VALIDATION_ERROR', `${field} must be a non-negative integer`)
  }
  return value
}

function requireDifficulty(value) {
  if (!DIFFICULTIES.includes(value)) {
    throw new HttpError(400, 'VALIDATION_ERROR', `difficulty must be one of ${DIFFICULTIES.join(', ')}`)
  }
  return value
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/scores', (req, res) => {
  const raw = req.query.difficulty ?? 'all'
  const difficulty = raw === 'all' || DIFFICULTIES.includes(raw) ? raw : 'all'
  const parsed = Number.parseInt(req.query.limit, 10)
  const limit = Math.min(100, Math.max(1, Number.isNaN(parsed) ? 20 : parsed))
  res.json(db.topScores({ difficulty, limit }))
})

app.post('/api/scores', (req, res) => {
  const body = req.body ?? {}
  const username = normalizeUsername(body.username)
  const score = nonNegativeInt(body.score, 'score')
  const level = nonNegativeInt(body.level, 'level')
  const lines = nonNegativeInt(body.lines, 'lines')
  const difficulty = requireDifficulty(body.difficulty)

  const created_at = new Date().toISOString()
  const id = db.insertScore({ username, score, level, lines, difficulty, created_at })
  const rank = db.rankFor({ score, difficulty })
  res.status(201).json({ id, rank })
})

// In production, serve the built client and let the SPA handle client routes.
const distDir = path.resolve(import.meta.dirname, '../client/dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distDir, 'index.html'))
    }
    next()
  })
}

// Unknown API routes get the consistent error shape, not the SPA fallback.
app.use('/api', (_req, res) => {
  res.status(404).json(errorBody('NOT_FOUND', 'resource not found'))
})

// Central error handler (registered last). Never leaks internals to the client.
app.use((err, req, res, _next) => {
  const status = err.status ?? 500
  if (status >= 500) {
    console.error(`ERROR ${req.method} ${req.originalUrl} ${err.message}\n${err.stack}`)
    return res.status(500).json(errorBody('INTERNAL_ERROR', 'internal server error'))
  }
  res.status(status).json(errorBody(err.code ?? 'BAD_REQUEST', err.message))
})

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})
