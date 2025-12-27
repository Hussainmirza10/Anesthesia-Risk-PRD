from typing import Annotated, Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, BeforeValidator

# Helper to handle ObjectId as string
PyObjectId = Annotated[str, BeforeValidator(str)]

class PatientDemographics(BaseModel):
    id: Optional[str] = None
    name: str
    dob: str
    age: int
    gender: str
    heightCm: float
    weightKg: float
    bmi: float

class MedicalHistory(BaseModel):
    conditions: List[str]
    surgeries: List[str]
    allergies: List[str]
    medications: List[str]
    smokingStatus: str
    alcoholUse: str
    drugUse: str

class AirwayExam(BaseModel):
    mallampatiScore: str
    thyromentalDistanceCm: Optional[float] = None
    mouthOpeningCm: Optional[float] = None
    neckMobility: str

class Recommendation(BaseModel):
    id: str
    text: str
    category: str
    checked: bool

class Patient(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    owner_id: Optional[PyObjectId] = None
    demographics: PatientDemographics
    medicalHistory: MedicalHistory
    airwayExam: AirwayExam
    recommendations: Optional[List[Recommendation]] = []
    clinicianNotes: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class User(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class AuditLog(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    patient_id: PyObjectId
    user_id: PyObjectId
    user_email: Optional[str] = None # Include email for display
    action: str
    details: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class AuditLogCreate(BaseModel):
    action: str
    details: str