import os
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import db
from routers import auth, patients

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        db.connect()
        # Force a connection check on startup
        if db.client:
            await db.client.admin.command('ping')
            print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"Startup connection failed: {e}")
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
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)