from pydantic import BaseSettings, AnyHttpUrl
from typing import List, Optional


class Settings(BaseSettings):
    api_base: AnyHttpUrl = "http://localhost:6001/"
    identity_url: Optional[AnyHttpUrl] = "http://localhost:5000/"

    bot_users: str = "bot1,bot2"
    bot_password: str = "password"

    bid_rate_per_min: int = 4
    create_rate_per_min: int = 1
    mystery_interval_min: int = 60
    daily_interval_hours: int = 24

    max_bids_per_auction: int = 3
    max_active_auctions_per_bot: int = 2
    min_balance: int = 500
    auto_topup: bool = False

    categories: List[str] = ["Keyboard", "Mouse", "Monitor", "GPU", "Headset", "PC", "Chair"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
