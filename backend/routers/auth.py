from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from config import settings
from database import db
from models import Token, User, UserCreate, UserInDB
from security import (
    create_access_token,
    get_password_hash,
    verify_password,
)

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["auth"],
)

@router.post("/signup", response_model=User)
async def signup(user: UserCreate):
    # Check if user already exists
    if db.client is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    existing_user = await db.client.get_default_database()["users"].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user.password)
    user_in_db = UserInDB(
        email=user.email,
        hashed_password=hashed_password
    )
    
    new_user_result = await db.client.get_default_database()["users"].insert_one(
        user_in_db.model_dump(by_alias=True)
    )
    
    created_user = await db.client.get_default_database()["users"].find_one(
        {"_id": new_user_result.inserted_id}
    )
    
    return User(**created_user)

@router.post("/login", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    if db.client is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    user = await db.client.get_default_database()["users"].find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(seconds=settings.JWT_EXPIRES_IN)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}