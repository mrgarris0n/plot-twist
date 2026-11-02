/// <reference types="vitest/config" />
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const METHODS = ['GET', 'HEAD', 'OPTIONS', 'POST']

/** Dev only: serve api/<name>.ts functions (as Vercel does in production) through Vite's SSR loader. */
function devApi(): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const m = /^\/api\/([A-Za-z0-9_-]+)\/?$/.exec(url.pathname)
        if (!m) return next()
        try {
          const exists = existsSync(join(server.config.root, 'api', `${m[1]}.ts`))
          const mod = exists ? await server.ssrLoadModule(`/api/${m[1]}.ts`) : null
          const method = (req.method ?? 'GET').toUpperCase()
          const handler = mod && METHODS.includes(method) && typeof mod[method] === 'function' ? (mod[method] as (r: Request) => Promise<Response> | Response) : null
          if (!handler) {
            res.statusCode = mod ? 405 : 404
            if (mod) res.setHeader('Allow', METHODS.filter((k) => typeof mod[k] === 'function').join(', '))
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: mod ? 'Method not allowed' : 'Not found' }))
            return
          }
          const headers = new Headers()
          for (const [k, v] of Object.entries(req.headers)) {
            if (typeof v === 'string') headers.set(k, v)
            else if (Array.isArray(v)) v.forEach((x) => headers.append(k, x))
          }
          const response = await handler(new Request(`http://${req.headers.host ?? 'localhost'}${req.url}`, {
            method,
            headers,
            ...(method === 'GET' || method === 'HEAD' ? {} : { body: Readable.toWeb(req) as never, duplex: 'half' }),
          } as RequestInit))
          res.statusCode = response.status
          // Headers.forEach joins repeated Set-Cookie headers into one; keep them separate.
          response.headers.forEach((value, key) => { if (key !== 'set-cookie') res.setHeader(key, value) })
          const cookies = response.headers.getSetCookie()
          if (cookies.length > 0) res.setHeader('Set-Cookie', cookies)
          if (response.body) {
            const body = Readable.fromWeb(response.body as never)
            body.on('error', (err) => {
              server.config.logger.error(String(err))
              res.end()
            })
            body.pipe(res)
          }
          else res.end()
        } catch (err) {
          server.config.logger.error(String(err))
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Function failed' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), devApi()],
  define: { __BUILD__: JSON.stringify((process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev').slice(0, 7)) },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.ts'],
  },
})
