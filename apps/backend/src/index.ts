import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())

// Routes
app.get('/', (c) => {
  return c.json({
    message: 'Hello from Hono!',
    status: 'ok'
  })
})

app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

// Start the server
const port = 3001
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
}) 