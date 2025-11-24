# Bots & Admin Console Work Plan

This document captures the scope and implementation steps for two add-ons to FlogIt-Tech:
1) A Python bot service that simulates user activity (auctions, bids, rewards) for demo traffic.
2) An Angular-based admin console to manage users, balances, auctions, and bots.

The goal is to keep them decoupled from the main app but able to target the existing Gateway/API endpoints.

---

## Python Bot Service (short-term deliverable in this repo)

### Objectives
- Simulate realistic demo traffic: create auctions, place bids, and claim gamification rewards.
- Keep balances reasonable (no negative balances unless explicitly allowed for demo).
- Expose simple health/stats for monitoring.
- Be easy to configure via environment variables and container-friendly.

### API Usage (existing services)
- Auth via Identity/Gateway using seeded demo users (e.g., bot1/bot2…).
- Auction endpoints: list live auctions, create auctions.
- Bid endpoints: place bids (respect holds/refunds).
- Progress endpoints: `progress/me`, `progress/award` (daily-login, bid, list), `progress/mystery`.

### Configuration (env vars)
- `API_BASE` (e.g., http://localhost:6001/)
- `IDENTITY_URL` (for token acquisition, if needed separately)
- `BOT_USERS` (comma-separated usernames to rotate) and `BOT_PASSWORD` (shared demo password), or `CLIENT_ID/CLIENT_SECRET` if using a confidential client.
- Rates: `BID_RATE_PER_MIN`, `CREATE_RATE_PER_MIN`, `MYSTERY_INTERVAL_MIN`, `DAILY_INTERVAL_HOURS`
- Limits: `MAX_BIDS_PER_AUCTION`, `MAX_ACTIVE_AUCTIONS_PER_BOT`, `MIN_BALANCE`, `AUTO_TOPUP` (true/false)
- Scope: optional `CATEGORIES` allowlist.

### Behaviors
- Auth: login and cache tokens; refresh before expiry.
- Auction creation: pick from a local catalog of gaming gear names/specs/images; honor `MAX_ACTIVE_AUCTIONS_PER_BOT`.
- Bidding: fetch live auctions, skip own auctions, cap per-auction attempts, stay within balance (or top-up if allowed).
- Rewards: call daily-login (award) and mystery endpoints on cadence.
- Telemetry: in-memory counters (bids placed, auctions created, failures); health/stats endpoint or stdout logs.

### Safety
- Per-bot rate limiting, max bids per auction, randomized delays/jitter.
- Skip bidding on own auctions; cap bid increments.

### Deployment
- Separate folder `py-bots/` with `requirements.txt`, `config.py`, `bot.py`, `main.py`.
- Container-friendly: single entrypoint `python -m main`.
- Compose integration: add a service that depends on gateway; pass env vars.

---

## Angular Admin Console (future deliverable, separate repo)

### Objectives
- Showcase Angular in a separate portfolio entry.
- Provide controls to manage demo data and bots without auth complexity (use a simple admin header token or IP allowlist).

### API surface to add (via Gateway/admin routes)
- Users (Progress/BidDb):
  - List users, adjust FLOG/XP/level, set avatar URL.
  - Reset daily/mystery cooldowns.
  - View held bids, bids placed, auctions won/sold.
- Auctions (Auction/Search):
  - List/search, edit fields (title/brand/category/specs/reserve/end time/status).
  - Force-finish/cancel, reindex in Search.
- Bots:
  - Start/stop bot workers, set bid/create rates, toggle daily/mystery actions.
  - View live bot stats exposed by the Python bot service.
- Leaderboard: view and optionally pin demo leaders.

### UI pages
- Dashboard: key stats (active auctions, bids/min, bot status).
- Users: table + edit drawer (FLOG/XP/level/avatar/reset cooldowns).
- Auctions: table + quick actions (edit, finish, cancel, reindex).
- Bots: controls (start/stop, rate sliders), live stats feed.
- Logs (optional): stream bot/service events.

### Deployment
- Angular 17+, standalone components, Angular Material or Tailwind.
- Built static assets served behind gateway or CDN; configure CORS for admin origin.
- Use a single admin token header or IP allowlist for demo.

### Backend work required
- Add admin endpoints to Gateway and underlying services (Auction, Bid/Progress, Search).
- Honor a shared admin token header; avoid exposing in public UI.
- Expose bot stats/control endpoints from the bot service.

---

## Suggested Implementation Sequence
1) Finish Python bot service (in this repo for now) with env-driven config and basic actions (login, create auction, place bid, claim daily/mystery).
2) Add admin API endpoints in Gateway/Backend to support user/auction adjustments and bot control.
3) Scaffold Angular admin console (separate repo) and point it at the admin APIs; add CORS/admin token.
