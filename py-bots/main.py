import asyncio
import logging

from config import Settings
from bot import run_bots


logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")


if __name__ == "__main__":
    settings = Settings()
    logging.info("Starting bots with settings: %s", settings.dict())
    asyncio.run(run_bots(settings))
