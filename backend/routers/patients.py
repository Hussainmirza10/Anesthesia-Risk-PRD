from typing import List, Annotated
from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo import ReturnDocument

from database import db
from models import Patient, User, AuditLog, AuditLogCreate
from security import get_current_user

router = APIRouter(
    prefix="/api/v1/patients",
    tags=["patients"],
)

@router.get("/", response_model=List[Patient])
async def list_patients(
    current_user: Annotated[User, Depends(get_current_user)]
):
    if db.client is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    
    patients = await db.client.get_default_database()["patients"].find(
        {"owner_id": current_user.id}
    ).to_list(1000)
    
    return patients

@router.post("/", response_model=Patient)
async def create_patient(
    patient: Patient,
    current_user: Annotated[User, Depends(get_current_user)]
):
    if db.client is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    patient_dict = patient.model_dump(by_alias=True, exclude=["id", "owner_id"])
    patient_dict["owner_id"] = current_user.id
    patient_dict["created_at"] = datetime.utcnow()
    patient_dict["updated_at"] = datetime.utcnow()

    new_patient = await db.client.get_default_database()["patients"].insert_one(patient_dict)
    
    created_patient = await db.client.get_default_database()["patients"].find_one(
        {"_id": new_patient.inserted_id}
    )
    
    return created_patient

@router.get("/{id}", response_model=Patient)
async def get_patient(
    id: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    if db.client is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid patient ID")

    patient = await db.client.get_default_database()["patients"].find_one(
        {"_id": ObjectId(id), "owner_id": current_user.id}
    )
    
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    return patient

@router.put("/{id}", response_model=Patient)
async def update_patient(
    id: str,
    patient: Patient,
    current_user: Annotated[User, Depends(get_current_user)]
):
    if db.client is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid patient ID")

    patient_dict = patient.model_dump(by_alias=True, exclude=["id", "owner_id", "created_at"])
    patient_dict["updated_at"] = datetime.utcnow()

    updated_patient = await db.client.get_default_database()["patients"].find_one_and_update(
        {"_id": ObjectId(id), "owner_id": current_user.id},
        {"$set": patient_dict},
        return_document=ReturnDocument.AFTER
    )

    if updated_patient is None:
         raise HTTPException(status_code=404, detail="Patient not found")
         
    return updated_patient

@router.get("/{id}/audit-logs", response_model=List[AuditLog])
async def get_audit_logs(
    id: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    if db.client is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid patient ID")

    # Verify patient exists and belongs to user (or user has access)
    patient = await db.client.get_default_database()["patients"].find_one(
        {"_id": ObjectId(id), "owner_id": current_user.id}
    )
    if not patient:
         raise HTTPException(status_code=404, detail="Patient not found")

    logs = await db.client.get_default_database()["audit_logs"].find(
        {"patient_id": id}
    ).sort("timestamp", -1).to_list(1000)

    # Enrich with user email (in a real app, might want to join or cache)
    for log in logs:
        if log.get("user_id"):
             # For now, just using the current user's email if it matches,
             # otherwise we might need to fetch the user.
             # Simpler for this MVP: just return what we have, maybe add email to the log on create.
             pass

    return logs

@router.post("/{id}/audit-logs", response_model=AuditLog)
async def create_audit_log(
    id: str,
    log_entry: AuditLogCreate,
    current_user: Annotated[User, Depends(get_current_user)]
):
    if db.client is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid patient ID")

    # Verify patient exists
    patient = await db.client.get_default_database()["patients"].find_one(
        {"_id": ObjectId(id), "owner_id": current_user.id}
    )
    if not patient:
         raise HTTPException(status_code=404, detail="Patient not found")

    log_dict = log_entry.model_dump()
    log_dict.update({
        "patient_id": id,
        "user_id": current_user.id,
        "user_email": current_user.email,
        "timestamp": datetime.utcnow()
    })

    new_log = await db.client.get_default_database()["audit_logs"].insert_one(log_dict)
    
    created_log = await db.client.get_default_database()["audit_logs"].find_one(
        {"_id": new_log.inserted_id}
    )
    
    return created_log