import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { env } from './env.js'

export async function runCodex(message: string): Promise<string> {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'instagram-carousel-agent-'))
  const outputFile = path.join(tempDir, 'last-message.txt')
  const timeoutMs = 5 * 60 * 1000

  return new Promise((resolve, reject) => {
    let finished = false
    const child = spawn(
      'codex',
      [
        'exec',
        '--skip-git-repo-check',
        '--full-auto',
        '-C',
        env.PROJECT_ROOT,
        '-o',
        outputFile,
        message
      ],
      {
        cwd: env.PROJECT_ROOT,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe']
      }
    )

    let stderr = ''
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    const timer = setTimeout(() => {
      if (finished) return
      finished = true
      child.kill('SIGTERM')
      rmSync(tempDir, { recursive: true, force: true })
      reject(new Error('Codex timeout: task exceeded 5 minutes'))
    }, timeoutMs)

    child.on('error', (error) => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      rmSync(tempDir, { recursive: true, force: true })
      reject(error)
    })

    child.on('close', (code) => {
      if (finished) return
      finished = true
      clearTimeout(timer)

      try {
        const reply = readFileSync(outputFile, 'utf8').trim()
        rmSync(tempDir, { recursive: true, force: true })
        if (reply) {
          resolve(reply)
          return
        }
      } catch {
        // Fall through to stderr handling below.
      }

      rmSync(tempDir, { recursive: true, force: true })

      if (code === 0) {
        resolve('Done.')
        return
      }

      const message = stderr.trim() || `Codex exited with code ${code ?? 'unknown'}`
      reject(new Error(message))
    })
  })
}
