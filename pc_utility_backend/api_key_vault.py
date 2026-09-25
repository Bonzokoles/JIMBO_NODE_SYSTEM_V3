"""
API Key Vault Module for PC Utility Backend
Secure storage and management of API keys with encryption.
"""

import os
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from cryptography.fernet import Fernet
import sqlalchemy
from sqlalchemy import create_engine, Column, String, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import base64
import hashlib

router = APIRouter(prefix="/api/keys", tags=["api-keys"])

Base = declarative_base()

# Master key for encryption (should be from environment or keyring)
MASTER_KEY = os.getenv("PC_UTILITY_MASTER_KEY")
if not MASTER_KEY:
    # Generate a key for development (NEVER do this in production)
    MASTER_KEY = base64.urlsafe_b64encode(hashlib.sha256(b"dev_master_key").digest()).decode()
    print("WARNING: Using development master key. Set PC_UTILITY_MASTER_KEY environment variable for production!")

cipher = Fernet(MASTER_KEY.encode())

# Database setup
engine = create_engine("sqlite:///./keys.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class APIKeyModel(Base):
    """Database model for API keys"""
    __tablename__ = "api_keys"
    
    key_id = Column(String, primary_key=True, index=True)
    provider = Column(String, nullable=False)
    alias = Column(String)
    encrypted_key = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_used = Column(DateTime)
    encryption_enabled = Column(Boolean, default=True)
    auto_rotate = Column(Boolean, default=False)


# Create tables
Base.metadata.create_all(bind=engine)


class APIKeyStoreRequest(BaseModel):
    provider: str
    api_key: str
    alias: Optional[str] = None
    encryption_enabled: bool = True
    auto_rotation: bool = False


class APIKeyStoreResponse(BaseModel):
    key_id: str
    status: str
    provider: str
    alias: Optional[str]


class APIKeyRetrieveResponse(BaseModel):
    key_id: str
    api_key: str
    provider: str
    alias: Optional[str]
    last_used: Optional[str]


class APIKeyListItem(BaseModel):
    key_id: str
    provider: str
    alias: Optional[str]
    created_at: str
    last_used: Optional[str]


class APIKeyValidateRequest(BaseModel):
    key_id: str
    provider: str


# Supported providers
SUPPORTED_PROVIDERS = [
    "openai",
    "anthropic",
    "google",
    "cohere",
    "huggingface",
    "azure_openai",
    "aws_bedrock",
    "groq",
    "mistral",
    "custom",
]


def encrypt_key(api_key: str) -> str:
    """Encrypt API key using Fernet symmetric encryption"""
    try:
        encrypted = cipher.encrypt(api_key.encode())
        return encrypted.decode()
    except Exception as e:
        raise ValueError(f"Encryption failed: {str(e)}")


def decrypt_key(encrypted_key: str) -> str:
    """Decrypt API key"""
    try:
        decrypted = cipher.decrypt(encrypted_key.encode())
        return decrypted.decode()
    except Exception as e:
        raise ValueError(f"Decryption failed: {str(e)}")


@router.post("/store", response_model=APIKeyStoreResponse)
async def store_api_key(request: APIKeyStoreRequest):
    """Store API key securely with encryption"""
    try:
        # Validate provider
        if request.provider not in SUPPORTED_PROVIDERS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported provider. Must be one of: {', '.join(SUPPORTED_PROVIDERS)}"
            )
        
        # Validate API key
        if not request.api_key or len(request.api_key.strip()) == 0:
            raise HTTPException(status_code=400, detail="API key cannot be empty")
        
        # Encrypt the key
        encrypted_key = encrypt_key(request.api_key)
        
        # Generate unique key ID
        key_id = str(uuid.uuid4())
        
        # Store in database
        db = SessionLocal()
        try:
            db_key = APIKeyModel(
                key_id=key_id,
                provider=request.provider,
                alias=request.alias,
                encrypted_key=encrypted_key,
                encryption_enabled=request.encryption_enabled,
                auto_rotate=request.auto_rotation,
            )
            db.add(db_key)
            db.commit()
            db.refresh(db_key)
            
            return APIKeyStoreResponse(
                key_id=key_id,
                status="stored",
                provider=request.provider,
                alias=request.alias,
            )
        finally:
            db.close()
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store API key: {str(e)}")


@router.get("/retrieve/{key_id}", response_model=APIKeyRetrieveResponse)
async def retrieve_api_key(key_id: str):
    """Retrieve and decrypt API key"""
    try:
        db = SessionLocal()
        try:
            # Find key in database
            db_key = db.query(APIKeyModel).filter(APIKeyModel.key_id == key_id).first()
            
            if not db_key:
                raise HTTPException(status_code=404, detail="API key not found")
            
            # Decrypt the key
            decrypted_key = decrypt_key(db_key.encrypted_key)
            
            # Update last used timestamp
            db_key.last_used = datetime.utcnow()
            db.commit()
            
            return APIKeyRetrieveResponse(
                key_id=db_key.key_id,
                api_key=decrypted_key,
                provider=db_key.provider,
                alias=db_key.alias,
                last_used=db_key.last_used.isoformat() if db_key.last_used else None,
            )
        finally:
            db.close()
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve API key: {str(e)}")


@router.get("/list", response_model=List[APIKeyListItem])
async def list_api_keys(provider: Optional[str] = None):
    """List all stored API keys (metadata only, no actual keys)"""
    try:
        db = SessionLocal()
        try:
            query = db.query(APIKeyModel)
            
            # Filter by provider if specified
            if provider:
                query = query.filter(APIKeyModel.provider == provider)
            
            keys = query.all()
            
            return [
                APIKeyListItem(
                    key_id=key.key_id,
                    provider=key.provider,
                    alias=key.alias,
                    created_at=key.created_at.isoformat(),
                    last_used=key.last_used.isoformat() if key.last_used else None,
                )
                for key in keys
            ]
        finally:
            db.close()
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list API keys: {str(e)}")


@router.delete("/delete/{key_id}")
async def delete_api_key(key_id: str):
    """Delete an API key"""
    try:
        db = SessionLocal()
        try:
            db_key = db.query(APIKeyModel).filter(APIKeyModel.key_id == key_id).first()
            
            if not db_key:
                raise HTTPException(status_code=404, detail="API key not found")
            
            provider = db_key.provider
            db.delete(db_key)
            db.commit()
            
            return {
                "message": "API key deleted successfully",
                "key_id": key_id,
                "provider": provider,
            }
        finally:
            db.close()
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete API key: {str(e)}")


@router.post("/rotate")
async def rotate_api_key(key_id: str, new_api_key: str):
    """Rotate an API key with a new value"""
    try:
        if not new_api_key or len(new_api_key.strip()) == 0:
            raise HTTPException(status_code=400, detail="New API key cannot be empty")
        
        db = SessionLocal()
        try:
            db_key = db.query(APIKeyModel).filter(APIKeyModel.key_id == key_id).first()
            
            if not db_key:
                raise HTTPException(status_code=404, detail="API key not found")
            
            # Encrypt new key
            encrypted_key = encrypt_key(new_api_key)
            
            # Update in database
            db_key.encrypted_key = encrypted_key
            db_key.updated_at = datetime.utcnow()
            db.commit()
            
            return {
                "message": "API key rotated successfully",
                "key_id": key_id,
                "provider": db_key.provider,
                "updated_at": db_key.updated_at.isoformat(),
            }
        finally:
            db.close()
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to rotate API key: {str(e)}")


@router.post("/validate")
async def validate_api_key(request: APIKeyValidateRequest):
    """Validate API key with provider (basic validation)"""
    try:
        # Retrieve the key
        db = SessionLocal()
        try:
            db_key = db.query(APIKeyModel).filter(APIKeyModel.key_id == request.key_id).first()
            
            if not db_key:
                raise HTTPException(status_code=404, detail="API key not found")
            
            # Verify provider matches
            if db_key.provider != request.provider:
                return {
                    "valid": False,
                    "error": "Provider mismatch",
                    "expected": db_key.provider,
                    "provided": request.provider,
                }
            
            # Basic validation: ensure key is not empty after decryption
            try:
                decrypted_key = decrypt_key(db_key.encrypted_key)
                if not decrypted_key or len(decrypted_key.strip()) == 0:
                    return {"valid": False, "error": "Key is empty"}
            except:
                return {"valid": False, "error": "Failed to decrypt key"}
            
            # For now, return basic validation
            # In production, you would make actual API calls to validate
            return {
                "valid": True,
                "key_id": request.key_id,
                "provider": db_key.provider,
                "last_used": db_key.last_used.isoformat() if db_key.last_used else None,
                "note": "Basic validation passed. Full provider validation not implemented.",
            }
        finally:
            db.close()
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to validate API key: {str(e)}")


@router.get("/providers")
async def list_providers():
    """List all supported providers"""
    return {
        "providers": SUPPORTED_PROVIDERS,
        "total": len(SUPPORTED_PROVIDERS),
    }
