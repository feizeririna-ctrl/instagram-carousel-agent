import { startBot } from './bot.js'

startBot().catch((error) => {
  console.error(error)
  process.exit(1)
})
