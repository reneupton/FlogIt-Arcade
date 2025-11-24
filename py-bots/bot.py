import asyncio
import random
import time
from dataclasses import dataclass
from typing import Dict, List, Optional

import httpx
from tenacity import retry, stop_after_attempt, wait_fixed

from config import Settings

ITEM_CATALOG = [
    {
        "title": "Nebula Pro Mechanical Keyboard",
        "brand": "Lumos",
        "category": "Keyboard",
        "variant": "75% RGB Tri-mode",
        "condition": "New",
        "colorway": "White Ice",
        "releaseYear": 2024,
        "specs": "Gateron Oil King | PBT caps | Hot-swap",
        "imageUrl": "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "title": "Atlas X Wireless Gaming Mouse",
        "brand": "Glacier",
        "category": "Mouse",
        "variant": "58g / 4K Hz",
        "condition": "New",
        "colorway": "Lunar Grey",
        "releaseYear": 2024,
        "specs": "PixArt 3395 | 4K dongle | 58g",
        "imageUrl": "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "title": "Pulse 34\" Ultrawide Monitor",
        "brand": "Pulseview",
        "category": "Monitor",
        "variant": "144Hz UWQHD",
        "condition": "Open-Box",
        "colorway": "Shadow Black",
        "releaseYear": 2023,
        "specs": "3440x1440 | 144Hz | 1ms | HDR10",
        "imageUrl": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80",
    },
]


@dataclass
class BotStats:
    bids_placed: int = 0
    auctions_created: int = 0
    mysteries_opened: int = 0
    failures: int = 0
    last_error: Optional[str] = None


class AuctionBot:
    def __init__(self, username: str, password: str, settings: Settings, client: httpx.AsyncClient):
        self.username = username
        self.password = password
        self.settings = settings
        self.client = client
        self.token: Optional[str] = None
        self.token_expires_at: float = 0
        self.stats = BotStats()
        self.last_daily: float = 0
        self.last_mystery: float = 0
        self.active_auctions: List[str] = []

    async def login(self):
        token_url = (self.settings.identity_url or self.settings.api_base).rstrip("/") + "/connect/token"
        data = {
            "grant_type": "password",
            "client_id": "pybot",
            "client_secret": "NotASecret",
            "username": self.username,
            "password": self.password,
            "scope": "openid profile auctionApp",
        }
        resp = await self.client.post(token_url, data=data)
        resp.raise_for_status()
        payload = resp.json()
        self.token = payload.get("access_token")
        expires_in = payload.get("expires_in", 3600)
        self.token_expires_at = time.time() + expires_in - 60  # refresh 1 minute early

    def auth_headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    async def ensure_token(self):
        if not self.token or time.time() > self.token_expires_at:
            await self.login()

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
    async def fetch_profile(self) -> Optional[Dict]:
        await self.ensure_token()
        resp = await self.client.get(self.settings.api_base + "progress/me", headers=self.auth_headers())
        if resp.status_code == 401:
            await self.login()
            resp = await self.client.get(self.settings.api_base + "progress/me", headers=self.auth_headers())
        resp.raise_for_status()
        return resp.json()

    async def top_up_if_needed(self):
        if not self.settings.auto_topup:
            return
        profile = await self.fetch_profile()
        if not profile:
            return
        balance = profile.get("flogBalance", 0)
        if balance < self.settings.min_balance:
            delta = self.settings.min_balance - balance
            await self.award("admin-topup", delta)

    async def award(self, action: str, amount: Optional[int] = None):
        payload = {"action": action}
        if amount:
            payload["amount"] = amount
        resp = await self.client.post(
            self.settings.api_base + "progress/award", json=payload, headers=self.auth_headers()
        )
        if resp.status_code == 401:
            await self.login()
            resp = await self.client.post(
                self.settings.api_base + "progress/award", json=payload, headers=self.auth_headers()
            )
        if resp.is_success:
            return resp.json()
        else:
            self.stats.failures += 1
            self.stats.last_error = resp.text
            return None

    async def open_mystery(self):
        now = time.time()
        if now - self.last_mystery < self.settings.mystery_interval_min * 60:
            return
        resp = await self.client.post(
            self.settings.api_base + "progress/mystery", json={}, headers=self.auth_headers()
        )
        if resp.status_code == 401:
            await self.login()
            resp = await self.client.post(
                self.settings.api_base + "progress/mystery", json={}, headers=self.auth_headers()
            )
        if resp.is_success:
            self.last_mystery = now
            self.stats.mysteries_opened += 1

    async def list_live_auctions(self) -> List[Dict]:
        resp = await self.client.get(self.settings.api_base + "auctions?filter=live&pageSize=10", headers=self.auth_headers())
        resp.raise_for_status()
        data = resp.json()
        return data.get("results", []) if isinstance(data, dict) else []

    async def create_auction(self):
        if len(self.active_auctions) >= self.settings.max_active_auctions_per_bot:
            return
        item = random.choice(ITEM_CATALOG)
        end_date = (time.time() + 3600 * 24)  # 24h from now
        payload = {
          **item,
          "reservePrice": random.randint(300, 1500),
          "auctionEnd": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(end_date))
        }
        resp = await self.client.post(self.settings.api_base + "auctions", json=payload, headers=self.auth_headers())
        if resp.status_code == 401:
            await self.login()
            resp = await self.client.post(self.settings.api_base + "auctions", json=payload, headers=self.auth_headers())
        if resp.is_success:
            auction = resp.json()
            if isinstance(auction, dict) and auction.get("id"):
                self.active_auctions.append(auction["id"])
                self.stats.auctions_created += 1

    async def place_bid(self, auction: Dict):
        auction_id = auction.get("id")
        current = auction.get("currentHighBid", 0)
        next_bid = current + random.randint(5, 25)
        payload = {"amount": next_bid}
        resp = await self.client.post(
            f"{self.settings.api_base}bids/{auction_id}",
            json=payload,
            headers=self.auth_headers(),
        )
        if resp.status_code == 401:
            await self.login()
            resp = await self.client.post(
                f"{self.settings.api_base}bids/{auction_id}",
                json=payload,
                headers=self.auth_headers(),
            )
        if resp.is_success:
            self.stats.bids_placed += 1
        else:
            self.stats.failures += 1
            self.stats.last_error = resp.text

    async def tick(self):
        # Login if needed
        await self.ensure_token()

        await self.top_up_if_needed()

        # Daily login award (once per day)
        if time.time() - self.last_daily > self.settings.daily_interval_hours * 3600:
            await self.award("daily-login")
            self.last_daily = time.time()

        await self.open_mystery()

        # Create auctions (throttled)
        if random.random() < (self.settings.create_rate_per_min / 60):
            await self.create_auction()

        # Bid on live auctions (throttled)
        if random.random() < (self.settings.bid_rate_per_min / 60):
            auctions = await self.list_live_auctions()
            random.shuffle(auctions)
            attempts = 0
            for a in auctions:
                if attempts >= self.settings.max_bids_per_auction:
                    break
                if a.get("seller") == self.username:
                    continue
                await self.place_bid(a)
                attempts += 1


async def run_bots(settings: Settings):
    users = [u.strip() for u in settings.bot_users.split(",") if u.strip()]
    async with httpx.AsyncClient(timeout=10) as client:
        bots = [AuctionBot(u, settings.bot_password, settings, client) for u in users]

        async def loop_bot(bot: AuctionBot):
            while True:
                try:
                    await bot.tick()
                except Exception as exc:
                    bot.stats.failures += 1
                    bot.stats.last_error = str(exc)
                await asyncio.sleep(1)

        await asyncio.gather(*(loop_bot(bot) for bot in bots))


if __name__ == "__main__":
    settings = Settings()
    asyncio.run(run_bots(settings))
