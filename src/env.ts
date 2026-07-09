import dotenv from 'dotenv'

dotenv.config()

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is missing`)
  return value
}

export const env = {
  TELEGRAM_BOT_TOKEN: required('TELEGRAM_BOT_TOKEN'),
  ALLOWED_CHAT_ID: required('ALLOWED_CHAT_ID'),
  PROJECT_ROOT: process.cwd()
}
