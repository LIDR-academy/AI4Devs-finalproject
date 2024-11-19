from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from services.classification_service import ClassificationService
from typing import List
from models.classification import Classification

router = APIRouter()

@router.post("/contributors/{contributor_id}/classify")
async def classify_contributor(
    contributor_id: int,
    db: Session = Depends(get_db)
):
    service = ClassificationService(db)
    try:
        classification = service.classify_contributor(contributor_id)
        return classification
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/contributors/{contributor_id}/classification")
async def get_classification(
    contributor_id: int,
    db: Session = Depends(get_db)
):
    classification = db.query(Classification)\
        .filter(Classification.contribuyente_id == contributor_id)\
        .order_by(Classification.fecha_clasificacion.desc())\
        .first()
    
    if not classification:
        raise HTTPException(status_code=404, detail="Clasificación no encontrada")
    
    return classification 