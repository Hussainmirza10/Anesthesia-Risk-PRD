from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import db
from routers import auth, patients

@asynccontextmanager
async def lifespan(app: FastAPI):
    db.connect()
    yield
    db.close()

app = FastAPI(lifespan=lifespan)

app.include_router(auth.router)
app.include_router(patients.router)

origins = settings.CORS_ORIGINS.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
async def healthz():
    is_connected = False
    if db.client:
        try:
            # ping the database
            await db.client.admin.command('ping')
            is_connected = True
        except Exception:
            is_connected = False
    
    return {"status": "ok", "db": "connected" if is_connected else "disconnected"}
# Force reload for env update
# Trigger reload for env update