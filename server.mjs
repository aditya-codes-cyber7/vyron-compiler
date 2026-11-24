
import express from 'express'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const PORT = process.env.PORT || 5000

const API = (
  process.env.JUDGE0_API_URL ||
  'https://ce.judge0.com'
).replace(/\/+$/, '')

// Security configuration

app.disable('x-powered-by')
app.use('/api', helmet())
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store')
  next()
})

// Rate limiting

const compilerLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-8',
  legacyHeaders: false,

  message: {
    error: 'Too many requests. Please try again later.'
  }
})

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: () => 'compiler-global',
  standardHeaders: false,
  legacyHeaders: false,

  message: {
    error: 'Compiler request limit reached.'
  }
})

app.use('/api/run', compilerLimiter)
app.use('/api/run', globalLimiter)
app.use(express.json({ limit: '128kb' }))

// Programming languages

const languageIds = {
  c: 103,
  cpp: 105,
  python: 100,
  java: 91,
  javascript: 102,
  csharp: 51,
  go: 107,
  rust: 108,
  php: 98,
  ruby: 72,
  kotlin: 111,
  swift: 83,
  typescript: 101,
  lua: 64,
  r: 99
}

// Base64 utilities

const encode = text =>
  Buffer.from(text, 'utf8').toString('base64')

const decode = text =>
  text
    ? Buffer.from(text, 'base64').toString('utf8')
    : ''

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms))

// Server capacity protection

let activeExecutions = 0

const MAX_EXECUTIONS = 3

// Backend health check

app.get('/api/health', (req, res) => {

  res.json({
    status: 'online',
    name: 'VYRON Compiler',
    version: '2.2',
    languages: Object.keys(languageIds).length
  })

})

// Compiler execution API

app.post('/api/run', async (req, res) => {

  if (
  process.env.NODE_ENV === 'production' &&
  (
    !process.env.JUDGE0_API_URL ||
    !process.env.JUDGE0_API_KEY
  )
) {
  return res.status(503).json({
    error: 'Public compiler service is not configured yet.'
  })
}

  const {
    language,
    code,
    input = ''
  } = req.body || {}

  // Validate incoming data

  if (
    typeof language !== 'string' ||
    !Object.hasOwn(languageIds, language) ||
    typeof code !== 'string' ||
    typeof input !== 'string' ||
    !code.trim() ||
    code.length > 20000 ||
    input.length > 10000
  ) {
    return res.status(400).json({
      error: 'Invalid language, code or input.'
    })
  }

  // Prevent server overload

  if (activeExecutions >= MAX_EXECUTIONS) {

    return res.status(503).json({
      error: 'Compiler is busy. Please try again.'
    })

  }

  activeExecutions++

  const deadline = AbortSignal.timeout(40000)

  try {

    const headers = {
      'Content-Type': 'application/json'
    }

    // Private API authentication

    if (process.env.JUDGE0_API_KEY) {

      headers['X-Auth-Token'] =
        process.env.JUDGE0_API_KEY

    }

    // Send program to isolated compiler

    const submission = await fetch(
      `${API}/submissions?base64_encoded=true&wait=false`,
      {
        method: 'POST',
        headers,
        signal: deadline,

        body: JSON.stringify({
          language_id: languageIds[language],
          source_code: encode(code),
          stdin: encode(input),

          cpu_time_limit: 2,
          wall_time_limit: 5,
          max_file_size: 1024,
          enable_network: false
        })
      }
    )

    if (!submission.ok) {

      throw new Error(
        `Compiler service error (${submission.status})`
      )

    }

    const data = await submission.json()

    if (!data.token) {
      throw new Error('Invalid execution token.')
    }

    // Retrieve compiler result

    for (let i = 0; i < 25; i++) {

      if (deadline.aborted) break

      await sleep(1000)

      const response = await fetch(
        `${API}/submissions/${encodeURIComponent(data.token)}?base64_encoded=true&fields=stdout,stderr,compile_output,message,status,time,memory`,
        {
          headers,
          signal: deadline
        }
      )

      if (!response.ok) {

        throw new Error(
          'Unable to retrieve compiler result.'
        )

      }

      const result = await response.json()

      if (result.status && result.status.id > 2) {

        return res.json({

          output: decode(result.stdout)
            .slice(0, 50000),

          error: decode(result.stderr)
            .slice(0, 20000),

          compileOutput: decode(result.compile_output)
            .slice(0, 20000),

          message: decode(result.message)
            .slice(0, 10000),

          status: result.status.description,
          time: result.time,
          memory: result.memory

        })

      }
    }

    return res.status(504).json({
      error: 'Compiler request timed out.'
    })

  } catch (error) {

    console.error('Compiler error:', error.message)

    if (deadline.aborted) {
      return res.status(504).json({
        error: 'Compiler request timed out.'
      })
    }

    return res.status(502).json({
      error: 'Compiler service unavailable. Please try again.'
    })

  } finally {

    activeExecutions--

  }

})

// Handle invalid requests

app.use((err, req, res, next) => {

  if (res.headersSent) {
    return next(err)
  }

  if (err.type === 'entity.too.large') {

    return res.status(413).json({
      error: 'Request is too large.'
    })

  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid request format.'
    })
  }

  return res.status(500).json({
    error: 'Server error.'
  })

})

// Start local server


const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
)

app.use(
  express.static(path.join(__dirname, 'dist'))
)

app.listen(
  PORT,
  process.env.NODE_ENV === 'production'
    ? '0.0.0.0'
    : '127.0.0.1',
  () => {
    console.log('================================')
    console.log('VYRON COMPILER 2.2')
    console.log(`Server running on port ${PORT}`)
    console.log('================================')
  }
)

