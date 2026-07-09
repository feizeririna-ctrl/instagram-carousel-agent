import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { Bot } from 'grammy'
import { runCodex } from './codex.js'
import { env } from './env.js'

const bot = new Bot(env.TELEGRAM_BOT_TOKEN)

const inboxDir = path.join(env.PROJECT_ROOT, 'workspace', 'inbox')
const outputDir = path.join(env.PROJECT_ROOT, 'workspace', 'output')
mkdirSync(inboxDir, { recursive: true })
mkdirSync(outputDir, { recursive: true })
writeFileSync(path.join(inboxDir, '.gitkeep'), '', { flag: 'a' })
writeFileSync(path.join(outputDir, '.gitkeep'), '', { flag: 'a' })

let queue: Promise<void> = Promise.resolve()

function splitPlainText(text: string, size = 4000): string[] {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size))
  }
  return chunks.length ? chunks : ['Done.']
}

bot.on('message:text', async (ctx) => {
  if (String(ctx.chat.id) !== env.ALLOWED_CHAT_ID) return

  queue = queue.then(async () => {
    const typing = setInterval(() => {
      ctx.replyWithChatAction('typing').catch(() => {})
    }, 4000)

    try {
      const reply = await runCodex(ctx.message.text)
      for (const chunk of splitPlainText(reply)) {
        await ctx.reply(chunk)
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error)
      await ctx.reply(`Error:\n${text.slice(0, 3500)}`)
    } finally {
      clearInterval(typing)
    }
  })

  await queue
})

export async function startBot(): Promise<void> {
  await bot.start()
  console.log('Instagram carousel Codex bot started')
}
