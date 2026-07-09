# Instagram Carousel Agent

Telegram bridge for a Codex-powered assistant that helps create Instagram carousel content.

## Architecture

```text
Telegram -> grammY -> codex exec -> AGENTS.md
```

Each Telegram message starts a fresh `codex exec` run. Persistence comes from files like `AGENTS.md`, `memory/*.md`, and Obsidian notes when available.

## Setup

Create a local `.env` file from the template:

```bash
cp .env.example .env
```

Fill in:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
ALLOWED_CHAT_ID=your_chat_id
```

Install, build, and start:

```bash
npm install
npm run build
pm2 start npm --name instagram-carousel-agent -- start
pm2 save
pm2 startup
pm2 list
```

## Verification

1. Send a plain text message to the Telegram bot.
2. The bot should answer.
3. `pm2 list` should show `instagram-carousel-agent` as `online`.

## Notes

- Requires Node.js 22+.
- Requires Codex CLI installed and authenticated on the server.
- `.env` is intentionally ignored by git.
