from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user
from ..services.budget import get_settings

router = APIRouter(prefix="/api/settings", tags=["settings"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=schemas.SettingsOut)
def read_settings(db: Session = Depends(get_db)):
    return get_settings(db)


@router.put("", response_model=schemas.SettingsOut)
def update_settings(body: schemas.SettingsIn, db: Session = Depends(get_db)):
    s = get_settings(db)
    for k, v in body.model_dump().items():
        setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return s
