import asyncio
import random
import time
from dataclasses import dataclass
from typing import Callable, Dict, List, Optional

import httpx
from tenacity import retry, stop_after_attempt, wait_fixed

from config import Settings

ITEM_CATALOG = [
    {
        "title": "Veyla the Shadow Lich",
        "brand": "Necromancer",
        "category": "Legendary",
        "variant": "INT 95 | STR 42 | VIT 68 | AGI 54",
        "condition": "Hero",
        "colorway": "Arcane",
        "releaseYear": 2025,
        "specs": "Master of shadow flames and soul drain.",
        "imageUrl": "/pets/craftpix-net-935193-free-chibi-necromancer-of-the-shadow-character-sprites/necromancer_of_the_shadow_1/card/frame_0.png",
    },
    {
        "title": "Elyra Nocturne",
        "brand": "Oracle",
        "category": "Epic",
        "variant": "INT 88 | STR 34 | VIT 60 | AGI 58",
        "condition": "Hero",
        "colorway": "Umbral",
        "releaseYear": 2025,
        "specs": "Seer of eclipses, whispers prophecies.",
        "imageUrl": "/pets/craftpix-net-919731-free-chibi-dark-oracle-character-sprites/dark_oracle_1/card/frame_0.png",
    },
    {
        "title": "Morr Wispblade",
        "brand": "Reaper",
        "category": "Rare",
        "variant": "STR 68 | INT 64 | VIT 58 | AGI 72",
        "condition": "Hero",
        "colorway": "Wraith",
        "releaseYear": 2025,
        "specs": "Edge of dusk; silent executioner.",
        "imageUrl": "/pets/craftpix-904589-free-reaper-man-chibi-2d-game-sprites/reaper_man_1/card/frame_1.png",
    },
    {
        "title": "Sigrun Dawnbreak",
        "brand": "Valkyrie",
        "category": "Legendary",
        "variant": "STR 90 | VIT 82 | AGI 70 | INT 48",
        "condition": "Hero",
        "colorway": "Sunsteel",
        "releaseYear": 2025,
        "specs": "Skyrider who guards fallen champions.",
        "imageUrl": "/pets/craftpix-net-469596-free-chibi-valkyrie-character-sprites/valkyrie_1/card/frame_3.png",
    },
    {
        "title": "Dresh Wildarrow",
        "brand": "Ranger",
        "category": "Common",
        "variant": "STR 58 | AGI 68 | VIT 52 | INT 24",
        "condition": "Hero",
        "colorway": "Verdant",
        "releaseYear": 2025,
        "specs": "Quickdraw hunter of the wild clans.",
        "imageUrl": "/pets/craftpix-064112-free-orc-ogre-and-goblin-chibi-2d-game-sprites/orc/card/frame_0.png",
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
    def __init__(
        self,
        username: str,
        password: str,
        settings: Settings,
        client: httpx.AsyncClient,
        log_fn: Optional[Callable[[str, str, Dict], None]] = None,
    ):
        self.username = username
        self.password = password
        self.settings = settings
        self.client = client
        self.log_fn = log_fn
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
            if self.log_fn:
                self.log_fn(self.username, "topup", {"delta": delta})

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
            if self.log_fn:
                self.log_fn(self.username, "mystery", {})

    async def list_live_auctions(self) -> List[Dict]:
        resp = await self.client.get(
            self.settings.api_base + "auctions?filter=live&pageSize=10", headers=self.auth_headers()
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("results", []) if isinstance(data, dict) else []

    async def create_auction(self):
        if len(self.active_auctions) >= self.settings.max_active_auctions_per_bot:
            return
        item = random.choice(ITEM_CATALOG)
        end_date = time.time() + 3600 * 24  # 24h from now
        payload = {
            **item,
            "reservePrice": random.randint(300, 1500),
            "auctionEnd": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(end_date)),
        }
        resp = await self.client.post(
            self.settings.api_base + "auctions", json=payload, headers=self.auth_headers()
        )
        if resp.status_code == 401:
            await self.login()
            resp = await self.client.post(
                self.settings.api_base + "auctions", json=payload, headers=self.auth_headers()
            )
        if resp.is_success:
            auction = resp.json()
            if isinstance(auction, dict) and auction.get("id"):
                self.active_auctions.append(auction["id"])
                self.stats.auctions_created += 1
                if self.log_fn:
                    self.log_fn(
                        self.username,
                        "create-auction",
                        {"id": auction["id"], "title": item["title"]},
                    )

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
            if self.log_fn:
                self.log_fn(self.username, "bid", {"auctionId": auction_id, "amount": next_bid})
        else:
            self.stats.failures += 1
            self.stats.last_error = resp.text

    async def tick(self):
        await self.ensure_token()

        await self.top_up_if_needed()

        if time.time() - self.last_daily > self.settings.daily_interval_hours * 3600:
            await self.award("daily-login")
            self.last_daily = time.time()

        await self.open_mystery()

        if random.random() < (self.settings.create_rate_per_min / 60):
            await self.create_auction()

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
