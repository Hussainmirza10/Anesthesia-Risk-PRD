from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

class Database:
    client: AsyncIOMotorClient = None

    def connect(self):
        self.client = AsyncIOMotorClient(settings.MONGODB_URI)

    def close(self):
        if self.client:
            self.client.close()

db = Database()

async def get_database():
    return db.client.get_default_database()