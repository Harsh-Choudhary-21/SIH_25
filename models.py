from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ClaimStatus(str, Enum):
    granted = "granted"
    pending = "pending"
    rejected = "rejected"

class ClaimCreate(BaseModel):
    claimant_name: str = Field(..., min_length=1, description="Name of the claimant")
    village: str = Field(..., min_length=1, description="Village name")
    area: float = Field(..., ge=0, description="Area in hectares")
    status: ClaimStatus = Field(..., description="Claim status")
    
class ClaimResponse(BaseModel):
    id: int
    claimant_name: str
    village: str
    area: float
    status: str
    created_at: datetime
    updated_at: datetime

class SchemeCreate(BaseModel):
    scheme_name: str = Field(..., min_length=1)
    description: Optional[str] = None
    eligibility_rules: Dict[str, Any] = Field(default_factory=dict)

class SchemeResponse(BaseModel):
    id: int
    scheme_name: str
    description: Optional[str]
    eligibility_rules: Dict[str, Any]
    created_at: datetime

class RecommendationCreate(BaseModel):
    claim_id: int
    scheme_id: int
    score: float = Field(..., ge=0, le=1)

class RecommendationResponse(BaseModel):
    id: int
    claim_id: int
    scheme_id: int
    scheme_name: str
    score: float
    created_at: datetime

class UploadResponse(BaseModel):
    success: bool
    message: str
    claim: Optional[ClaimResponse] = None
    extracted_data: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None