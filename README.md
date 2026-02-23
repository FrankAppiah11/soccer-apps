# SubManager — Fair Soccer Substitutions

SubManager is a mobile-first web application that manages player substitutions in pickup soccer games. It calculates optimal rotation schedules so every player gets equal playing time, removing the guesswork and arguments from casual matches.

## What It Does

In pickup soccer, indoor leagues, and casual matches, managing substitutions fairly is a constant headache. SubManager solves this by:

- **Tracking playing time** for every player with a live match clock
- **Auto-calculating rotation intervals** based on squad size and game length
- **Alerting you when it's time to substitute** with visual cues on player cards
- **Protecting goalkeepers** from being subbed out (unless injured)
- **Handling injuries** with one-tap replacement from the bench
- **Supporting undo** if a substitution was made by mistake

## Screens

### Setup

Configure the match before it starts:

- **Competition type** — 3v3, 5v5, 6v6 (default), or 11v11
- **Match duration** — adjustable from 5 to 90 minutes (default 20)
- **Quick rules** — toggle equal playtime calculation and substitution alerts

### Roster

Build your squad:

- Add players with name, position, and optional target minutes
- Filter by position group (Forward, Midfield, Defense)
- Mark any player as goalkeeper (locked on field during the match)
- Mark players as injured (excluded from rotation)
- All fields are editable at any time before or between matches

### Live Dashboard

Run the match in real time:

- **Live clock** with play/pause controls
- **On-field cards** showing each player's current stint time and a progress bar toward their rotation interval
- **"SUB NOW" alert** pulses green when a player exceeds their rotation window and bench players are available
- **Bench list** showing rest duration for each waiting player
- **Injury button** on each on-field player instantly swaps them with the least-played bench player
- **Undo Sub** reverses the last substitution

### Stats

Review the match:

- Elapsed time, total substitutions made, and player count
- Bar chart showing playing time distribution by player (colored by position group)
- Full substitution log with timestamps

## Substitution Rules

| Rule | Behavior |
|------|----------|
| Equal playtime | The engine divides the game into rotation windows and selects the least-played outfield players for each window |
| Goalkeeper lock | GKs stay on field for the entire match and cannot be substituted unless injured |
| Injury handling | Injured players are immediately replaced by the bench player with the least accumulated time |
| Undo support | The last substitution can be reversed at any point during the match |

## Language Support

The app supports **English** and **Spanish**. A language toggle (🇬🇧 / 🇪🇸) is available in the bottom navigation bar and switches all UI text instantly.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| State | React Context + hooks (no external state library) |
| Deployment | [Vercel](https://vercel.com) |

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Dark theme, safe areas, custom styles
│   ├── layout.tsx           # Root layout with viewport meta
│   └── page.tsx             # Main page with tab routing + LanguageProvider
├── components/
│   ├── BottomNav.tsx        # Tab bar with language toggle
│   ├── GameSetup.tsx        # Competition type, duration, quick rules
│   ├── LiveDashboard.tsx    # Match clock, on-field/bench, sub controls
│   ├── PlayerRoster.tsx     # Player list with add/edit/remove/injury
│   └── StatsView.tsx        # Play time bars + substitution log
└── lib/
    ├── engine.ts            # Match initialization, sub/undo logic, time helpers
    ├── i18n.ts              # EN/ES translation dictionary
    ├── LanguageContext.tsx   # React context for language state
    └── types.ts             # TypeScript types, positions, field sizes
```

## Deploying to Vercel

This is a standard Next.js app with zero additional configuration needed:

1. Push the repo to GitHub
2. Import it at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Next.js and deploys

## License

MIT
